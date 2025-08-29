import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

async function createGlobalNote() {
  const docRef = doc(db, "notes", "global");
  await setDoc(docRef, {
    text: "✨Bem-vindo(a) ao nosso espaço! Agende seu horário online.✨"
  });
  console.log("Documento global criado com sucesso!");
}

createGlobalNote();
