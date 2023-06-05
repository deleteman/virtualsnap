import { getFirestoreApp } from "@/utils/getFirestoreApp";
import 'firebase/firestore'
import 'firebase/storage';  // <----


export function uploadFile(blob, filename, cb) {
    // Initialize Firebase
    let app = getFirestoreApp(); 
    
    // Get a reference to the Firestore storage service
    console.log(app)
    
    const storageRef = app.storage().ref()
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
}