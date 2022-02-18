const { db, admin } = require('../util/admin');
const { validatePostCreation } = require('../util/validators');

const createGroupPosts = (req, res) => {
    const newPost = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        title: req.body.title,
        username: req.user.username,
        userImageUrl: req.user.userImageUrl,
        userId: req.user.uid,
        group: req.params.id,
        votes: 0,
        commentCount: 0
    }

    const postValidation = validatePostCreation(newPost);
    if (!postValidation.valid) return res.status(400).json(postValidation.errors);

    const groupRef = db.doc(`/groups/${req.params.id}`);
    let groupPostId;
    return groupRef.get()
        .then(doc => {
            if (!doc.exists) return res.status(400).json({ group: 'Group does not exists' });
            else {
            const batch = db.batch();
            const postRef = db.collection('/groupPosts/').doc();
            groupPostId = postRef.id
            batch.set(postRef, newPost);
            batch.update(groupRef, {
                updatedAt: new Date().toISOString(),
                numOfPosts: doc.data().numOfPosts + 1
            })
            return batch.commit()
                .then(() => {
                    res.json({ ...newPost, postId: groupPostId })
                })
            }
        }).catch(err => {
            console.log(err)
            return res.status(500).json({ error: err.code });
        })
}

const getGroupPost = (req, res) => {
    let postData = {};
    db.doc(`groupPosts/${req.params.id}`).get()
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
                .where('groupPostId', '==', doc.id)
                .get()
        }).then(data => {
            postData.comments = [];
            data.forEach(doc => {
                let commentData = {
                    ...doc.data(),
                    postId: doc.data().groupPostId,
                    commentId: doc.id
                }
                postData.comments.push(commentData);
            })
            return res.json(postData)
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ error: err.code })
        })
}

const deleteGroupPost = (req, res) => {
    let postData;
    const postDocument = db.doc(`groupPosts/${req.params.id}`);
    postDocument.get()
        .then(doc => {
            if (!doc.exists)
                return res.status(404).json({ error: 'Post does not exist' });
            postData = doc.data();
            return db.doc(`/groups/${postData.group}`).get()
                .then(doc => {
                    const modIdx = doc.data().members.findIndex(member => member.userId === req.user.uid && member.role !== 'member');
                    if (postData.userId !== req.user.uid && modIdx < 0)
                        return res.status(403).json({ error: 'Unauthorized' });
                    postDocument.delete();
                    return res.json({ message: 'Posts and votes deleted' });
                });
        }).catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
}

module.exports = { createGroupPosts, getGroupPost, deleteGroupPost };