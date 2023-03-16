import { getInstance } from "./mongoClient";

export async function findUserByEmail(email) {
// Search for the user in the "users" collection by email
    const client = await getInstance()

   const db = client.db(process.env.MONGO_DB_NAME);
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return false
    }
    return user
}