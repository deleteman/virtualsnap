import {readFileSync} from 'fs'

import AWS from 'aws-sdk'

const MAX_RETRIES = 3;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

export const uploadFile = async (file, retry = 0) => {
  console.log("Uploading file ", file.originalFilename)
  
  
  const filename = file.originalFilename
  //console.log(file)
  
  const fileContent = (file.content ? file.content : readFileSync(file.filepath ))
  //console.log(fileContent)
  
  //let base64data = Buffer.from(file, 'binary')
  
  
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: fileContent,
    ACL:'public-read'
  } 
  console.log("Data:")
  console.log(params)
  
  try {
    const data = await s3.upload(params).promise()
    
    return { url: data.Location, name: file.originalFilename};
  } catch(e) {
    console.log("Error while uploading product photo...")
    console.error(e)
    retry++
    console.log("Retrying...", retry, " of ", MAX_RETRIES)
    if(retry < MAX_RETRIES) {
      return await uploadFile(file, retry)
    }
  }
};