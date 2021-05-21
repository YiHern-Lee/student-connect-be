const { db, admin } = require('../util/admin');

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

const createForum = (req, res) => {
    const newForum = {
        faculty: req.body.faculty,
        title: req.body.title,
        createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    }

    db.collection('forums')
        .add(newForum)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully` });
        }).catch(err => {
            res.status(500).json({ error: 'Something went wrong'});
            console.error(err);
        })
}

module.exports = { getAllForums, createForum };