// Firebase Configuration (v8 compat syntax)
const firebaseConfig = {
    apiKey: "AIzaSyC0cRyGy03MXUYZgaEtU9V3RpZ6f4PzKp4",
    authDomain: "aws-she-builds-tracker.firebaseapp.com",
    projectId: "aws-she-builds-tracker",
    storageBucket: "aws-she-builds-tracker.firebasestorage.app",
    messagingSenderId: "543701356374",
    appId: "1:543701356374:web:6a72735fdb8e4a3db4d0f7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.firebaseApp = {
    auth: auth,
    db: db,
    firebase: firebase
};

console.log('✅ Firebase initialized successfully');