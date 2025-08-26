// Usa SDK modular
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBXrp62MJ8KwlyN-qH6kosJ33I5RdgENiI",
  authDomain: "agenda-online-53170.firebaseapp.com",
  projectId: "agenda-online-53170",
  storageBucket: "agenda-online-53170.firebasestorage.app",
  messagingSenderId: "416128953991",
  appId: "1:416128953991:web:e7c269fdbdd885afa79222"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
