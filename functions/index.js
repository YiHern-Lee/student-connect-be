const { getAllPosts, createPosts } = require("./handlers/posts");
const { getAllForums, createForum } = require("./handlers/forums");
const { createUser, loginUser } = require("./handlers/users");

const fn = require("firebase-functions");
const functions = fn.region("asia-southeast2");

const express = require("express");
const app = express();

// Retrieve all posts on forum
app.get('/posts/:id', getAllPosts);
// Create new post in a forum
app.post('/posts/:id', createPosts);

// Retrieve all forums
app.get('/forums', getAllForums);
// Create a new forum
app.post('/forums', createForum);

// User sign up
app.post('/signup', createUser);
// User login
app.post('/login', loginUser);

exports.api = functions.https.onRequest(app);