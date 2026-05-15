import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBow1xYMUQbiP0TI7fV0LnR10KcFkoHWM8",
  authDomain: "tamil-anime-flash.firebaseapp.com",
  projectId: "tamil-anime-flash",
  storageBucket: "tamil-anime-flash.firebasestorage.app",
  messagingSenderId: "829749684456",
  appId: "1:829749684456:web:1062e76c73d1998732c15d",
  measurementId: "G-TM2S4NDGT0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
