// Import the functions you need from the SDKs you need
import { withAuth } from "../middleware/auth";
//import { uploadFile } from "@/utils/uploadFileToFirestore";
import { uploadFile } from "@/utils/s3Upload";
import {savePhoto} from '../../../utils/savePhotos'





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
        let uploadData = await uploadFile({content: blob, originalFilename: filename})
        return cb(null, uploadData.url)
        
        
        
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