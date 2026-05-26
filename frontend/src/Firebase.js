// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFirebaseConfig } from "./config";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = getFirebaseConfig();

// Debug check: Ensure essential config values exist
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Firebase Configuration is missing! Check your .env file and ensure " +
      "variables are prefixed with VITE_. Current Config:",
    firebaseConfig,
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
