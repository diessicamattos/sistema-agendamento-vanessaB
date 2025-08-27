// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBXrp62MJ8KwlyN-qH6kosJ33I5RdgENiI",
  authDomain: "agenda-online-53170.firebaseapp.com",
  projectId: "agenda-online-53170",
  storageBucket: "agenda-online-53170.firebasestorage.app",
  messagingSenderId: "416128953991",
  appId: "1:416128953991:web:e7c269fdbdd885afa79222"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta Auth e Firestore para usar no restante do projeto
export const auth = getAuth(app);
export const db = getFirestore(app);
