// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9O-HsT2Ef-doZQLnBtM_kpnLT0U0tkAM",
  authDomain: "fetalheartdetection.firebaseapp.com",
  projectId: "fetalheartdetection",
  storageBucket: "fetalheartdetection.firebasestorage.app",
  messagingSenderId: "212630143885",
  appId: "1:212630143885:web:0cccf2c6de68dde2b833c4",
  measurementId: "G-4HQN2ZDRJ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const analytics = getAnalytics(app);

export { auth, analytics };