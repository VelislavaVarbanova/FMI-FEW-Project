// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut as fbSignOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDoyH1ym862s2inT8rJO9NRPzol8jKOsVE",
    authDomain: "chatkam-aba49.firebaseapp.com",
    projectId: "chatkam-aba49",
    storageBucket: "chatkam-aba49.appspot.com",
    messagingSenderId: "984967507619",
    appId: "1:984967507619:web:bf93e1f243e6450e205916",
    databaseURL: "https://chatkam-aba49-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Initialize variables
const auth = getAuth(app);
export const createUser = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const onAuthChanged = (callback) => {console.log('1'); return onAuthStateChanged(auth, callback)};
export const signOut = () => fbSignOut(auth);
export const database = getDatabase(app);
export const refDatabase = (path) => ref(database, path);
