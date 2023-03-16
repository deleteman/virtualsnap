import { ObjectId } from 'mongodb'
import {getInstance} from './mongoClient'

export async function updatePhotoURL(userId, photoId, url, isUpscaled) {
    const client = await getInstance()
    // Connect to the MongoDB cluster
    const collection = client.db(process.env.MONGO_DB_NAME).collection("generated-photos");
    
    // Define a new record
    const record = {
        url,
        upscaled: isUpscaled
    };
    console.log("updating ", photoId, " with the following")
    console.log(record)
    
    // Save the record to the MongoDB collection
    try {
        const res = await collection.updateOne({_id: new ObjectId(photoId)}, {$set:record})
        console.log(res)
        console.log(`Record ${res._id} updated qsuccessfully.`);
        return true
    } catch (err) {
        console.error('ERROR:', err);
    }
}

export async function savePhoto(userId, prompt, seed, guidance, negative_prompt, url) {
    const conn = await getInstance()
    // Connect to the MongoDB cluster
  
    const collection = conn.db(process.env.MONGO_DB_NAME).collection("generated-photos");
    
    // Define a new record
    const record = {
        user_id: userId,
        timestamp: new Date(),
        prompt,
        seed,
        guidance_scale: guidance,
        url,
        negative_prompt
    };
    
    // Save the record to the MongoDB collection
    try {
        const res = await collection.insertOne(record)
        console.log(`Record ${res.insertedId} created successfully.`);
        return res.insertedId
    } catch (err) {
        console.error('ERROR:', err);
    } 
}
