
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCV3-t-p9y_a7_xJ2-xH1y_S9y9xX",
  authDomain: "bibliotrack-demo.firebaseapp.com",
  projectId: "bibliotrack-demo",
  storageBucket: "bibliotrack-demo.appspot.com",
  messagingSenderId: "100832961826",
  appId: "1:100832961826:web:a61f2390f8a9a8b1c4d4c3"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
