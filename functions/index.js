const { getForumData, createPosts, getAllForums, 
    createForum, createUser, loginUser, getAllPosts, 
    uploadProfilePicture, updateUserDetails, getUserData, 
    getPost, upvotePost, downvotePost, createComment,
    removeUpvotePost, removeDownvotePost, upvoteComment, 
    downvoteComment, removeUpvoteComment, removeDownvoteComment,
    deleteComment, deletePost, getOtherUserData, followForum, unfollowForum } = require("./handlers");
const { FBAuth } = require("./util/fbAuth");

const fn = require("firebase-functions");
const functions = fn.region("asia-southeast2");

const express = require("express");
const app = express();

const cors = require('cors');
const { db } = require("./util/admin");
app.use(cors());

// Create new post in a forum
app.post('/posts/:id', FBAuth, createPosts);
// Get all posts
app.get('/posts', getAllPosts);
// Get single post
app.get('/posts/:id', getPost);
// Delete post
app.delete('/posts/:id', FBAuth, deletePost);

// Comment on post
app.post('/posts/:id/comment', FBAuth, createComment);
// Delete comment
app.delete('/comments/:id', FBAuth, deleteComment);

// Upvote comment
app.post('/comments/:id/upvote', FBAuth, upvoteComment);
// Remove upvote on comment
app.post('/comments/:id/unupvote', FBAuth, removeUpvoteComment);
// Downvote comment
app.post('/comments/:id/downvote', FBAuth, downvoteComment);
// Remove downvote on comment
app.post('/comments/:id/undownvote', FBAuth, removeDownvoteComment);

// Upvote post
app.post('/posts/:id/upvote', FBAuth, upvotePost);
// Remove upvote on post
app.post('/posts/:id/unupvote', FBAuth, removeUpvotePost);
// Downvote post
app.post('/posts/:id/downvote', FBAuth, downvotePost);
// Remove downvote on post
app.post('/posts/:id/undownvote', FBAuth, removeDownvotePost);

// Retrieve all forums
app.get('/forums', getAllForums);
// Create a new forum
app.post('/forums', FBAuth, createForum);
// Retrieve all posts on forum
app.get('/forums/:id', getForumData);

// User sign up
app.post('/signup', createUser);
// User login
app.post('/login', loginUser);

// Upload user profile picture
app.post('/users/image', FBAuth, uploadProfilePicture);
// Upload user information
app.post('/users', FBAuth, updateUserDetails);
// Get own user data
app.get('/users', FBAuth, getUserData);
// Get other user data
app.get('/users/:id', getOtherUserData);

// Follow a forum
app.post('/forums/follow', FBAuth, followForum);
// Unfollow a forum
app.post('/forums/unfollow', FBAuth, unfollowForum);

exports.api = functions.https.onRequest(app);

exports.onPostDelete = functions.firestore.document('posts/{postId}')
    .onDelete((snapshot, context) => {
        const postId = context.params.postId;
        const batch = db.batch();
        return db.collection('upvotes')
            .where('postId', '==', postId)
            .get()
            .then(data => {
                if (!data.empty) {
                    data.forEach(doc => {
                        batch.delete(doc.ref)
                    });
                }
                return db.collection('downvotes')
                    .where('postId', '==', postId)
                    .get()
            }).then(data => {
                if (!data.empty) {
                    data.forEach(doc => {
                        batch.delete(doc.ref)
                    });
                }
                return db.collection('comments')
                    .where('postId', '==', postId)
                    .get()
            }).then(data => {
                if (!data.empty) {
                    data.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                }
                return batch.commit();
            }).catch(err => console.error(err));
});

exports.onCommentDelete = functions.firestore.document('comments/{commentId}')
    .onDelete((snapshot, context) => {
        const { postId } = snapshot.data();
        const postDocument = db.doc(`/posts/${postId}`);
        let postData;
        const commentId = context.params.commentId;
        const batch = db.batch();
        return db.collection('commentUpvotes')
            .where('commentId', '==', commentId)
            .get()
            .then(data => {
                if (!data.empty) {
                    data.forEach(doc => {
                        batch.delete(doc.ref)
                    });
                }
                return db.collection('commentDownvotes')
                    .where('commentId', '==', commentId)
                    .get()
            }).then(data => {
                if (!data.empty) {
                    data.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                }
                return postDocument.get();
            }).then(doc => {
                postData = doc.data();
                batch.update(postDocument, { commentCount: postData.commentCount - 1 })
                return batch.commit();
            }).catch(err => console.error(err));
});

exports.onUserImageChange = functions.firestore.document('/users/{userId}')
  .onUpdate((change) => {
    const userId = change.before.data().userId;
    const newImageUrl = change.after.data().userImageUrl;
    if (change.before.data().userImageUrl !== change.after.data().userImageUrl) {
      console.log('image has changed');
      const batch = db.batch();
      return db
        .collection('posts')
        .where('userId', '==', userId)
        .get()
        .then(data => {
          data.forEach(doc => {
            const post = db.doc(`/posts/${doc.id}`);
            batch.update(post, { userImageUrl: newImageUrl });
          });
          return db.collection('comments')
            .where('userId', '==', userId)
            .get()
            .then(data => {
                data.forEach(doc => {
                    const comment = db.doc(`/comments/${doc.id}`);
                    batch.update(comment, { userImageUrl: newImageUrl });
                });
                return batch.commit();
            }).catch(err => {
                console.error(err);
            })
        });
    } else return true;
});
