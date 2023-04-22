import { getInstance } from "./mongoClient";

export async function getUserProducts(user_id) {
    const client = await getInstance()
    console.log("Getting list of products for user: ", user_id)

    const db = client.db(process.env.MONGO_DB_NAME);
    const products = await db.collection('products').find({ user_id });

    if (!products) {
      return []
    }
    return await products.toArray()

}