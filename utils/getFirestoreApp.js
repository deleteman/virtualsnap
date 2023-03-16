import firebase from 'firebase/app'
import 'firebase/firestore'


const firebaseConfig = {
  apiKey: process.env.FIREBASE_APIKEY,
  authDomain: process.env.FIREBASE_AUTHDOMAIN,
  projectId: process.env.FIREBASE_PROJECTID,
  storageBucket: process.env.FIREBASE_STORAGEBUCKET,
  MessagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
  appId: process.env.FIREBASE_APPID
};



export function getFirestoreApp( ) {
    // Check if a Firebase app with the same name already exists
    if (!firebase.apps.length) {
        // If no app exists, initialize a new app
        return firebase.initializeApp(firebaseConfig)
    } else {
        return firebase.apps[0]
    }
    
}