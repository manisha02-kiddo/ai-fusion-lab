// app/config/FirebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "ai-fusion-lab-5737c.firebaseapp.com",
  projectId: "ai-fusion-lab-5737c",
  storageBucket: "ai-fusion-lab-5737c.appspot.com",
  messagingSenderId: "60363660641",
  appId: "1:60363660641:web:ac6bc30dda92fb58af7920",
  measurementId: "G-7TMVSVNY5J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore
export const db = getFirestore(app);
