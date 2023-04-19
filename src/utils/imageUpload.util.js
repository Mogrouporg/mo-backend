const AWS = require('aws-sdk');
const fs = require('fs');
require('dotenv').config()

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});

const s3 = new AWS.S3();

exports.imageUpload = async (file, folder)=>{
    try{
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${folder}/${file.name}`,
            Body: file.data,
            ACL: 'public-read',
            ContentType: 'image/jpeg'
        }

        const data = await s3.upload(params).promise()
        return data.Location
    }catch (e) {
        console.log(e)
    }
}
