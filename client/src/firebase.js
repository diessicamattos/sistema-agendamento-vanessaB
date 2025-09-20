// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBGKwNIemhrKodCcrIt_Sq-J3x46RmhGq0",
  authDomain: "agenda-vanessab.firebaseapp.com",
  projectId: "agenda-vanessab",
  storageBucket: "agenda-vanessab.firebasestorage.app",
  messagingSenderId: "244911614487",
  appId: "1:244911614487:web:7b96e926df4aa370d84a52"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta Auth e Firestore para usar no restante do projeto
export const auth = getAuth(app);
export const db = getFirestore(app);
