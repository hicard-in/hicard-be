"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const axios_1 = __importDefault(require("axios"));
const client = new client_s3_1.S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.CF_ACCESS_KEY_ID,
        secretAccessKey: process.env.CF_ACCESS_SECRET,
    },
    endpoint: process.env.CF_ENDPOINT_ABS
});
module.exports = (plugin) => {
    plugin.controllers.user.updateMe = async (ctx) => {
        if (!ctx.state.user || !ctx.state.user.id) {
            return ctx.response.status = 401;
        }
        await strapi.entityService.update('plugin::users-permissions.user', ctx.state.user.id, {
            data: ctx.request.body
        }).then(async (res) => {
            var _a;
            const username = res.username;
            let data = await axios_1.default.get(`http://localhost:1337/api/users/?filters[$or][0][username][$eq]=${username}&filters[$or][1][userId][$eq]=${username}&populate=deep`);
            data = data.data;
            const usernameInput = {
                "Body": JSON.stringify(data),
                "Bucket": process.env.CF_BUCKET,
                "Key": `api/${username}.json`,
                "ContentType": "application/json",
            };
            const userId = (_a = data[0]) === null || _a === void 0 ? void 0 : _a.userId;
            const userIdInput = {
                "Body": JSON.stringify(data),
                "Bucket": process.env.CF_BUCKET,
                "Key": `api/${userId}.json`,
                "ContentType": "application/json",
            };
            const usernameCommand = new client_s3_1.PutObjectCommand(usernameInput);
            const userIdCommand = new client_s3_1.PutObjectCommand(userIdInput);
            const usernameRes = await client.send(usernameCommand);
            const userIdRes = await client.send(userIdCommand);
            console.log(usernameRes, userIdRes);
            res.password = null;
            res.resetPasswordToken = null;
            ctx.response.status = 200;
            ctx.response.body = res;
        });
    };
    plugin.controllers.user.getByUserName = async (ctx) => {
        let username = getUsername(ctx.request.url);
        const entry = await strapi.db.query('plugin::users-permissions.user').findOne({
            where: { username }
        });
        // await strapi.entityService.get('plugin::users-permissions.user', ctx.state.user.id, {
        //   data: ctx.request.body
        // }).then((res)=>{
        ctx.response.status = 200;
        //   ctx.response.body = res
        // })
    };
    plugin.routes['content-api'].routes.push({
        method: 'PUT',
        path: '/user/me',
        handler: 'user.updateMe',
        config: {
            prefix: "",
            policies: []
        }
    }, {
        method: 'GET',
        path: '/user/find/:username',
        handler: 'user.getByUserName',
        config: {
            prefix: "",
            policies: []
        }
    });
    function getUsername(url) {
        let end = url.split("/")[url.split("/").length - 1];
        return end.split('?')[0];
    }
    return plugin;
};
