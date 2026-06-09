import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBFSIqcnP5U0CMjQZtIS3jK5VTVcHGLPRw",
    authDomain: "client-cc4df.firebaseapp.com",
    projectId: "client-cc4df",
    storageBucket: "client-cc4df.firebasestorage.app",
    messagingSenderId: "600063857476",
    appId: "1:600063857476:web:9abfe8219251f56e67fd11"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.Auth = {
    signup: async (email, pass, username) => {
        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), { username, email });
            window.location.href = "profile.html";
        } catch (e) { alert("Signup Error: " + e.message); }
    },
    login: async (email, pass) => {
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            window.location.href = "profile.html";
        } catch (e) {
            alert("Login Failed: Please check your email and password.");
        }
    }
};