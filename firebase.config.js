



// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAy7uCW5VkbaOjqyGV2JYuI06E2PuVEW7Q",
  authDomain: "medi-link-1366.firebaseapp.com",
  projectId: "medi-link-1366",
  storageBucket: "medi-link-1366.firebasestorage.app",
  messagingSenderId: "265314220911",
  appId: "1:265314220911:web:2289f8e05eed0e3c37869a",
  measurementId: "G-B4RQXYJZR3"
};
console.log(import.meta.env.VITE_FIREBASE_API_KEY)

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };