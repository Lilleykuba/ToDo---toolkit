import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkukMVa-K9x8orTGDU05-A16h5S7t2Wpg",
  authDomain: "todo-b1f8f.firebaseapp.com",
  projectId: "todo-b1f8f",
  storageBucket: "todo-b1f8f.firebasestorage.app",
  messagingSenderId: "192726105922",
  appId: "1:192726105922:web:255177c42b2a2c37e452db",
  measurementId: "G-VS6SH0Y81Q",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
