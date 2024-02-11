import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, ListBucketsCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.CF_ACCESS_KEY_ID,
    secretAccessKey: process.env.CF_ACCESS_SECRET,
  },
  endpoint: process.env.CF_ENDPOINT_ABS

})


module.exports = {
  async signupAction(ctx, next) {
    
    let userId = uuidv4();
    let email = ctx.request.body['email'] || "contact@vishalpandey.co.in"
 
    let reqBody = {
      "username": userId,
      "email": email,
      "password": userId,
      "role": {
          "connect": [
              {
                  "id": "1"
              }
          ]
      },
      "userId": userId
    }
    
    let url = "http://localhost:1337/api/users"
    let res:any;

    try {
      res = await axios.post(url, reqBody)

      const username = userId;
      let data = await axios.get(`http://localhost:1337/api/users/?filters[$or][0][username][$eq]=${username}&filters[$or][1][userId][$eq]=${username}&populate=deep`)
      data = data.data
      
      const usernameInput = {
        "Body": JSON.stringify(data),
        "Bucket": process.env.CF_BUCKET,
        "Key": `api/${username}.json`,
        "ContentType": "application/json",        
      }

      const usernameCommand = new PutObjectCommand(usernameInput)
      const usernameRes = await client.send(usernameCommand)

      ctx.body = res.data;
    } catch (error) {
      ctx.body = error.response.data
      ctx.status = error.response.data.error.status
    }
  } 
}
