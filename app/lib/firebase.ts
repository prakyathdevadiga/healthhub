import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAPYi5jGu8VU3AQh_AUnauMphpPi-9UTqQ",
  authDomain: "healthhub-1cb99.firebaseapp.com",
  projectId: "healthhub-1cb99",
  storageBucket: "healthhub-1cb99.firebasestorage.app",
  messagingSenderId: "190572770680",
  appId: "1:190572770680:web:eb5f13393a3c4111bec48d",
  measurementId: "G-F84M31EZ1K",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);