import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";

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

let currentUser = null;
onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

window.Game = {
    search: async () => {
        const username = document.getElementById('search-u').value.trim();
        const results = document.getElementById('search-results');
        if (!username) return;
        
        results.innerHTML = 'Searching...';
        
        try {
            const q = query(collection(db, "users"), where("username", "==", username));
            const snap = await getDocs(q);
            
            results.innerHTML = '';
            if (snap.empty) {
                results.innerHTML = '<p style="padding: 20px;">No user found.</p>';
                return;
            }
            
            snap.forEach(docSnap => {
                const data = docSnap.data();
                const avatarStyle = data.photoURL ? `background-image: url('${data.photoURL}');` : 'background-color: #333;';
                
                results.innerHTML += `
                    <div class="user-card">
                        <div class="user-info">
                            <div class="avatar" style="${avatarStyle} background-size: cover; background-position: center; width: 40px; height: 40px; border-radius: 50%;"></div>
                            <div style="margin-left: 10px;">
                                <div>${data.username}</div>
                                <div style="font-size: 12px; color: #888;">ID: ${docSnap.id.substring(0,6)}</div>
                            </div>
                        </div>
                        <button class="add-btn" onclick="Game.add('${docSnap.id}')">Add</button>
                    </div>`;
            });
        } catch (error) {
            console.error("Search failed:", error);
            results.innerHTML = '<p>Error. Check index in Firebase Console.</p>';
        }
    },

    add: async (targetUid) => {
        if (!currentUser) return alert("Please login first.");
        await setDoc(doc(db, "users", targetUid, "requests", currentUser.uid), { status: "pending" });
        alert("Request sent!");
    },

    loadRequests: async () => {
        if (!currentUser) return;
        const snap = await getDocs(collection(db, "users", currentUser.uid, "requests"));
        const container = document.getElementById('requests-container');
        container.innerHTML = '<h3>Pending Requests</h3>';
        snap.forEach(doc => {
            container.innerHTML += `<div class="user-card">User: ${doc.id.substring(0,6)} <button class="add-btn" onclick="Game.acceptRequest('${doc.id}')">Accept</button></div>`;
        });
    },

    acceptRequest: async (requesterUid) => {
        if (!currentUser) return;
        await setDoc(doc(db, "users", currentUser.uid, "friends", requesterUid), { confirmed: true });
        await setDoc(doc(db, "users", requesterUid, "friends", currentUser.uid), { confirmed: true });
        await deleteDoc(doc(db, "users", currentUser.uid, "requests", requesterUid));
        window.Game.loadRequests();
    },

    loadFriends: async () => {
        if (!currentUser) return;
        const snap = await getDocs(collection(db, "users", currentUser.uid, "friends"));
        const container = document.getElementById('friends-container');
        container.innerHTML = '<h3>My Friends</h3>';
        
        for (const friendDoc of snap.docs) {
            const userDoc = await getDoc(doc(db, "users", friendDoc.id));
            const userData = userDoc.data();
            const avatarStyle = userData?.photoURL ? `background-image: url('${userData.photoURL}');` : 'background-color: #333;';
            
            container.innerHTML += `
                <div class="user-card">
                    <div class="user-info">
                        <div class="avatar" style="${avatarStyle} background-size: cover; background-position: center; width: 40px; height: 40px; border-radius: 50%;"></div>
                        <span style="margin-left:10px;">${userData?.username || "Unknown"}</span>
                    </div>
                    <button class="add-btn">Play</button>
                </div>`;
        }
    }
};