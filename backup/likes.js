const likePost = (req, res) => {
    const likeDocument = db.collection('likes').where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id)
        .limit(1);
    const postDocument = db.doc(`/posts/${req.params.id}`);

    let postData;
    postDocument.get()
        .then(doc => {
            if (doc.exists) {
                postData = doc.data()
                return likeDocument.get()
            } else {
                return res.status(404).json({ error: 'Post not found' });
            }
        }).then(data => {
            if (data.empty) {
                const newLike = {
                    userId: req.user.uid,
                    username: req.user.username,
                    postId: req.params.id,
                    createdAt: new Date().toISOString()
                };
                console.log(newLike)
                return db.collection('likes').add(newLike)
                    .then(() => {
                        return postDocument.update({
                            likeCount: postData.likeCount + 1
                        })
                    }).then(() => {
                        return res.json({ message: 'Post successfully liked' })
                    })
            } else {
                return res.status(400).json({ error: 'Post liked by user' });
            }
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        })
}

const unlikePost = (req, res) => {
    const postDocument = db.doc(`/posts/${req.params.id}`);
    const likeDocument = db.collection(`likes`).where('userId', '==', req.user.uid)
        .where('postId', '==', req.params.id).limit(1);
    
    let postData;

    postDocument.get()
        .then(doc => {
            if (doc.exists) {
                postData = doc.data();
                return likeDocument.get()
            } else {
                return res.status(404).json({ error: 'Post not found' })
            }
        }).then(data => {
            if (!data.empty) {
                let docId;
                data.forEach(doc => {
                    docId = doc.id
                });
                return db.doc(`likes/${docId}`).delete()
                    .then(() => {
                        postDocument.update({
                            likeCount: postData.likeCount - 1
                        })
                    }).then(() => {
                        return res.json({ message: 'Post successfully unliked' });
                    })
            } else {
                return res.status(400).json({ message: 'Post cannot be unliked' });
            }
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        })
}