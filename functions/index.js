const { createPosts, getAllForums, 
    createForum, createUser, loginUser, 
    uploadProfilePicture, updateUserDetails, getUserData, 
    getPost, upvotePost, downvotePost, createComment,
    removeUpvotePost, removeDownvotePost, upvoteComment, 
    downvoteComment, removeUpvoteComment, removeDownvoteComment,
    deleteComment, deletePost, getOtherUserData, 
    followForum, unfollowForum, markNotificationsRead, 
    getPosts, getForums, createGroup, getForumPosts} = require("./handlers");
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
app.post('/posts', getPosts);
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
app.post('/forums', getForums);
// Create a new forum
app.post('/forums/create', FBAuth, createForum);
// Retrieve all posts on forum
/* app.get('/forums/:id', getForumData); */
app.post('/forums/posts/:id', getForumPosts);

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
app.post('/users/posts/:id', getOtherUserData);
// Mark notifications as read
app.post('/notifications', FBAuth, markNotificationsRead);

// Follow a forum
app.post('/forums/follow', FBAuth, followForum);
// Unfollow a forum
app.post('/forums/unfollow', FBAuth, unfollowForum);

// Create a group
app.post('/groups/create', FBAuth, createGroup);

exports.api = functions.https.onRequest(app);

exports.onPostDelete = functions.firestore.document('posts/{postId}')
    .onDelete((snapshot, context) => {
        const { forum } = snapshot.data();
        const forumDoc = db.doc(`/forums/${forum}`)
        const postId = context.params.postId;
        const batch = db.batch();
        return db.collection('upvotes')
            .where('postId', '==', postId)
            .get()
            .then(data => {
                data.forEach(doc => {
                    batch.delete(doc.ref)
                });
                return db.collection('downvotes')
                    .where('postId', '==', postId)
                    .get()
            }).then(data => {
                data.forEach(doc => {
                    batch.delete(doc.ref)
                });
                return db.collection('comments')
                    .where('postId', '==', postId)
                    .get()
            }).then(data => {
                data.forEach(doc => {
                    batch.delete(doc.ref);
                });
                return db.collection('notifications')
                    .where('postId', '==', postId)
                    .get()
            }).then(data => {
                data.forEach(doc => {
                    batch.delete(doc.ref)
                });
                return forumDoc.get()
            }).then(doc => {
                batch.update(forumDoc, { numOfPosts: doc.data().numOfPosts - 1 });
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
                data.forEach(doc => {
                    batch.delete(doc.ref)
                });
                return db.collection('commentDownvotes')
                    .where('commentId', '==', commentId)
                    .get()
            }).then(data => {
                    data.forEach(doc => {
                        batch.delete(doc.ref);
                    });      
                return postDocument.get();
            }).then(doc => {
                postData = doc.data();
                batch.update(postDocument, { commentCount: postData.commentCount - 1 })
                return db.collection('notifications')
                    .where('commentId', '==', commentId)
                    .get()
            }).then(data => {
                data.forEach(doc => {
                    batch.delete(doc.ref);
                });
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

exports.createNotificationOnPost = functions.firestore.document('/posts/{postId}')
    .onCreate((snapshot, context) => {
        let postData;
        return db.doc(`/posts/${context.params.postId}`).get()
            .then(doc => {
                if (doc.exists) {
                    postData = { ...doc.data(), postId: doc.id};
                    return db.collection(`/follows`)
                        .where('forumId', '==', snapshot.data().forum)
                        .get()
                        .then(data => {
                            const batch = db.batch();
                            data.forEach(doc => {
                                if (doc.data().username !== postData.username) {
                                    const newNotification = {
                                        createdAt: new Date().toISOString(),
                                        recipient: doc.data().username,
                                        sender: postData.username,
                                        type: 'post',
                                        read: false,
                                        postId: postData.postId
                                    }
                                    const notificationDoc = db.collection('notifications').doc();
                                    batch.set(notificationDoc, newNotification);
                                }
                            })
                            return batch.commit();
                        })
                } else {
                    return;
                }
            }).catch(err => {
                console.error(err);
            })
        
});

exports.createNotificationsOnComment = functions.firestore.document('/comments/{commentId}')
    .onCreate((snapshot, context) => {
        const commentData = snapshot.data();
        return db.doc(`/posts/${commentData.postId}`)
            .get()
            .then(doc => {
                if (doc.exists && doc.data().username !== commentData.username) {
                    const newNotification = {
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().username,
                        sender: commentData.username,
                        type: 'comment',
                        read: false,
                        postId: doc.id,
                        commentId: context.params.commentId
                    }
                    return db.collection('/notifications').doc().set(newNotification);
                } else return;
            }).catch(err => {
                console.error(err);
            })
});