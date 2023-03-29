/*
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false
  }
};

const post = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    await saveFile(files.file);
    return res.status(201).send("");
  });
};

const saveFile = async (file) => {
};

export default async (req, res) => {
  if(req.method === "POST") {
    const data = fs.readFileSync(file.path);
    fs.writeFileSync(`./public/${file.name}`, data);
    uploadZipToCloud(data, (err, uploadURL) => {
        console.log("File uploaded to ", uploadURL)
        saveProduct()
    })
    await fs.unlinkSync(file.path);
    return;
  }
};
*/

/////////
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import firebase from 'firebase/app';
import 'firebase/storage';
import { connectToDatabase } from './utils/mongodb';

export const config = {
  api: {
    bodyParser: false,
  },
};

const firebaseConfig = {
  // Your Firebase config
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const uploadFile = async (file) => {
  const storageRef = firebase.storage().ref();
  const uuid = uuidv4();
  const photoRef = storageRef.child(`photos/${uuid}-${file.name}`);
  const snapshot = await photoRef.put(file);
  const url = await snapshot.ref.getDownloadURL();
  return { url, name: file.name };
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const { db } = await connectToDatabase();

  const form = new formidable.IncomingForm();
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

    await db.collection('products').insertOne(product);

    res.status(200).json({ message: 'Product created successfully' });
  });
};

export default handler;
