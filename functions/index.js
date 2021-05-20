const fn = require("firebase-functions");
const functions = fn.region("asia-southeast2");

const express = require("express");
const app = express();

const { getAllPosts } = require("./handlers/posts");
const { getAllForums } = require("./handlers/forums");

// Retrieve all posts on forum
app.get('/posts/:id', getAllPosts);

// Retrieve all forms
app.get('/forums/', getAllForums)


exports.api = functions.https.onRequest(app);