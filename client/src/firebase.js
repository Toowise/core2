import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import {
  VITE_APP_FIREBASE_API_KEY,
  VITE_APP_FIREBASE_APP_ID,
  VITE_APP_FIREBASE_AUTH_DOMAIN,
  VITE_APP_FIREBASE_MEASUREMENT_ID,
  VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
  VITE_APP_FIREBASE_PROJECT_ID,
  VITE_APP_FIREBASE_STORAGE_BUCKET,
} from './config.js'
// Firebase Configuration
const firebaseConfig = {
  apiKey: VITE_APP_FIREBASE_API_KEY,
  authDomain: VITE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: VITE_APP_FIREBASE_PROJECT_ID,
  storageBucket: VITE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: VITE_APP_FIREBASE_APP_ID,
  measurementId: VITE_APP_FIREBASE_MEASUREMENT_ID,
}
console.log ('Firebase API KEY:', VITE_APP_FIREBASE_API_KEY)
// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

export { auth, createUserWithEmailAndPassword, sendEmailVerification }
