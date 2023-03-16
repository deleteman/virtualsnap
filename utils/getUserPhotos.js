import {getInstance} from './mongoClient'

export async function getUserPhotos(user_id) {
    const client = await getInstance()

    const collection = client.db(process.env.MONGO_DB_NAME).collection("generated-photos")
    
    try {
        const data = await collection.find({
            user_id: user_id
        }).sort({timestamp: -1}).toArray()
        console.log("Found ", data.length, " photos for this user: ", user_id)
        return data.map( d => {
            d.path = d.url
            return d
        });
    } catch(err) {
        console.log("=== Error getting user photos")
        console.error(err)
        return false
    } 
}