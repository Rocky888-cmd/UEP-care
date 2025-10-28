UEP CARE PROJECT IMPLEMENTATION

UEP Care (UEP Concern Portal) is a web application designed to allow students to submit anonymous concerns securely within the University of Eastern Philippines. The system uses Firebase for data storage, user authentication, and hosting.

------------------------------------------------------------
1. PROJECT OVERVIEW
------------------------------------------------------------
UEP Care enables students to submit, store, and manage anonymous concerns. It uses Firebase Realtime Database for storing concerns, Firebase Storage for uploaded files, Google Sign-In for authentication, and Firebase Hosting for deployment. Node.js handles server functions and verification like reCAPTCHA Enterprise.

------------------------------------------------------------
2. TOOLS USED
------------------------------------------------------------
- Visual Studio Code (Editor)
- HTML, CSS, JavaScript (Frontend)
- Node.js (Backend / Firebase Functions)
- Firebase Realtime Database
- Firebase Storage
- Firebase Authentication (Google Sign-In)
- Firebase Hosting
- Google Cloud (for service account and reCAPTCHA)

------------------------------------------------------------
3. PREREQUISITES
------------------------------------------------------------
Before starting, install:
- Node.js (LTS version)
- Firebase CLI (npm install -g firebase-tools)
- A Firebase project (created via Firebase Console)
- Service account key from Google Cloud Console

------------------------------------------------------------
4. PROJECT STRUCTURE (SUGGESTED)
------------------------------------------------------------
uep-care/
│
├─ public/                 -> HTML, CSS, JS files
│  ├─ index.html
│  ├─ css/
│  └─ js/
│
├─ functions/              -> Node.js functions (optional)
│  ├─ index.js
│  └─ package.json
│
├─ firebase.json
├─ .firebaserc
└─ service-account.json    -> Keep private, do not upload to GitHub

------------------------------------------------------------
5. LOCAL SETUP (STEP-BY-STEP)
------------------------------------------------------------
1. Open Visual Studio Code.
2. Clone or open your project folder.
3. Open a terminal inside VS Code.
4. Run: npm install -g firebase-tools
5. Run: firebase login
6. Run: firebase init
   - Choose Hosting, Database, Storage, and Functions.
   - Set "public" as your hosting directory.
7. When initialization is done, connect your web files in the public folder.

------------------------------------------------------------
6. FIREBASE CONFIGURATION (STEP-BY-STEP)
------------------------------------------------------------
1. Go to Firebase Console and open your project.
2. Enable Authentication:
   - Open Authentication > Sign-in method.
   - Enable Google Sign-In.
3. Enable Realtime Database:
   - Go to Database > Realtime Database > Create Database.
   - Choose your region and start in locked mode.
4. Enable Storage:
   - Go to Storage > Get Started > Set up your bucket.
5. Set up Hosting:
   - Run "firebase deploy --only hosting" to publish online.

------------------------------------------------------------
7. GOOGLE CLOUD SERVICE ACCOUNT SETUP
------------------------------------------------------------
1. Go to Google Cloud Console.
2. Open IAM & Admin > Service Accounts > Create Service Account.
3. Assign roles needed (for example: reCAPTCHA Enterprise Admin).
4. Create and download the service-account.json file.
5. Save it in your project folder (example: D:\UEPConcernPortal\service-account.json).
6. Set it as an environment variable:

   For Windows:
   set GOOGLE_APPLICATION_CREDENTIALS=D:\UEPConcernPortal\service-account.json

   For Mac/Linux:
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"

------------------------------------------------------------
8. RUNNING LOCALLY
------------------------------------------------------------
Option 1 - Run static hosting locally:
1. Open terminal inside your project.
2. Run: firebase emulators:start
3. Open the link shown in your terminal (usually http://localhost:5000).

Option 2 - Open manually:
1. Right-click index.html and open in a browser.

------------------------------------------------------------
9. DEPLOYING TO FIREBASE HOSTING
------------------------------------------------------------
1. Run: firebase login
2. Run: firebase init (if not yet done)
3. Run: firebase deploy
4. After deployment, note your hosting URL (example: https://uep-care.web.app)

------------------------------------------------------------
10. SECURITY RULES EXAMPLE
------------------------------------------------------------
Realtime Database:
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}

Firebase Storage:
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}

------------------------------------------------------------
11. TROUBLESHOOTING
------------------------------------------------------------
- If Google Sign-In fails, make sure "localhost" and your web domain are added as authorized domains in Firebase Authentication.
- If Storage upload fails (retry-limit-exceeded), check your internet connection and storage rules.
- If GOOGLE_APPLICATION_CREDENTIALS is not recognized, re-run the set command or add it permanently in system environment variables.

------------------------------------------------------------
12. DEPLOYMENT COMMANDS
------------------------------------------------------------
firebase emulators:start      -> Run locally
firebase deploy --only hosting -> Deploy hosting only
firebase deploy                -> Deploy all services

------------------------------------------------------------
13. CONTRIBUTION GUIDE
------------------------------------------------------------
1. Fork this project.
2. Create a new branch for your feature.
3. Commit and push changes.
4. Submit a pull request.

------------------------------------------------------------
END OF DOCUMENT
------------------------------------------------------------
```
