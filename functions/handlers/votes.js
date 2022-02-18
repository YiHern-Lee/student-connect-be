const { db, admin } = require('../util/admin');

const upvotePost = (req, res) => {
    const upvoteDocument = db.collection('upvotes').where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id)
        .limit(1);
    const downvoteDocument = db.collection('downvotes').where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id)
        .limit(1);
    const postDocument = db.doc(`/posts/${req.params.id}`);

    let postData;
    postDocument.get()
        .then(doc => {
            if (doc.exists) {
                postData = doc.data();
                return upvoteDocument.get();
            } else {
                return res.status(404).json({ error: 'Post not found' });
            }
        }).then(data => {
            if (!data.empty) return res.status(400).json({ error: 'Post already upvoted by user' });
            const batch = db.batch()
            const newUpvote = {
                userId: req.user.uid,
                username: req.user.username,
                postId: req.params.id,
                createdAt: new Date().toISOString()
            };
            const newUpvoteRef = db.collection('upvotes').doc();
            batch.set(newUpvoteRef, newUpvote);
            upvoteId = newUpvoteRef.id;
            batch.update(postDocument, { votes: ++postData.votes });
            return downvoteDocument.get()
                .then(data => {
                    if (!data.empty) {
                        batch.delete(data.docs[0].ref)
                        batch.update(postDocument, { votes: ++postData.votes });
                    }
                    batch.commit();
                    return res.json({ ...postData, postId: req.params.id });
                })
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        })
}

const removeUpvotePost = (req, res) => {
    const upvoteDocument = db.collection('upvotes').where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id)
        .limit(1);

    const postDocument = db.doc(`/posts/${req.params.id}`);

    let postData = {};
    postDocument.get()
        .then(doc => {
            if (doc.exists) {
                postData = doc.data();
                return upvoteDocument.get();
            } else {
                return res.status(404).json({ error: 'Post not found' });
            }
        }).then(data => {
            if (data.empty) return res.status(400).json({ error: 'Post was not upvoted' });
            const batch = db.batch();
            batch.delete(data.docs[0].ref);
            batch.update(postDocument, { votes: --postData.votes });
            batch.commit();
            return res.json({ ...postData, postId: req.params.id });
        }).catch(err => {
            res.status(500).json({ error: err.code });
        })
}

const downvotePost = (req, res) => {
    const upvoteDocument = db.collection('upvotes').where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id)
        .limit(1);
    const downvoteDocument = db.collection('downvotes').where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id)
        .limit(1);
    const postDocument = db.doc(`/posts/${req.params.id}`);

    let postData;
    postDocument.get()
        .then(doc => {
            if (doc.exists) {
                postData = doc.data()
                return downvoteDocument.get()
            } else {
                return res.status(404).json({ error: 'Post not found' });
            }
        }).then(data => {
            if (!data.empty) return res.status(400).json({ error: 'Post already downvoted by user' });
            const batch = db.batch()
            const newDownvote = {
                userId: req.user.uid,
                username: req.user.username,
                postId: req.params.id,
                createdAt: new Date().toISOString()
            };
            const newDownvoteRef = db.collection('downvotes').doc();
            batch.set(newDownvoteRef, newDownvote);
            batch.update(postDocument, { votes: --postData.votes });
            return upvoteDocument.get()
                .then(data => {
                    if (!data.empty) {
                        batch.delete(data.docs[0].ref)
                        batch.update(postDocument, { votes: --postData.votes });
                    }
                    batch.commit();
                    return res.json({ ...postData, postId: req.params.id });
                })
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        })
}

const removeDownvotePost = (req, res) => {
    const downvoteDocument = db.collection('downvotes').where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id)
        .limit(1);

    const postDocument = db.doc(`/posts/${req.params.id}`);

    let postData = {};
    postDocument.get()
        .then(doc => {
            if (doc.exists) {
                postData = doc.data();
                return downvoteDocument.get();
            } else {
                return res.status(404).json({ error: 'Post not found' });
            }
        }).then(data => {
            if (data.empty) return res.status(400).json({ error: 'Post was not downvoted' });
            const batch = db.batch();
            batch.delete(data.docs[0].ref);
            batch.update(postDocument, { votes: ++postData.votes });
            batch.commit();
            return res.json({ ...postData, postId: req.params.id });
        }).catch(err => {
            res.status(500).json({ error: err.code });
        })
}

