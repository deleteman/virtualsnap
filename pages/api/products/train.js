/////////
import { withAuth } from "../middleware/auth";
import formidable from 'formidable';
import 'firebase/storage';
import { getInstance } from '@/utils/mongoClient';

import { getFirestoreApp } from "@/utils/getFirestoreApp";
import archiver from 'archiver';
import FormData from 'form-data';
import Replicate from 'replicate'
import { uploadFile } from '@/utils/s3Upload.js'
import { trainLORA } from "@/utils/replicate";



export const config = {
  api: {
    bodyParser: false,
  },
};


export default withAuth(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  
  const conn = await getInstance()
  
  const form = new formidable.IncomingForm({
    multiples: true
  });
  
  
  
  return new Promise((resolve, reject) => {
    
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to parse form data' });
        return resolve()
      }
      
      const { name } = fields;
      
      const photos = Array.isArray(files.photos) ? files.photos : [files.photos];
      const uploadedFiles = await Promise.all(photos.map( async (p) => await uploadFile(p, 0)));
      
      const product = {
        name,
        user_id: req.user.id,
        photos: uploadedFiles,
        status: 'training',
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
          
          //    writeFileSync("./training.zip", output)
          console.log("About to send request for training...")
          //const response = await fetch('https://example.com/upload', payload);
          //console.log(response.status);
          
          const zipUploaded = await uploadFile({
            originalFilename: "training.zip",
            content: output,
            
          })
          
          const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN
          })
          
          const trainingResult = await trainLORA(123, zipUploaded.url)
          
          console.log(trainingResult)
          console.log("Request sent....")
          product.replicate_id = trainingResult.id
          
          await conn.db(process.env.MONGO_DB_NAME).collection('products').insertOne(product);
          
          
          res.status(200).json({ message: 'Product created successfully', replicate_id: trainingResult.id, product});
          return resolve()
        } catch (error) {
          console.error(error);
          res.status(500).json(error)
          return resolve()
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
  })
});
