const { createPosts, 
    createForum, createUser, loginUser, 
    uploadProfilePicture, updateUserDetails, getUserData, 
    getPost, upvotePost, downvotePost, createComment,
    removeUpvotePost, removeDownvotePost, upvoteComment, 
    downvoteComment, removeUpvoteComment, removeDownvoteComment,
    deleteComment, deletePost, getOtherUserData, 
    followForum, unfollowForum, markNotificationsRead, 
    getPosts, getForums, createGroup, getForumPosts, 
    getGroupInfo, getGroupPosts, createGroupPosts, 
    addMember, getGroupPost, deleteGroupPost, 
    createGroupPostComment, upvoteGroupPost, removeUpvoteGroupPost, 
    downvoteGroupPost, removeDownvoteGroupPost, getUserGroups, 
    makeModerator, removeModerator, removeMember, createMarketplaceListings, 
    getMarkplaceListings, getMarketplaceListing, createMarketplaceListingComment, 
    deleteListing } = require("./handlers");
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

// Create new post in a group
app.post('/posts/groups/:id', FBAuth, createGroupPosts);

// Comment on post
app.post('/posts/:id/comment', FBAuth, createComment);
// Delete comment
app.delete('/comments/:id', FBAuth, deleteComment);

// Comment on group post
app.post('/groupPosts/:id/comment', FBAuth, createGroupPostComment);

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

// Upvote post
app.post('/groupPosts/:id/upvote', FBAuth, upvoteGroupPost);
// Remove upvote on post
app.post('/groupPosts/:id/unupvote', FBAuth, removeUpvoteGroupPost);
// Downvote post
app.post('/groupPosts/:id/downvote', FBAuth, downvoteGroupPost);
// Remove downvote on post
app.post('/groupPosts/:id/undownvote', FBAuth, removeDownvoteGroupPost);

// Retrieve forums
app.post('/forums', getForums);
// Create a new forum
app.post('/forums/create', FBAuth, createForum);
// Get forum posts
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

app.get('/users/groups', FBAuth, getUserGroups);

// Follow a forum
app.post('/forums/follow', FBAuth, followForum);
// Unfollow a forum
app.post('/forums/unfollow', FBAuth, unfollowForum);

// Create a group
app.post('/groups/create', FBAuth, createGroup);
// Get group info
app.get('/groups/:id', getGroupInfo);
// Get group posts
app.post('/groups/posts/:id', FBAuth, getGroupPosts);

// Get group post
app.get('/groupPosts/:id', getGroupPost);
app.delete('/groupPosts/:id', FBAuth, deleteGroupPost);

// Add a member
app.post('/groups/:id/addMember', FBAuth, addMember);
// Make member a moderator
app.post('/groups/:id/addModerator', FBAuth, makeModerator);
// Remove moderator 
app.post('/groups/:id/removeModerator', FBAuth, removeModerator);
// Remove member
app.post('/groups/:id/removeMember', FBAuth, removeMember);

// Create marketplace listing
app.post('/marketplace/create', FBAuth, createMarketplaceListings);
// Get marketplace listing
app.post('/marketplace', getMarkplaceListings);
// Get marketplace listing
app.get('/marketplace/:id', getMarketplaceListing);
// Comment on listing
app.post('/marketplace/:id/comment', FBAuth, createMarketplaceListingComment);
// Delete listing
app.delete('/marketplace/:id', FBAuth, deleteListing);


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

exports.onGroupPostDelete = functions.firestore.document('groupPosts/{postId}')
    .onDelete((snapshot, context) => {
        const { group } = snapshot.data();
        const groupDoc = db.doc(`/groups/${group}`)
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
                    .where('groupPostId', '==', postId)
                    .get()
            }).then(data => {
                data.forEach(doc => {
                    batch.delete(doc.ref);
                });
                return db.collection('notifications')
                    .where('groupPostId', '==', postId)
                    .get()
            }).then(data => {
                data.forEach(doc => {
                    batch.delete(doc.ref)
                });
                return groupDoc.get()
            }).then(doc => {
                batch.update(groupDoc, { numOfPosts: doc.data().numOfPosts - 1 });
                return batch.commit();
            }).catch(err => console.error(err));
});

