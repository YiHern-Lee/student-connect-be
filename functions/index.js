const fn = require("firebase-functions");
const functions = fn.region("asia-southeast2");

const express = require("express");
const app = express();

const { getAllPosts } = require("./handlers/posts");

// Retrieve all posts on forum
app.get('/posts', getAllPosts);


exports.api = functions.https.onRequest(app);