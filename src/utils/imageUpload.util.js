const AWS = require('aws-sdk');
const fs = require('fs');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});

const s3 = new AWS.S3();
exports.imageUpload = async (file, folder, options)=>{
    try{
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${folder}/${file}`,
            Body: fs.readFileSync(file),
        }
        s3.upload(params, async(err, data)=>{
            if(err){
                console.log(err)
                return false
            }else{
                console.log(data.location)
                return data.location
            }
        })

    }catch (e) {
        console.log(e)
    }
}