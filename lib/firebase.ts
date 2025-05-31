import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA01ejWBQS_O5aDtoGOv9v67Pbsm4o38iM",
  authDomain: "mzansigossip-64548.firebaseapp.com",
  projectId: "mzansigossip-64548",
  storageBucket: "mzansigossip-64548.appspot.com",
  messagingSenderId: "935595636590",
  appId: "1:935595636590:web:59fa893d7fa543d368b37f",
}

let app, auth, db, storage

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  console.log("Firebase initialized successfully")
} catch (error) {
  console.warn("Firebase initialization failed, using demo mode:", error)
  // Create mock objects for demo mode
  auth = null
  db = null
  storage = null
}

export { auth, db, storage }
