const { db, admin } = require('../util/admin');
const { validateMarketPostCreation } = require('../util/validators');

const createMarketPosts = (req, res) => {
    const newPost = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        title: req.body.title,
        username: req.user.username,
        userImageUrl: req.user.userImageUrl,
        userId: req.user.uid,
        forum: req.params.id,
        votes: 0,
        commentCount: 0,
        imageUrl: req.body.imageUrl,
        price: req.body.price,
        module: req.body.module
    }

    const postValidation = validateMarketPostCreation(newPost);
    if (!postValidation.valid) return res.status(400).json(postValidation.errors);

    db.doc(`/marketplace/${newPost.title}`).get()
        .then(doc => {
            if(doc.exists) {
                return res.status(400).json({ title: 'A listing of the same title exists' });
            } else {
                return db.doc(`/marketplace/${newPost.title}`).set(newPost);
            }
        }).then(() => {
            res.json(newPost.title);
        }).catch(err => {
            res.status(500).json({ error: 'Something went wrong'});
            console.error(err);
        })
}

const getMarketplace = (req, res) => {
    db.collection('marketplace').get()
        .then(data => {
            let marketplace = [];
            data.forEach((doc) => {
                forums.push(doc.data());
            });
            return res.json(marketplace);
        }).catch((err) => {
            console.error(err);
        });
}

module.exports = { getMarketplace, createMarketPosts };