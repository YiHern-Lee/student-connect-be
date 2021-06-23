const { firebaseConfig, admin, db } = require('../util/admin');
const { consolidateUserData } = require('../util/validators');

const uploadProfilePicture = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    let imageFileName;
    let imageUpload = {};

    const busboy = new BusBoy({ headers: req.headers });
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
            return res.status(400).json({ error: 'Wrong file type uploaded.' });
        }
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(Math.random()*100000000).toString()}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageUpload = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));
    });

    busboy.on('finish', () => {
        admin.storage().bucket().upload(imageUpload.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageUpload.mimetype
                }
            }
        }).then(() => {
            const userImageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`
            return db.doc(`/users/${req.user.uid}`).update({ userImageUrl });
        }).then(() => {
            return res.json({ message: 'Image uploaded successfully' });
        }).catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
    })
    busboy.end(req.rawBody);
}

const updateUserDetails = (req, res) => {
    let userDetails = consolidateUserData(req.body);

    db.doc(`/users/${req.user.uid}`).update(userDetails)
        .then(() => {
            return res.json({ message: 'Details added successfully' });
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        });
}

const getOtherUserData = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.params.id}`).get()
        .then(doc => {
            if (doc.exists) {
                userData.userDetails = doc.data()
            }
            return db.collection('posts')
                .where('userId', '==', req.params.id)
                .orderBy('createdAt', 'desc')
                .get()
        }).then(data => {
            if (!data.empty) {
                let posts = [];
                data.forEach(doc => {
                    posts.push({
                        ...doc.data(),
                        postId: doc.id
                    });
                });
                userData.posts = posts;
                return res.json(userData);
            }
        }).catch(err => {
            console.log(err)
            return res.status(500).json({ error: err.code });
        })
}

const getUserData = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.user.uid}`).get()
        .then(doc => {
            if (doc.exists) {
                userData.credentials = doc.data();
            }
            return db.collection('upvotes')
                .where('userId', '==', req.user.uid)
                .get();
        }).then(data => {
            userData.upvotes = [];
            if (!data.empty) {
                data.forEach(doc => {
                    userData.upvotes.push(doc.data().postId);
                });
            }
            return db.collection('downvotes')
                .where('userId', '==', req.user.uid)
                .get()
        }).then(data => {
            userData.downvotes = [];
            if (!data.empty) {
                data.forEach(doc => {
                    userData.downvotes.push(doc.data().postId);
                });
            }
            return db.collection('commentUpvotes')
            .where('userId', '==', req.user.uid)
            .get()
        }).then(data => {
            userData.commentUpvotes = [];
            if (!data.empty) {
                data.forEach(doc => {
                    userData.commentUpvotes.push(doc.data().commentId);
                });
            }
            return db.collection('commentDownvotes')
                .where('userId', '==', req.user.uid)
                .get()
        }).then(data => {
            userData.commentDownvotes = [];
            if (!data.empty) {
                data.forEach(doc => {
                    userData.commentDownvotes.push(doc.data().commentId);
                });
            }
            return db.collection('follows')
                .where('userId', '==', req.user.uid)
                .get()
        }).then(data => {
            userData.forumFollows = [];
            if (!data.empty) {
                data.forEach(doc => {
                    userData.forumFollows.push(doc.data().forumId);
                });
            }
            return res.json(userData);
        }).catch(err => {
            return res.status(500).json({ error: err.code });
        })
}

module.exports = { uploadProfilePicture, updateUserDetails, getUserData, getOtherUserData }