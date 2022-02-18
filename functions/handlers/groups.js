const { db, admin } = require('../util/admin');
const { validateGroupCreation } = require('../util/validators');

const createGroup = (req, res) => {
    const newGroup = {
        createdAt: new Date().toISOString(),
        ownerId: req.user.uid,
        owner: req.user.username,
        members: [],
        title: req.body.title,
        numOfPosts: 0
    }

    const groupValidation = validateGroupCreation(newGroup);
    if (!groupValidation.valid) {
        return res.status(400).json(groupValidation.errors);
    }

    db.doc(`/groups/${newGroup.title}`).get()
        .then(doc => {
            if (doc.exists) return res.status(400).json({ title: 'A group of the same title exists' });
            else {
                const batch = db.batch();
                batch.set(db.doc(`/groups/${newGroup.title}`), newGroup);
                const newMember = {
                    userId: req.user.uid,
                    username: req.user.username,
                    groupId: req.body.title
                };
                const groupMemberRef = db.collection('/groupMembers').doc();
                batch.set(groupMemberRef, newMember);
                batch.commit();
                return res.json(newGroup.title);
            };
        }).catch(err => {
            res.status(500).json({ error: err.code });
        })
}

const getGroupPosts = (req, res) => {
    db.doc(`/groups/${req.params.id}`).get()
        .then(doc => {
            const groupData = doc.data();
            const memberExists = groupData.members.filter(member => member.userId === req.user.uid).length;
            if (!memberExists && doc.data().ownerId !== req.user.uid) 
                return res.status(400).json({ error: 'User is not a member of this group' });
            if (req.body.startAfter) {
                db.doc(`/groupPosts/${req.body.startAfter}`).get()
                    .then(doc => {
                        db.collection(`/groupPosts`)
                            .where('group', '==', req.params.id)
                            .orderBy(req.body.sort, 'desc')
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
                                console.log(err);
                                return res.status(500).json({ error: err.code });
                            })
                    })
            } else {
                return db.collection(`/groupPosts`)
                    .where('group', '==', req.params.id)
                    .orderBy(req.body.sort, 'desc')
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
                        return res.json(posts);
                    }).catch(err => {
                        console.log(err);
                        return res.status(500).json({ error: err.code });
                    })
            }
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ error: err.code });
        })
}

const getGroupInfo = (req, res) => {
    db.doc(`/groups/${req.params.id}`)
            .get()
            .then(doc => {
                return res.json(doc.data());
            }).catch(err => {
                console.log(err);
                return res.status(500).json({ error: err.code });
            })
}

module.exports = { createGroup, getGroupPosts, getGroupInfo };