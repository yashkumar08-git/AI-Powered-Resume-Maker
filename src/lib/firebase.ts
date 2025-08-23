// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "careercraft-ai-7utd3",
  "appId": "1:369594218242:web:23f02b71b2c4f25b1b741b",
  "storageBucket": "careercraft-ai-7utd3.firebasestorage.app",
  "apiKey": "AIzaSyDm3rwgToB-pXXxa9zpy-luH5BO9gqTCrw",
  "authDomain": "careercraft-ai-7utd3.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "369594218242"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
