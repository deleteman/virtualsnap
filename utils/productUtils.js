
import { getInstance } from "./mongoClient";

export async function updateTrainingStatus(tid, newStatus, lora_url) {

    const client = await getInstance()
    console.log("Updating product status to : ", newStatus)

    const db = client.db(process.env.MONGO_DB_NAME);
    const result = await db.collection('products').updateOne({ replicate_id: tid}, {$set: {status: newStatus, lora_url}});

    return result.matchedCount == 1;

}

export async function getLoraURL(name, user_id) {
    const client = await getInstance()
    console.log("Getting LORA url for ", name, "and user. ", user_id)

    const db = client.db(process.env.MONGO_DB_NAME);
    let result = null
    try {
        result = await db.collection('products').findOne({ name ,user_id })
        console.log(result)
    } catch(e){
        console.log("::::: Error while getting the LORA url:::::")
        console.log(e)
    }


    if(!result) return null;
    return result.lora_url


}