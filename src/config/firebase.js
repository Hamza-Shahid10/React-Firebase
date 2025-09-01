import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVN1HknwjqCl5zYwWfAKVB-f-trRChvIw",
  authDomain: "react-firebase-e16b9.firebaseapp.com",
  projectId: "react-firebase-e16b9",
  storageBucket: "react-firebase-e16b9.firebasestorage.app",
  messagingSenderId: "731553697957",
  appId: "1:731553697957:web:775c5e925804d06cbf3d4c",
  measurementId: "G-7EL0C7M7CK",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