const upvoteComment = (req, res) => {
    const upvoteDocument = db.collection('commentUpvotes').where('userId', '==', req.user.uid)
        .where('commentId', '==', req.params.id)
        .limit(1);
    const downvoteDocument = db.collection('commentDownvotes').where('userId', '==', req.user.uid)
        .where('commentId', '==', req.params.id)
        .limit(1);
    const commentDocument = db.doc(`/comments/${req.params.id}`);

    let commentData;
    commentDocument.get()
        .then(doc => {
            if (doc.exists) {
                commentData = doc.data();
                return upvoteDocument.get();
            } else {
                return res.status(404).json({ error: 'Comment not found' });
            }
        }).then(data => {
            if (!data.empty) return res.status(400).json({ error: 'Comment already upvoted by user' });
            const batch = db.batch()
            const newUpvote = {
                userId: req.user.uid,
                username: req.user.username,
                commentId: req.params.id,
                createdAt: new Date().toISOString()
            };
            const newUpvoteRef = db.collection('commentUpvotes').doc();
            batch.set(newUpvoteRef, newUpvote);
            batch.update(commentDocument, { votes: ++commentData.votes });
            return downvoteDocument.get()
                .then(data => {
                    if (!data.empty) {
                        batch.delete(data.docs[0].ref)
                        batch.update(commentDocument, { votes: ++commentData.votes });
                    }
                    batch.commit();
                    return res.json({ ...commentData, commentId: req.params.id });
                })
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        })
}

const downvoteComment = (req, res) => {
    const upvoteDocument = db.collection('commentUpvotes').where('userId', '==', req.user.uid)
        .where('commentId', '==', req.params.id)
        .limit(1);
    const downvoteDocument = db.collection('commentDownvotes').where('userId', '==', req.user.uid)
        .where('commentId', '==', req.params.id)
        .limit(1);
    const commentDocument = db.doc(`/comments/${req.params.id}`);

    let commentData;
    commentDocument.get()
        .then(doc => {
            if (doc.exists) {
                commentData = doc.data();
                return downvoteDocument.get();
            } else {
                return res.status(404).json({ error: 'Comment not found' });
            }
        }).then(data => {
            if (!data.empty) return res.status(400).json({ error: 'Comment already downvoted by user' });
            const batch = db.batch()
            const newDownvote = {
                userId: req.user.uid,
                username: req.user.username,
                commentId: req.params.id,
                createdAt: new Date().toISOString()
            };
            const newDownvoteRef = db.collection('commentDownvotes').doc();
            batch.set(newDownvoteRef, newDownvote);
            batch.update(commentDocument, { votes: --commentData.votes });
            return upvoteDocument.get()
                .then(data => {
                    if (!data.empty) {
                        batch.delete(data.docs[0].ref)
                        batch.update(commentDocument, { votes: --commentData.votes });
                    }
                    batch.commit();
                    return res.json({ ...commentData, commentId: req.params.id });
                })
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        })
}

const removeUpvoteComment = (req, res) => {
    const upvoteDocument = db.collection('commentUpvotes').where('userId', '==', req.user.uid)
        .where('commentId', '==', req.params.id)
        .limit(1);

    const commentDocument = db.doc(`/comments/${req.params.id}`);

    let commentData = {};
    commentDocument.get()
        .then(doc => {
            if (doc.exists) {
                commentData = doc.data();
                return upvoteDocument.get();
            } else {
                return res.status(404).json({ error: 'Comment not found' });
            }
        }).then(data => {
            if (data.empty) return res.status(400).json({ error: 'Comment was not upvoted' });
            const batch = db.batch();
            batch.delete(data.docs[0].ref);
            batch.update(commentDocument, { votes: --commentData.votes });
            batch.commit();
            return res.json({ ...commentData, commentId: req.params.id });
        }).catch(err => {
            res.status(500).json({ error: err.code });
        })
}

const removeDownvoteComment = (req, res) => {
    const downvoteDocument = db.collection('commentDownvotes').where('userId', '==', req.user.uid)
        .where('commentId', '==', req.params.id)
        .limit(1);

    const commentDocument = db.doc(`/comments/${req.params.id}`);

    let commentData = {};
    commentDocument.get()
        .then(doc => {
            if (doc.exists) {
                commentData = doc.data();
                return downvoteDocument.get();
            } else {
                return res.status(404).json({ error: 'Comment not found' });
            }
        }).then(data => {
            if (data.empty) return res.status(400).json({ error: 'Comment was not downvoted' });
            const batch = db.batch();
            batch.delete(data.docs[0].ref);
            batch.update(commentDocument, { votes: ++commentData.votes });
            batch.commit();
            return res.json({ ...commentData, commentId: req.params.id });
        }).catch(err => {
            res.status(500).json({ error: err.code });
        })
}

