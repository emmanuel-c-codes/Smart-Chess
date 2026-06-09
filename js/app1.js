import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBFSIqcnP5U0CMjQZtIS3jK5VTVcHGLPRw",
    authDomain: "client-cc4df.firebaseapp.com",
    projectId: "client-cc4df",
    storageBucket: "client-cc4df.firebasestorage.app",
    messagingSenderId: "600063857476",
    appId: "1:600063857476:web:9abfe8219251f56e67fd11"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const game = new Chess();
let selectedSquare = null;

// 1. AUTH LOGIC
window.Auth = {
    signup: async (email, pass, username) => {
        try {
            const res = await createUserWithEmailAndPassword(auth, email, pass);
            await setDoc(doc(db, "users", res.user.uid), { username, email });
            window.location.href = "dashboard.html";
        } catch (e) { alert("Signup Error: " + e.message); }
    },
    login: async (email, pass) => {
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            window.location.href = "dashboard.html";
        } catch (e) { alert("Login Error: " + e.message); }
    },
    logout: () => signOut(auth).then(() => window.location.href = "index.html")
};

// 2. FRIENDS & SEARCH LOGIC
window.Game = {
    search: async () => {
        const username = document.getElementById('search-u').value;
        const q = query(collection(db, "users"), where("username", "==", username));
        const res = await getDocs(q);
        const results = document.getElementById('search-results');
        results.innerHTML = '';
        res.forEach(d => {
            const div = document.createElement('div');
            div.innerHTML = `<p>${d.data().username}</p> <button onclick="Game.addFriend('${d.id}')">Add Friend</button>`;
            results.appendChild(div);
        });
    },
    addFriend: async (friendId) => {
        if (!auth.currentUser) return alert("Please login");
        await setDoc(doc(db, "friends", auth.currentUser.uid + "_" + friendId), {
            user1: auth.currentUser.uid, user2: friendId, status: "accepted"
        });
        alert("Friend added!");
    }
};

// 3. CHESS ENGINE & BOARD RENDER
window.renderBoard = () => {
    const b = document.getElementById('board');
    if (!b) return;
    b.innerHTML = '';
    const pieces = { w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
                     b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' } };
    
    game.board().forEach((row, i) => {
        row.forEach((sq, j) => {
            const squareName = String.fromCharCode(97 + j) + (8 - i);
            const cell = document.createElement('div');
            cell.className = `cell ${(i+j)%2===0 ? 'white-cell' : 'green-cell'}`;
            if(sq) cell.innerText = pieces[sq.color][sq.type];
            
            cell.onclick = () => {
                if (!selectedSquare) {
                    selectedSquare = squareName;
                    cell.style.background = "#ffff00"; // Highlight selection
                } else {
                    try {
                        game.move({ from: selectedSquare, to: squareName, promotion: 'q' });
                        selectedSquare = null;
                        renderBoard();
                    } catch (e) {
                        selectedSquare = null;
                        renderBoard();
                    }
                }
            };
            b.appendChild(cell);
        });
    });
};

document.addEventListener('DOMContentLoaded', renderBoard);