import { findUserByEmail } from '@/utils/findUser';
import { S3Client} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';

const contentTypes = {
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg', 
    'png':'image/x-png',
    'zip': 'application/zip'
}

function getContentType(filename) {

    filename = filename.toLowerCase()
    const nameParts = filename.split(".")
    const ext = nameParts[nameParts.length - 1]
    if(contentTypes[ext]) {
        return contentTypes[ext]
    }
    return 'text/plain'
}

export default async function handler(req, res) {
  const s3Client = new S3Client({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION
  });

  const post = await createPresignedPost(s3Client, {
    Bucket: process.env.AWS_BUCKET_NAME,
    Region: process.env.AWS_S3_REGION,
    Key: req.query.file,
    Fields: {
      acl: 'public-read',
      'Content-Type': getContentType(req.query.file)
    },
    Expires: 600, // seconds
    /*Conditions: [
      ['content-length-range', 0, 1048576], // up to 1 MB
    ],*/
  });

  console.log("URL returned : ")
  console.log(post)
  res.status(200).json(post);
}