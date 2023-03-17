// Import the functions you need from the SDKs you need
import { withAuth } from "../middleware/auth";

import { getFirestoreApp } from "@/utils/getFirestoreApp";
import 'firebase/firestore'
import firebase from 'firebase/app'
import 'firebase/storage';  // <----


import {savePhoto} from '../../../utils/savePhotos'



// Initialize Firebase
let app = getFirestoreApp(); 

// Get a reference to the Firestore storage service
console.log(app)

const storageRef = app.storage().ref()

// Function to upload an image to Firestore from an external URL
async function uploadImageFromUrl(imageUrl, res) {
    let retries = 0;
    const MAX_RETRIES = 3;
    
    while(retries < MAX_RETRIES) {
        try {
            console.log("Saving...", imageUrl)
            // Fetch the image data from the external URL
            const response = await fetch(imageUrl)
            const blob = new Uint8Array(await response.arrayBuffer())
            console.log("Blob: ")
            console.log(blob)
            
            // Generate a random filename for the image
            const filename = Math.random().toString(36).substring(7) + '.jpg'
            
            // Upload the image to Firestore
            const imageRef = storageRef.child(`photos/${filename}`)
            console.log("Uploading....")
            const snapshot = await imageRef.put(blob)
            
            // Get the download URL for the image
            console.log("Getting URL of the new file...")
            const downloadUrl = await snapshot.ref.getDownloadURL()
            
            return downloadUrl
        } catch (error) {
            console.error(error)
            console.log("Retrying....")
            retries++
            if(retries == MAX_RETRIES) {
                console.log("No more retries available, failing...")
                return ""
            }
        }
        
    }
}

export default withAuth(async function handler(req, res) {
    
    let imgUrl = req.body.url
    let metadata = req.body.metadata
    let prompt = req.body.prompt_input
    
    // Example usage
    let finalURL =  await uploadImageFromUrl(imgUrl, res)
    console.log("File uploaded to: ", finalURL)
    const saveRes = await savePhoto(req.user.id, prompt.prompt, prompt.seed, prompt.guidance_scale, prompt.negative_prompt, metadata, finalURL)
    
    res.statusCode = 201;
    res.end(JSON.stringify({
        url: finalURL,
        saved_to_db: saveRes
    }));
    
}
)