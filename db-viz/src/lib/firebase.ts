import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBchWXd3CdQSsYueSmMTmiWnZVGPndQIh0",
  authDomain: "database-visualiser.firebaseapp.com",
  projectId: "database-visualiser",
  storageBucket: "database-visualiser.firebasestorage.app",
  messagingSenderId: "429260141783",
  appId: "1:429260141783:web:15e2f103a44e7e67606c92",
  measurementId: "G-GV6DMJTHY1"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
