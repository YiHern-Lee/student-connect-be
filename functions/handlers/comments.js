const { db, admin } = require('../util/admin');

const createComment = (req, res) => {
    if (!req.body.body || req.body.body.trim() == '') 
        return res.status(400).json({ body: 'Comment must not be empty' });

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        username: req.user.username,
        userId: req.user.uid,
        postId: req.params.id,
        userImageUrl: req.user.userImageUrl,
        votes: 0
    };

    const postDoc = db.doc(`posts/${req.params.id}`);
    let postData = {};
    let commentDoc;
    postDoc.get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Post not found' });
            }
            postData = doc.data();
            return db.collection('comments').add(newComment);
        }).then(doc => {
            commentDoc = doc;
            return postDoc.update({
                ...postData,
                commentCount: postData.commentCount + 1
            });
        }).then(() => {
            return db.doc(`/comments/${commentDoc.id}`).get();
        }).then(doc => {
            return res.json({ commentId: doc.id, ...doc.data() })
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        });
}

const deleteComment = (req, res) => {
    const commentDocument = db.doc(`comments/${req.params.id}`);
    commentDocument.get()
        .then(doc => {
            if (!doc.exists)
                return res.status(404).json({ error: 'Comment does not exist' });
            if (doc.data().userId !== req.user.uid)
                return res.status(403).json({ error: 'Unauthorized' })
            commentDocument.delete();
            return res.json({ message: 'Comments and votes deleted' });
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        }) 
}

const createGroupPostComment = (req, res) => {
    if (!req.body.body || req.body.body.trim() == '') 
        return res.status(400).json({ body: 'Comment must not be empty' });

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        username: req.user.username,
        userId: req.user.uid,
        groupPostId: req.params.id,
        userImageUrl: req.user.userImageUrl,
        votes: 0
    };

    const postDoc = db.doc(`groupPosts/${req.params.id}`);
    let postData = {};
    let commentDoc;
    postDoc.get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Post not found' });
            }
            postData = doc.data();
            return db.collection('comments').add(newComment);
        }).then(doc => {
            commentDoc = doc;
            return postDoc.update({
                ...postData,
                commentCount: postData.commentCount + 1
            });
        }).then(() => {
            return db.doc(`/comments/${commentDoc.id}`).get();
        }).then(doc => {
            console.log(doc.data());
            return res.json({ commentId: doc.id, ...doc.data(), postId: doc.data().groupPostId })
        }).catch(err => {
            console.log(err)
            return res.status(500).json({ error: err.code });
        });
}

const createMarketplaceListingComment = (req, res) => {
    if (!req.body.body || req.body.body.trim() == '') 
        return res.status(400).json({ body: 'Comment must not be empty' });

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        username: req.user.username,
        userId: req.user.uid,
        listingId: req.params.id,
        userImageUrl: req.user.userImageUrl,
        votes: 0
    };

    const listingDoc = db.doc(`marketplace/${req.params.id}`);
    let listingData = {};
    let commentDoc;
    listingDoc.get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Listing not found' });
            }
            listingData = doc.data();
            return db.collection('comments').add(newComment);
        }).then(doc => {
            commentDoc = doc;
            return listingDoc.update({
                ...listingData,
                commentCount: listingData.commentCount + 1
            });
        }).then(() => {
            return db.doc(`/comments/${commentDoc.id}`).get();
        }).then(doc => {
            return res.json({ commentId: doc.id, ...doc.data(), postId: doc.data().listingId })
        }).catch(err => {
            console.log(err)
            return res.status(500).json({ error: err.code });
        });
}

module.exports = { createComment, deleteComment, createGroupPostComment, createMarketplaceListingComment };