const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

const firebaseConfig = {
    apiKey: "AIzaSyC-fAevJWwoF336h_9JsCueaP5tgKLlGmk",
    authDomain: "student-connect-3d3e3.firebaseapp.com",
    projectId: "student-connect-3d3e3",
    storageBucket: "student-connect-3d3e3.appspot.com",
    messagingSenderId: "476237207000",
    appId: "1:476237207000:web:8dbbf101a371541da68ead",
    measurementId: "G-X8JRNPBZG5"
  };

module.exports = { admin, db, firebaseConfig };