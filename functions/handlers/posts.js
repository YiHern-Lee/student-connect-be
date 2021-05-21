const { db, admin } = require('../util/admin');

const getAllPosts = (req, res) => {
    db.collection(`forums/${req.params.id}/posts`).get()
        .then(data => {
            let posts = [];
            data.forEach((doc) => {
                posts.push(doc.data());
            });
            return res.json(posts);
        }).catch((err) => {
            console.error(err);
        });
}

const createPosts = (req, res) => {
    const newPost = {
        body: req.body.body,
        createdAt: admin.firestore.Timestamp.fromDate(new Date()),
        title: req.body.title,
        userHandle: req.body.userHandle
    }

    db.collection(`forums/${req.params.id}/posts`).add(newPost)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully` });
        }).catch(err => {
            res.json.status(500).json({ error: 'Something went wrong.' })
        })
}

module.exports = { getAllPosts, createPosts }