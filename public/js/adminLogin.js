import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAfwnxmZ4RtZa73ywK3IbztMNLH-_73x24",
  authDomain: "uepcare.firebaseapp.com",
  databaseURL: "https://uepcare-default-rtdb.firebaseio.com",
  projectId: "uepcare",
  storageBucket: "uepcare.firebasestorage.app",
  messagingSenderId: "571550526820",
  appId: "1:571550526820:web:702df272d8af6e97389e71",
  measurementId: "G-BDT715DNBZ",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ✅ Auto redirect if already signed in
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ Already logged in as:", user.email);
    sessionStorage.setItem("admin", "true");
    window.location.href = "dashboard.html";
  }
});

// ✅ Sign in with Popup + reCAPTCHA check
document.getElementById("signInBtn").addEventListener("click", async () => {
  // 🧩 Verify reCAPTCHA first
  const response = grecaptcha.getResponse();
  if (!response) {
    alert("⚠️ Please verify the reCAPTCHA first.");
    return;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("✅ Login success:", user.email);
    sessionStorage.setItem("admin", "true");
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("❌ Login failed:", error);
    if (error.code === "auth/popup-closed-by-user") {
      alert("Popup closed before completing sign-in. Please try again.");
    } else {
      alert("Login failed: " + error.message);
    }
  } finally {
    // 🧹 Reset reCAPTCHA after attempt
    grecaptcha.reset();
  }
});


// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
// import { getAuth, signInWithRedirect, getRedirectResult ,GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";



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

// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const provider = new GoogleAuthProvider();


// // ✅ Check redirect result after returning from Google
// getRedirectResult(auth)
//   .then((result) => {
//     if (result && result.user) {
//       const user = result.user;
//       console.log("✅ Login success:", user.email);
//       sessionStorage.setItem("admin", "true");
//       window.location.href = "dashboard.html";
//     }
//   })
//   .catch((error) => {
//     console.error("❌ Login failed:", error);
//     if (error.message.includes("blocked")) {
//       alert("Please allow popups or use redirect sign-in again.");
//     }
//   });

// // ✅ If already logged in, go directly to dashboard
// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     console.log("Already logged in as:", user.email);
//     sessionStorage.setItem("admin", "true");
//     window.location.href = "dashboard.html";
//   }
// });

// // ✅ Sign in button
// document.getElementById("signInBtn").addEventListener("click", async () => {
//   try {
//     await signInWithRedirect(auth, provider);
//   } catch (err) {
//     console.error("Login failed:", err);
//     alert("Login failed: " + err.message);
//   }
// });