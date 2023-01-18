import { Strapi } from '@strapi/strapi';
module.exports = (plugin)=>{

  plugin.controllers.user.updateMe = async (ctx) =>{
    if(!ctx.state.user || !ctx.state.user.id){
      return ctx.response.status = 401;
    }
    await strapi.entityService.update('plugin::users-permissions.user', ctx.state.user.id, {
      data: ctx.request.body
    }).then((res)=>{
      ctx.response.status = 200;
      ctx.response.body = res
    })
  }

  plugin.controllers.user.getByUserName = async (ctx) =>{

    console.log("GETTINGUPTOHERE\n\n\n\n", ctx.request.url);
    console.log(getUsername(ctx.request.url));
    let username = getUsername(ctx.request.url);
    const entry = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { username }
    })
    console.log("TETTING ENTRY", entry);
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