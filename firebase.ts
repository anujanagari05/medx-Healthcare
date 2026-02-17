// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Authentication
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Import Firestore (for session control)
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApYVdWGlPsdPvUy0vUxpr6WU92psKy_to",
  authDomain: "medx-healthcare.firebaseapp.com",
  projectId: "medx-healthcare",
  storageBucket: "medx-healthcare.firebasestorage.app",
  messagingSenderId: "526901933455",
  appId: "1:526901933455:web:d81b0e28f7bd658ee307fa",
  measurementId: "G-NY4LBWCSKB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Google Provider
export const provider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);
