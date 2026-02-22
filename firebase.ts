// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7UmGCMH5YwOmhORINFiGrji7doF-3c6U",
  authDomain: "e3dady-ec540.firebaseapp.com",
  projectId: "e3dady-ec540",
  storageBucket: "e3dady-ec540.firebasestorage.app",
  messagingSenderId: "636158838287",
  appId: "1:636158838287:web:a7bbab92e7714aba10457a",
  measurementId: "G-8NVXLRS0N7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore database instance
export const db = getFirestore(app);