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
async function uploadImageFromUrl(imageUrl, cb, retries) {
    const MAX_RETRIES = 3;
    if(retries == MAX_RETRIES) return cb("Max retries reached, file not uploaded")
    
    //while(retries < MAX_RETRIES && !success) {
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
            const task = imageRef.put(blob)
            
            task.catch((err) => {
                console.log("ERRROR while uploading...")
                console.log("Retrying....")
                throw new Error(err)
            })

            //        throw new Error("fake error")
            task.on('state_changed', 
                (snapshot) => {
                //takes a snap shot of the process as it is happening
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                }, (err) => {
                    console.error(err)
                    console.log("Retrying....")
                    retries++
                    return uploadImageFromUrl(imageRef, cb, retries)
                }, () => {

                    // gets the functions from storage refences the image storage in firebase by the children
                    // gets the download url then sets the image from firebase as the value for the imgUrl key:
                    task.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        console.log('File available at', downloadURL);
                        return cb(null, downloadURL)
                      });
                })
            
        } catch (error) {
            console.error(error)
            console.log("Retrying....")
            retries++
            return uploadImageFromUrl(imageUrl, cb, retries)
             
      }
        
  //  }
}

export default withAuth(async function handler(req, res) {
    
    let imgUrl = req.body.url
    let metadata = req.body.metadata
    let prompt = req.body.prompt_input
    
    // Example usage
    return new Promise((resolve, reject) => {
        uploadImageFromUrl(imgUrl, async (err, finalURL) => {
            if(err) {
                console.log("Error found during upload...", err)
                try {
                    res.status(500).end(JSON.stringify({
                        error: err
                    }))
                } catch(jsonErr) {
                    console.error(jsonErr)
                    res.end(JSON.stringify({
                        error: true
                    }))
                }
               return resolve()
            }
            console.log("File uploaded to: ", finalURL)
            const saveRes = await savePhoto(req.user.id, prompt.prompt, prompt.seed, prompt.guidance_scale, prompt.negative_prompt, metadata, finalURL)
            
            res.statusCode = 201;
            res.end(JSON.stringify({
                url: finalURL,
                saved_to_db: saveRes
            }));
            resolve()
        }, 0)
    })
    
}
)