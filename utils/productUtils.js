
import { getInstance } from "./mongoClient";

export async function updateTrainingStatus(tid, newStatus, lora_url) {

    const client = await getInstance()
    console.log("Updating product status to : ", newStatus)

    const db = client.db(process.env.MONGO_DB_NAME);
    const result = await db.collection('products').updateOne({ replicate_id: tid}, {$set: {status: newStatus, lora_url}});

    return result.matchedCount == 1;

}

export async function getLoraURL(name) {
    const client = await getInstance()
    console.log("Getting LORA url for ", name)

    const db = client.db(process.env.MONGO_DB_NAME);
    const result = await db.collection('products').findOne({ name })

    if(!result) return null;
    return result.lora_url


}