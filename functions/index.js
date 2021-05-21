const fn = require("firebase-functions");
const functions = fn.region("asia-southeast2");

const express = require("express");
const app = express();

const { getAllPosts, createPosts } = require("./handlers/posts");
const { getAllForums, createForum } = require("./handlers/forums");

// Retrieve all posts on forum
app.get('/posts/:id', getAllPosts);
app.post('/posts/:id', createPosts);

// Retrieve all forms
app.get('/forums', getAllForums)
app.post('/forums', createForum)


exports.api = functions.https.onRequest(app);