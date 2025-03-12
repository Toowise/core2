import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'

// Firebase Configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA3CgYeXDorXVjaG78kN69hZQpXnq8jRf4',
  authDomain: 'localhost',
  projectId: 'shiptrack-efb5b',
  storageBucket: 'shiptrack-efb5b.firebasestorage.app',
  messagingSenderId: '36601251439',
  appId: '1:36601251439:web:ef05c08ce2a86bb5ccaf9a',
  measurementId: 'G-4Z6R5ME15D',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
auth.useDeviceLanguage()

export { auth, createUserWithEmailAndPassword, sendEmailVerification }
