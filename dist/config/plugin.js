"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ({ env }) => ({
    upload: {
        config: {
            provider: 'aws-s3',
            providerOptions: {
                accessKeyId: env('AWS_ACCESS_KEY_ID'),
                secretAccessKey: env('AWS_ACCESS_SECRET'),
                region: env('AWS_REGION', 'ap-south-1'),
                params: {
                    Bucket: env('AWS_BUCKET_NAME', 'hicard'),
                },
            },
        },
    }
});