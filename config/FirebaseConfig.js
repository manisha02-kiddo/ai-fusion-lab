// Import the functions you need from the SDKs you need
import {initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:Process.env.NEXT-PUBLIC_FIREBASE_API_KEY ,
  authDomain: "ai-fusion-lab-5737c.firebaseapp.com",
  projectId: "ai-fusion-lab-5737c",
  storageBucket: "ai-fusion-lab-5737c.firebasestorage.app",
  messagingSenderId: "60363660641",
  appId: "1:60363660641:web:ac6bc30dda92fb58af7920",
  measurementId: "G-7TMVSVNY5J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db=getFirestore(app, 'ai-fusion-lab')
