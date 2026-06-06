import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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

// Auto-Login
signInAnonymously(auth).then(async (userCredential) => {
    const uid = userCredential.user.uid;
    await setDoc(doc(db, "users", uid), { username: "Player_" + uid.substring(0,4) }, { merge: true });
});

window.Game = {
    search: async () => {
        const username = document.getElementById('search-u').value;
        const q = query(collection(db, "users"), where("username", "==", username));
        const res = await getDocs(q);
        const results = document.getElementById('search-results');
        if (!results) return;
        results.innerHTML = '';
        res.forEach(d => {
            const btn = document.createElement('button');
            btn.innerText = "REQUEST MATCH: " + d.data().username;
            btn.onclick = () => window.Game.request(d.id);
            results.appendChild(btn);
        });
    },
    request: async (oppId) => {
        await setDoc(doc(db, "matches", auth.currentUser.uid), { p1: auth.currentUser.uid, p2: oppId, status: "pending", fen: game.fen() });
        alert("Match requested!");
    }
};

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
            if(sq) {
                cell.innerText = pieces[sq.color][sq.type];
                cell.style.fontSize = "30px";
                cell.onclick = () => {
                    if (!selectedSquare) selectedSquare = squareName;
                    else {
                        try { game.move({ from: selectedSquare, to: squareName, promotion: 'q' }); selectedSquare = null; renderBoard(); } 
                        catch (e) { selectedSquare = squareName; }
                    }
                };
            }
            b.appendChild(cell);
        });
    });
};
document.addEventListener('DOMContentLoaded', renderBoard);