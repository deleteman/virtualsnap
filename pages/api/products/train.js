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



export default withAuth(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  
  const conn = await getInstance()

  console.log(req.body)
   const product = {
        name: req.body.name,
        user_id: req.user.id,
        photos: req.body.uploadedFiles,
        status: 'training',
      };
    

    let zipURL = req.body.url
  
  return new Promise(async (resolve, reject) => {
      const trainingResult = await trainLORA(123, zipURL)
      
      console.log(trainingResult)
      console.log("Request sent....")
      product.replicate_id = trainingResult.id
      
      try {
        await conn.db(process.env.MONGO_DB_NAME).collection('products').insertOne(product);
        console.log("NEW PRODUCT saved!")
        let resp = { message: 'Product created successfully', replicate_id: trainingResult.id, product}
        console.log(resp)
        res.status(200).json(resp);
        return resolve()
      } catch (e) {
        console.log("ERROR SAVING NEW PRODUCT")
        res.status(500).json({error: true, error_msg: e.message})
        return resolve()
      }
      
      
  });
      
});
