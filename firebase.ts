// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Authentication
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Import Firestore (for session control)
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyClkHl2HCKFveRY1VY120s9dJipAxtSofs",
  authDomain: "medx-healthcare-69b5a.firebaseapp.com",
  projectId: "medx-healthcare-69b5a",
  storageBucket: "medx-healthcare-69b5a.firebasestorage.app",
  messagingSenderId: "606001236929",
  appId: "1:606001236929:web:aedcae27e19683c7da7d40",
  measurementId: "G-61BD1DW0VN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Google Provider
export const provider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);
