import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function GlobalNote() {
  const [note, setNote] = useState("");

  useEffect(() => {
    async function fetchNote() {
      const snap = await getDoc(doc(db, "config", "globalNote"));
      if (snap.exists()) setNote(snap.data().text || "");
    }
    fetchNote();
  }, []);

  const saveNote = async () => {
    await setDoc(doc(db, "config", "globalNote"), { text: note });
    alert("Nota salva!");
  };

  return (
    <div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full border rounded p-2 mb-2"
        rows={5}
      />
      <button onClick={saveNote} className="bg-blue-600 text-white px-4 py-2 rounded">
        Salvar
      </button>
    </div>
  );
}
