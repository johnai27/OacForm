// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración (la que ya tienes)
const firebaseConfig = {
  apiKey: "AIzaSyCAlYsljltHtJlX-Wb22gKfoNAdRxLys1U",
  authDomain: "oac-formulario.firebaseapp.com",
  projectId: "oac-formulario",
  storageBucket: "oac-formulario.firebasestorage.app",
  messagingSenderId: "35002914795",
  appId: "1:35002914795:web:f62c4919e300ac05c62bae"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);