const { db, admin } = require('../util/admin');
const { validateGroupCreation } = require('../util/validators');

const createGroup = (req, res) => {
    const newGroup = {
        createdAt: new Date().toISOString(),
        ownerId: req.user.uid,
        owner: req.user.username,
        moderators: [],
        title: req.body.title
    }

    const groupValidation = validateGroupCreation(newGroup);
    if (!groupValidation.valid) {
        return res.status(400).json(groupValidation.errors);
    }

    db.doc(`/groups/${newGroup.title}`).get()
        .then(doc => {
            if (doc.exists) return res.status(400).json({ title: 'A group of the same title exists' });
            else return db.doc(`/groups/${newGroup.title}`).set(newGroup);
        }).then(() => {
            res.json(newGroup.title);
        }).catch(err => {
            res.status(500).json({ error: err.code });
        })
}

module.exports = { createGroup };