const upvoteGroupPost = (req, res) => {
    const upvoteDocument = db.collection('upvotes').where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id)
        .limit(1);
    const downvoteDocument = db.collection('downvotes').where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id)
        .limit(1);
    const postDocument = db.doc(`/groupPosts/${req.params.id}`);

    let postData;
    postDocument.get()
        .then(doc => {
            if (doc.exists) {
                postData = doc.data();
                return upvoteDocument.get();
            } else {
                return res.status(404).json({ error: 'Post not found' });
            }
        }).then(data => {
            if (!data.empty) return res.status(400).json({ error: 'Post already upvoted by user' });
            const batch = db.batch()
            const newUpvote = {
                userId: req.user.uid,
                username: req.user.username,
                postId: req.params.id,
                createdAt: new Date().toISOString()
            };
            const newUpvoteRef = db.collection('upvotes').doc();
            batch.set(newUpvoteRef, newUpvote);
            upvoteId = newUpvoteRef.id;
            batch.update(postDocument, { votes: ++postData.votes });
            return downvoteDocument.get()
                .then(data => {
                    if (!data.empty) {
                        batch.delete(data.docs[0].ref)
                        batch.update(postDocument, { votes: ++postData.votes });
                    }
                    batch.commit();
                    return res.json({ ...postData, postId: req.params.id });
                })
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        })
}

const removeUpvoteGroupPost = (req, res) => {
    const upvoteDocument = db.collection('upvotes').where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id)
        .limit(1);

    const postDocument = db.doc(`/groupPosts/${req.params.id}`);

    let postData = {};
    postDocument.get()
        .then(doc => {
            if (doc.exists) {
                postData = doc.data();
                return upvoteDocument.get();
            } else {
                return res.status(404).json({ error: 'Post not found' });
            }
        }).then(data => {
            if (data.empty) return res.status(400).json({ error: 'Post was not upvoted' });
            const batch = db.batch();
            batch.delete(data.docs[0].ref);
            batch.update(postDocument, { votes: --postData.votes });
            batch.commit();
            return res.json({ ...postData, postId: req.params.id });
        }).catch(err => {
            res.status(500).json({ error: err.code });
        })
}

const downvoteGroupPost = (req, res) => {
    const upvoteDocument = db.collection('upvotes').where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id)
        .limit(1);
    const downvoteDocument = db.collection('downvotes').where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id)
        .limit(1);
    const postDocument = db.doc(`/groupPosts/${req.params.id}`);

    let postData;
    postDocument.get()
        .then(doc => {
            if (doc.exists) {
                postData = doc.data()
                return downvoteDocument.get()
            } else {
                return res.status(404).json({ error: 'Post not found' });
            }
        }).then(data => {
            if (!data.empty) return res.status(400).json({ error: 'Post already downvoted by user' });
            const batch = db.batch()
            const newDownvote = {
                userId: req.user.uid,
                username: req.user.username,
                postId: req.params.id,
                createdAt: new Date().toISOString()
            };
            const newDownvoteRef = db.collection('downvotes').doc();
            batch.set(newDownvoteRef, newDownvote);
            batch.update(postDocument, { votes: --postData.votes });
            return upvoteDocument.get()
                .then(data => {
                    if (!data.empty) {
                        batch.delete(data.docs[0].ref)
                        batch.update(postDocument, { votes: --postData.votes });
                    }
                    batch.commit();
                    return res.json({ ...postData, postId: req.params.id });
                })
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        })
}

const removeDownvoteGroupPost = (req, res) => {
    const downvoteDocument = db.collection('downvotes').where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id)
        .limit(1);

    const postDocument = db.doc(`/groupPosts/${req.params.id}`);

    let postData = {};
    postDocument.get()
        .then(doc => {
            if (doc.exists) {
                postData = doc.data();
                return downvoteDocument.get();
            } else {
                return res.status(404).json({ error: 'Post not found' });
            }
        }).then(data => {
            if (data.empty) return res.status(400).json({ error: 'Post was not downvoted' });
            const batch = db.batch();
            batch.delete(data.docs[0].ref);
            batch.update(postDocument, { votes: ++postData.votes });
            batch.commit();
            return res.json({ ...postData, postId: req.params.id });
        }).catch(err => {
            res.status(500).json({ error: err.code });
        })
}

module.exports = { upvotePost, downvotePost, removeUpvotePost, 
    removeDownvotePost, upvoteComment, downvoteComment, 
    removeUpvoteComment, removeDownvoteComment, upvoteGroupPost, 
    downvoteGroupPost, removeDownvoteGroupPost, removeUpvoteGroupPost };