import { S3Client, ListBucketsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import axios from 'axios';

const client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.CF_ACCESS_KEY_ID,
    secretAccessKey: process.env.CF_ACCESS_SECRET,
  },
  endpoint: process.env.CF_ENDPOINT_ABS

})

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    
    strapi.db.lifecycles.subscribe({
      models: ['plugin::users-permissions.user'],
      async afterCreate(event) {
        await pushToR3(event)
        return true
      },
      async afterUpdate(event) {
        await pushToR3(event)
        return true
      },
    });
  },
};

async function pushToR3(event) {
  let username = event?.result?.username

  console.log("CHECKING USERNAME\n\n\n\n", username, "\n\n\n\n\n USERNAME")

  let data = await axios.get(`http://${process.env.HOST}:${process.env.PORT}/api/users/?filters[$or][0][username][$eq]=${username}&filters[$or][1][userId][$eq]=${username}&populate=deep`)
  data = data.data
  
  const usernameInput = {
    "Body": JSON.stringify(data),
    "Bucket": process.env.CF_BUCKET,
    "Key": `api/${username}.json`,
    "ContentType": "application/json",        
  }
  
  const userId = data[0]?.userId
  const userIdInput = {
    "Body": JSON.stringify(data),
    "Bucket": process.env.CF_BUCKET,
    "Key": `api/${userId}.json`,
    "ContentType": "application/json",        
  }
  
  console.log(usernameInput, "CHECKING HEREE");
  const usernameCommand = new PutObjectCommand(usernameInput)
  const userIdCommand = new PutObjectCommand(userIdInput)

  const usernameRes = await client.send(usernameCommand)
  const userIdRes = await client.send(userIdCommand)
}