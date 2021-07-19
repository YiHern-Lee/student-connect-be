const { db, admin } = require('../util/admin');
const { validateForumCreation } = require('../util/validators');

const getAllForums = (req, res) => {
    db.collection('forums').get()
        .then(data => {
            let forums = [];
            data.forEach((doc) => {
                forums.push(doc.data());
            });
            return res.json(forums);
        }).catch((err) => {
            console.error(err);
        });
}

const getForums = (req, res) => {
    if (req.body.startAfter) {
        db.doc(`/forums/${req.body.startAfter}`).get()
            .then(doc => {
                db.collection('forums')
                    .orderBy(req.body.filter, 'desc')
                    .startAfter(doc)
                    .limit(req.body.limit)
                    .get()
                    .then(data => {
                        let forums = [];
                        data.forEach(doc => {
                            forums.push(doc.data());
                        })
                        return res.json(forums);
                    }).catch(err => {
                        console.log(err)
                        return res.status(500).json({ error: err.code });
                    })
            })
    }
    else db.collection('forums')
        .orderBy(req.body.filter, 'desc')
        .limit(req.body.limit)
        .get()
        .then(data => {
            let forums = [];
            data.forEach(doc => {
                forums.push(doc.data());
            })
            return res.json(forums);
        }).catch(err => {
            console.log(err)
            return res.status(500).json({ error: err.code });
        })
}

const createForum = (req, res) => {
    const newForum = {
        faculty: req.body.faculty,
        title: req.body.title,
        createdAt: new Date().toISOString(),
        numOfPosts: 0,
        updatedAt: new Date().toISOString()
    }

    const forumValidation = validateForumCreation(newForum);
    if (!forumValidation.valid) {
        return res.status(400).json(forumValidation.errors)
    }

    db.doc(`/forums/${newForum.title}`).get()
        .then(doc => {
            if(doc.exists) {
                return res.status(400).json({ title: 'A forum of the same title exists' });
            } else {
                return db.doc(`/forums/${newForum.title}`).set(newForum);
            }
        }).then(() => {
            res.json(newForum.title);
        }).catch(err => {
            res.status(500).json({ error: 'Something went wrong'});
            console.error(err);
        })
}

const getForumPosts = (req, res) => {
    if (req.body.startAfter)
        db.doc(`/posts/${req.body.startAfter}`).get()
            .then(doc => {
                db.collection('posts')
                    .where('forum', '==', req.params.id)
                    .orderBy(req.body.filter, 'desc')
                    .startAfter(doc)
                    .limit(10)
                    .get()
                    .then(data => {
                        let posts = [];
                        data.forEach(doc => {
                            posts.push({
                                ...doc.data(),
                                postId: doc.id,
                            });
                        })
                        return res.json(posts);
                    }).catch(err => {
                        console.log(err)
                        return res.status(500).json({ error: err.code });
                    })
            })
    else { 
        let forumData = {};
        db.doc(`/forums/${req.params.id}`)
            .get()
            .then(doc => {
                forumData = {
                    forumInfo: doc.data()
                };
                return db.collection('posts')
                    .where('forum', '==', req.params.id)
                    .orderBy(req.body.filter, 'desc')
                    .limit(10)
                    .get()
                    .then(data => {
                        let posts = [];
                        data.forEach(doc => {
                            posts.push({
                                ...doc.data(),
                                postId: doc.id,
                            });
                        });
                        forumData = {
                            ...forumData,
                            posts
                        };
                    });
            }).then(() => {
                return res.json(forumData);
            }).catch(err => {
            console.log(err)
            return res.status(500).json({ error: err.code });
        })
    }
}

module.exports = { getAllForums, createForum, getForums, getForumPosts };