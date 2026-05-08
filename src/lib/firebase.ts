import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBxRrVlYu1H2-SbjCokbxmyBwqTmDEnDOQ",
  authDomain: "taskhive-b7989.firebaseapp.com",
  projectId: "taskhive-b7989",
  storageBucket: "taskhive-b7989.firebasestorage.app",
  messagingSenderId: "304123829734",
  appId: "1:304123829734:web:f51f07e475f2588ac14a27"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };