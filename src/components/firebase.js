import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; //FIREBASE AUTHENTICATION


const firebaseConfig = {
  databaseURL: "https://playground-4ad23-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyADMYkD_xNAizLhH6sk0TRH4osaSwxgDjA",
  authDomain: "playground-4ad23.firebaseapp.com",
  projectId: "playground-4ad23",
  storageBucket: "playground-4ad23.firebasestorage.app",
  messagingSenderId: "660442546356",
  appId: "1:660442546356:web:e8c95347d97372054157e1"


};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

const auth = getAuth(app)



export { database, auth };