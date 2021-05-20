const { db } = require('../util/admin');

const getAllPosts = (req, res) => {
    db.collection("posts").get()
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

module.exports = { getAllPosts }