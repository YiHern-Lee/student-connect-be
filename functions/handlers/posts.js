const { db, admin } = require('../util/admin');
const { validatePostCreation } = require('../util/validators');

const getAllPosts = (req, res) => {
    db.collection('posts')
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let posts = [];
            data.forEach(doc => {
                postData = {
                    ...doc.data(),
                    postId: doc.id
                }
                posts.push(postData)
            })
            return res.json(posts);
        }).catch(err => {
            console.error(err)
            res.status(500).json({ error: err.code });
        });
}

const createPosts = (req, res) => {
    const newPost = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        title: req.body.title,
        username: req.user.username,
        userImageUrl: req.user.userImageUrl,
        userId: req.user.uid,
        forum: req.params.id,
        votes: 0,
        commentCount: 0
    }

    const postValidation = validatePostCreation(newPost);
    if (!postValidation.valid) return res.status(400).json(postValidation.errors);

    db.collection(`/posts`).add(newPost)
        .then(doc => {
            return db.doc(`/posts/${doc.id}`).get();
        }).then(doc => {
            return res.json({ postId: doc.id, ...doc.data() })
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        })
}

const getPost = (req, res) => {
    let postData = {};
    db.doc(`posts/${req.params.id}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Post not found' })
            };
            postData = {
                postInfo: {
                    ...doc.data(),
                    postId: doc.id
                }
            }
            return db.collection('comments')
                .orderBy('votes', 'desc')
                .orderBy('createdAt', 'desc')
                .where('postId', '==', doc.id)
                .get()
        }).then(data => {
            postData.comments = [];
            data.forEach(doc => {
                let commentData = {
                    ...doc.data(),
                    commentId: doc.id
                }
                postData.comments.push(commentData);
            })
            return res.json(postData)
        }).catch(err => {
            return res.status(500).json({ error: err.code })
        })
}

const deletePost = (req, res) => {
    const postDocument = db.doc(`posts/${req.params.id}`);
    postDocument.get()
        .then(doc => {
            if (!doc.exists)
                return res.status(404).json({ error: 'Post does not exist' });
            if (doc.data().userId !== req.user.uid)
                return res.status(403).json({ error: 'Unauthorized' });
            postDocument.delete();
            return res.json({ message: 'Posts and votes deleted' });
        }).catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
}

module.exports = { createPosts, getAllPosts, getPost, deletePost }