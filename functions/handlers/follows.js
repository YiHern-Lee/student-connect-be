const { db, admin } = require('../util/admin');

const followForum = (req, res) => {
    db.doc(`/forums/${req.body.forumId}`).get()
        .then(doc => {
            if(!doc.exists) {
                return res.status(400).json({ error: 'Forum does not exists' });
            }
            return db.collection('follows')
                .where('userId', '==', req.user.uid)
                .where('forumId', '==', req.body.forumId)
                .limit(1)
                .get()
                .then(data => {
                    if(!data.empty) {
                        return res.status(400).json({ error: 'User is already following forum' });
                    }
                    const newFollow = {
                        userId: req.user.uid,
                        forumId: req.body.forumId,
                        username: req.user.username
                    }
                    db.collection('follows').add(newFollow)
                        .then(doc => {
                            return res.json({ forumId: req.body.forumId });
                        })
                })
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        })
        
}

const unfollowForum = (req, res) => {
    console.log(req.body.forumId)
    db.collection('follows')
        .where('userId', '==', req.user.uid)
        .where('forumId', '==', req.body.forumId)
        .limit(1)
        .get()
        .then(data => {
            return data.docs[0].ref.delete();
        }).then(() => {
            return res.json({ forumId: req.body.forumId })
        }).catch(err => {
            res.status(500).json({ error: err.code })
        })
}

module.exports = { followForum, unfollowForum };