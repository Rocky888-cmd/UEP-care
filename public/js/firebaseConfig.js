// js/firebaseConfig.js
// Firebase configuration and initialization
// Do NOT expose real credentials in public repositories.

// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
// import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
// import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
// import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// // ✅ Your Firebase project configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyAfwnxmZ4RtZa73ywK3IbztMNLH-_73x24",
//   authDomain: "uepcare.firebaseapp.com",
//   databaseURL: "https://uepcare-default-rtdb.firebaseio.com",
//   projectId: "uepcare",
//   storageBucket: "uepcare.firebasestorage.app",
//   messagingSenderId: "571550526820",
//   appId: "1:571550526820:web:702df272d8af6e97389e71",
//   measurementId: "G-BDT715DNBZ"
// };

// // // ✅ Initialize Firebase App
// // const app = initializeApp(firebaseConfig);

// // // ✅ Firebase Services
// // export const auth = getAuth(app);
// // export const provider = new GoogleAuthProvider();
// // export const db = getDatabase(app);
// // export const storage = getStorage(app);

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const provider = new GoogleAuthProvider();
// const db = getDatabase(app);

// js/firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyAfwnxmZ4RtZa73ywK3IbztMNLH-_73x24",
  authDomain: "uepcare.firebaseapp.com",
  databaseURL: "https://uepcare-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "uepcare",
  storageBucket: "uepcare.appspot.com",
  messagingSenderId: "355896194048",
  appId: "1:355896194048:web:d923f58987a3641427b3b2",
  measurementId: "G-DJDV4D5S9R"
};

// ✅ Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const functions = getFunctions(app); // 👈 add this line

export { auth, provider, db };
