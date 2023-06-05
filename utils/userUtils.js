import { ObjectId } from "mongodb";
import { getInstance } from "./mongoClient";

import jwt from 'jsonwebtoken';

export async function cancelUserSubscription(subscription_id) {
    const client = await getInstance()
    console.log("Canceling subscription with ID:  ", subscription_id)

    const db = client.db(process.env.MONGO_DB_NAME);
    const collection = await db.collection('users')

    let updateRes = await collection.updateOne({subscription_id}, {
      "$set": {
        plan: 'free'
      }
    })

    if(!updateRes) {
      return false
    }
    if(updateRes.modifiedCount == 1) {
      return true;
    } 

    return false;
 
}


export async function updateUserCookieWithDB(user, res) {

    const client = await getInstance()
    console.log("Updating cookie for user: ", user.email)

    const db = client.db(process.env.MONGO_DB_NAME);
    const collection = await db.collection('users')

    const usr = await collection.findOne({email: user.email})

    let newData = { email: user.email, id: usr._id.toString(), credits: usr.credits, plan: usr.plan }
    console.log("Updating cookie with new data: ", newData)
    const token = jwt.sign(newData, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.setHeader('Set-Cookie', `jwtToken=${token}; HttpOnly; Max-Age=36000; SameSite=Lax; Path=/`)

    return [newData, token]

}


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

export async function updateUserCustomerID(email, customer_id) {
    const client = await getInstance()
    console.log("Updating credits for user: ", email)

    const db = client.db(process.env.MONGO_DB_NAME);
    const collection = await db.collection('users')
 
    try { 
      const result = await collection.updateOne({email}, {'$set': {
        customer_id 
      }})
      console.log(result)
      if (!result) {
        return false
      }
      if(result.modifiedCount == 1) {
        return true;
      } 
    } catch (e) {
      console.log("Error while updating user customer ID:")
      console.log(e)
    }

    return false;
}

export async function setUserCreditsAndPlan(email, creditsToSet, plan, subscription_id) {
    const client = await getInstance()
    if(email)
      console.log("SETTING credits for user: ", email)
    else
      console.log("UPDATING RECORD with subscription id: ", subscription_id)

    console.log("new credits: ", creditsToSet)
    console.log("new plan: ", plan)

    const db = client.db(process.env.MONGO_DB_NAME);
    const collection = await db.collection('users')
    console.log("Collection: ")
    console.log(collection)
    let query = email ? { email } : {subscription_id}
    const result = await collection.updateOne(query, {
      "$set": {
        "credits": creditsToSet,
        "plan": plan,
        subscription_id
      }
    });

    console.log(result)
    if (!result) {
      return false
    }
    if(result.modifiedCount == 1) {
      return true;
    } 

    return false;
 
}

export async function substractUserCredits(user_id, creditsToSubstract) {
    const client = await getInstance()
    console.log("Updating credits for user: ", user_id)

    const db = client.db(process.env.MONGO_DB_NAME);
    const collection = await db.collection('users')
    console.log("Collection: ")
    console.log(collection)
    const result = await collection.updateOne({ _id: new ObjectId(user_id)}, {
      "$inc": {
        "credits": -creditsToSubstract
      }
    });

    console.log(result)
    if (!result) {
      return false
    }
    if(result.modifiedCount == 1) {
      return true;
    } 

    return false;
 
}

export async function getUserCredits(user_id) {
    const client = await getInstance()
    console.log("Getting credits for user: ", user_id)

    const db = client.db(process.env.MONGO_DB_NAME);
    const collection = await db.collection('users')
    const result = await collection.findOne({ _id: new ObjectId(user_id)});

    console.log(result)
    if (!result) {
      return false
    }
    return result.credits
 
}