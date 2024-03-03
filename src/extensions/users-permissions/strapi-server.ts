import { Strapi } from '@strapi/strapi';
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
module.exports = (plugin)=>{
  plugin.controllers.user.updateMe = async (ctx) =>{
    if(!ctx.state.user || !ctx.state.user.id){
      return ctx.response.status = 401;
    }
    await strapi.entityService.update('plugin::users-permissions.user', ctx.state.user.id, {
      data: ctx.request.body
    }).then(async (res)=>{

      const username = res.username;
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
      
      const usernameCommand = new PutObjectCommand(usernameInput)
      const userIdCommand = new PutObjectCommand(userIdInput)

      const usernameRes = await client.send(usernameCommand)
      const userIdRes = await client.send(userIdCommand)

      res.password = null;
      res.resetPasswordToken = null;
      ctx.response.status = 200;
      ctx.response.body = res
    })
  }

  plugin.controllers.user.getByUserName = async (ctx) =>{

    let username = getUsername(ctx.request.url);
    const entry = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { username }
    })
    // await strapi.entityService.get('plugin::users-permissions.user', ctx.state.user.id, {
    //   data: ctx.request.body
    // }).then((res)=>{
      ctx.response.status = 200;
    //   ctx.response.body = res
    // })
    
  }

  plugin.routes['content-api'].routes.push(
    {
      method: 'PUT',
      path: '/user/me',
      handler: 'user.updateMe',
      config: {
        prefix: "",
        policies: []
      }
    },
    {
      method: 'GET',
      path: '/user/find/:username',
      handler: 'user.getByUserName',
      config: {
        prefix: "",
        policies: []
      }
    }
  )
  

  function getUsername(url) {
    let end = url.split("/")[url.split("/").length-1]
    return end.split('?')[0]
  }

  return plugin
}