import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  "projectId": "careercraft-ai-7utd3",
  "appId": "1:369594218242:web:23f02b71b2c4f25b1b741b",
  "storageBucket": "careercraft-ai-7utd3.firebasestorage.app",
  "apiKey": "AIzaSyDm3rwgToB-pXXxa9zpy-luH5BO9gqTCrw",
  "authDomain": "careercraft-ai-7utd3.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "369594218242"
};

const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { firebaseApp };
