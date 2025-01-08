// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkukMVa-K9x8orTGDU05-A16h5S7t2Wpg",
  authDomain: "todo-b1f8f.firebaseapp.com",
  projectId: "todo-b1f8f",
  storageBucket: "todo-b1f8f.firebasestorage.app",
  messagingSenderId: "192726105922",
  appId: "1:192726105922:web:255177c42b2a2c37e452db",
  measurementId: "G-VS6SH0Y81Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
