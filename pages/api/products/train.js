/////////
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/app';
import 'firebase/storage';
import { getInstance } from '@/utils/mongoClient';

import { getFirestoreApp } from "@/utils/getFirestoreApp";
import archiver from 'archiver';
import FormData from 'form-data';


import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Firebase
let app = getFirestoreApp(); 


const MAX_RETRIES = 3;

const uploadFile = async (file, retry = 0) => {
  console.log("Uploading file ", file.originalFilename)


  const filename = file.originalFilename
  const fileContent = file

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${filename}.jpg`,
    Body: fileContent
  }

  try {
    const data = await s3.upload(params)

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

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const db = await getInstance()

  const form = new formidable.IncomingForm({
    multiples: true
  });


  

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to parse form data' });
      return;
    }

    const { name } = fields;

    const photos = Array.isArray(files.photos) ? files.photos : [files.photos];
    const uploadedFiles = await Promise.all(photos.map(uploadFile));

    const product = {
      name,
      photos: uploadedFiles,
    };


    const zip = archiver('zip', { zlib: { level: 9 } });

    let output = Buffer.alloc(0);

    const formData = new FormData();
    formData.append('name', name);

    zip.on('data', (data) => {
      console.log("Data received...")
      output = Buffer.concat([output, data]);
    });

    zip.on('end', async () => {
      console.log("Zip file ended....")
      try {

        const headers = {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename=myfiles.zip'
        };

        const payload = {
          method: 'POST',
          body: output,
          headers,
        }
        console.log(payload)
        //const response = await fetch('https://example.com/upload', payload);
        //console.log(response.status);
        console.log("Request sent....")

        await db.collection('products').insertOne(product);


        res.status(200).json({ message: 'Product created successfully' });
      } catch (error) {
        console.error(error);
      }
    });

    for (const [fieldName, file] of Object.entries(files)) {
      file.forEach( f => {
        console.log("Adding ", f.originalFilename)
        zip.file(f.filepath, { name: f.originalFilename});
      })
    }
    zip.finalize()


  });
};

export default handler;
