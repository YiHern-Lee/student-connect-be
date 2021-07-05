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
    if (req.body.startAt) {
        db.doc(`/forums/${req.body.startAt}`).get()
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
            console.log(newForum.title)
            res.json(newForum.title);
        }).catch(err => {
            res.status(500).json({ error: 'Something went wrong'});
            console.error(err);
        })
}

const getForumData = (req, res) => {
    let forumData = {};
    db.doc(`forums/${req.params.id}`).get()
        .then(doc => {
            forumInfo = {...doc.data()};
            return db.collection('posts').where('forum', '==', req.params.id).get()
        }).then(data => {
            let posts = [];
            data.forEach(doc => {
                let postData = {
                    ...doc.data(),
                    postId: doc.id
                };
                posts.push(postData);
            });
            forumData = { forumInfo: forumInfo, posts};
        }).then(() => {
            return res.json(forumData);
        }).catch(err => {
            return res.status(500).json({ error: err.code })
        })
}

module.exports = { getAllForums, createForum, getForumData, getForums };