exports.onListingDelete = functions.firestore.document('marketplace/{listingId}')
    .onDelete((snapshot, context) => {
        const listingId = context.params.listingId;
        const batch = db.batch();
            return db.collection('comments')
                .where('listingId', '==', listingId)
                .get()
                .then(data => {
                data.forEach(doc => {
                    batch.delete(doc.ref);
                });
                return db.collection('notifications')
                    .where('listingId', '==', listingId)
                    .get()
            }).then(data => {
                data.forEach(doc => {
                    batch.delete(doc.ref)
                });
                return batch.commit();
            }).catch(err => console.error(err));
});

exports.onCommentDelete = functions.firestore.document('comments/{commentId}')
    .onDelete((snapshot, context) => {
        const { postId, groupPostId, listingId } = snapshot.data();
        let postDocument;
        let postData;
        if (postId) postDocument = db.doc(`/posts/${postId}`);
        else if (groupPostId) postDocument = db.doc(`/groupPosts/${groupPostId}`);
        else if (listingId) postDocument = db.doc(`/marketplace/${listingId}`);
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
        }).then(data => {
            data.forEach(doc => {
                const comment = db.doc(`/comments/${doc.id}`);
                batch.update(comment, { userImageUrl: newImageUrl });
            });
            return db.collection('groupPosts')
                .where('userId', '==', userId)
                .get()
        }).then(data => {
            data.forEach(doc => {
                const groupPost = db.doc(`/groupPosts/${doc.id}`);
                batch.update(groupPost, { userImageUrl: newImageUrl });
            });
            return db.collection('marketplace')
                .where('userId', '==', userId)
                .get()
        }).then(data => {
            data.forEach(doc => {
                const listing = db.doc(`/marketplace/${doc.id}`);
                batch.update(listing, { userImageUrl: newImageUrl });
            });
            return batch.commit();
        }).catch(err => {
            console.error(err);
        })
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
                                        postId: postData.postId,
                                        forum: postData.forum
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
        let newNotification;
        if (commentData.postId) return db.doc(`/posts/${commentData.postId}`)
            .get()
            .then(doc => {
                if (doc.exists && doc.data().username !== commentData.username) {
                    newNotification = {
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().username,
                        sender: commentData.username,
                        type: 'comment',
                        read: false,
                        postId: doc.id,
                        commentId: context.params.commentId
                    };
                    return db.collection('/notifications').doc().set(newNotification);
                } else return;
            }).catch(err => console.error(err));
        else if (commentData.listingId) return db.doc(`/marketplace/${commentData.listingId}`)
            .get()
            .then(doc => {
                if (doc.exists && doc.data().username !== commentData.username) {
                    newNotification  = {
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().username,
                        sender: commentData.username,
                        type: 'comment',
                        read: false,
                        listingId: doc.id,
                        commentId: context.params.commentId
                    };
                    return db.collection('/notifications').doc().set(newNotification);
                } else return;
            }).catch(err => console.error(err));
        else if (commentData.groupPostId) return db.doc(`/groupPosts/${commentData.groupPostId}`)
            .get()
            .then(doc => {
                if (doc.exists && doc.data().username !== commentData.username) {
                    newNotification = {
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().username,
                        sender: commentData.username,
                        type: 'comment',
                        read: false,
                        groupPostId: doc.id,
                        commentId: context.params.commentId
                    };
                    return db.collection('/notifications').doc().set(newNotification);
                } else return;
            }).catch(err => console.error(err));
        else return;
});

exports.createNotificationOnGroupPost = functions.firestore.document('/groupPosts/{groupPostId}')
    .onCreate((snapshot, context) => {
        let postData;
        return db.doc(`/groupPosts/${context.params.groupPostId}`).get()
            .then(doc => {
                if (doc.exists) {
                    postData = { ...doc.data(), groupPostId: doc.id };
                    return db.collection('groupMembers')
                        .where('groupId', '==', snapshot.data().group)
                        .get()
                        .then(data => {
                            const batch = db.batch();
                            data.forEach(doc => {
                                if (doc.data().username !== postData.username) {
                                    const newNotification = {
                                        createdAt: new Date().toISOString(),
                                        recipient: doc.data().username,
                                        sender: postData.username,
                                        type: 'groupPost',
                                        read: false,
                                        groupPostId: postData.groupPostId,
                                        group: postData.group
                                    }
                                    const notification = db.collection('notifications').doc();
                                    batch.set(notification, newNotification);
                                }
                            })
                            return batch.commit()
                        })
                } else {
                    return;
                }
            }).catch(err => console.error(err));
});