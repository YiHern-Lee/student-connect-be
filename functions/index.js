const fn = require("firebase-functions");
const functions = fn.region("asia-southeast2");

const admin = require("firebase-admin");

admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello World!");
});

exports.getPosts = functions.https.onRequest((req, res) => {
    admin.firestore().collection("posts").get()
        .then(data => {
            let posts = [];
            data.forEach((doc) => {
                posts.push(doc.data());
            });
            return posts.json();
        }).catch((err) => {
            console.error(err);
        });
});
