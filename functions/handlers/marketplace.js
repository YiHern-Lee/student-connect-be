const { firebaseConfig, db, admin } = require('../util/admin');
const { validateMarketPostCreation } = require('../util/validators');

const createMarketplaceListings = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    let imageFileName;
    let imageUpload = {};
    let marketPostFields = {};
    let newMarketPost = {};

    const busboy = new BusBoy({ headers: req.headers });

    busboy.on('field', (fieldname, val) => {
        marketPostFields[`${fieldname}`] = val
    });

    busboy.on('file', (_, file, filename, __, mimetype) => {
        if (mimetype === 'image/jpeg' || mimetype === 'image/png') {
            const imageExtension = filename.split('.')[filename.split('.').length - 1];
            imageFileName = `${Math.round(Math.random()*100000000).toString()}.${imageExtension}`;
            const filepath = path.join(os.tmpdir(), imageFileName);
            imageUpload = { filepath, mimetype };
            file.pipe(fs.createWriteStream(filepath));
        }
    });

    busboy.on('finish', () => {
        marketPostFields.imageUrl = imageUpload.filepath;
        const postValidation = validateMarketPostCreation(marketPostFields);
        if (!postValidation.valid) return res.status(400).json(postValidation.errors);
        else {
            admin.storage().bucket().upload(imageUpload.filepath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: imageUpload.mimetype
                    }
                }
            }).then(() => {
                const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
                newMarketPost = {
                    ...marketPostFields,
                    price: parseFloat(marketPostFields.price),
                    imageUrl,
                    createdAt: new Date().toISOString(),
                    username: req.user.username,
                    userId: req.user.uid,
                    commentCount: 0,
                    userImageUrl: req.user.userImageUrl
                };
                return db.collection('marketplace').add(newMarketPost);
            }).then(doc => {
                res.json({ ...newMarketPost, postId: doc.id });
            }).catch(err => {
                console.error(err);
                res.status(500).json({ error: err.code });
            })
        }
    });

    busboy.end(req.rawBody);
}

const getMarkplaceListings = (req, res) => {
    if (req.body.startAfter) {
        if (req.body.filter) db.doc(`/marketplace/${req.body.startAfter}`).get()
            .then(doc => {
                db.collection('marketplace')
                    .orderBy(req.body.sort, req.body.dir)
                    .where('module', '==', req.body.filter)
                    .startAfter(doc)
                    .limit(10)
                    .get()
                    .then(data => {
                        let posts = [];
                        data.forEach(doc => {
                            posts.push({
                                ...doc.data(),
                                postId: doc.id
                            });
                        });
                        return res.json(posts);
                    }).catch(err => {
                        console.log(err)
                        return res.status(500).json({ error: err.code });
                    })
                })
        else db.doc(`/marketplace/${req.body.startAfter}`).get()
            .then(doc => {
                db.collection('marketplace')
                    .orderBy(req.body.sort, req.body.dir)
                    .startAfter(doc)
                    .limit(10)
                    .get()
                    .then(data => {
                        let posts = [];
                        data.forEach(doc => {
                            posts.push({
                                ...doc.data(),
                                postId: doc.id
                            });
                        });
                        return res.json(posts);
                    }).catch(err => {
                        console.log(err)
                        return res.status(500).json({ error: err.code });
                    })
                })
    } else {
        if (req.body.filter) 
            db.collection('marketplace')
                .orderBy(req.body.sort, req.body.dir)
                .where('module', '==', req.body.filter)
                .limit(10)
                .get()
                .then(data => {
                    let posts = [];
                    data.forEach(doc => {
                        posts.push({
                            ...doc.data(),
                            postId: doc.id
                        });
                    });
                    return res.json(posts);
                }).catch(err => {
                    console.log(err)
                    return res.status(500).json({ error: err.code });
                })
            else db.collection('marketplace')
                .orderBy(req.body.sort, req.body.dir)
                .limit(10)
                .get()
                .then(data => {
                    let posts = [];
                    data.forEach(doc => {
                        posts.push({
                            ...doc.data(),
                            postId: doc.id
                        });
                    });
                    return res.json(posts);
                }).catch(err => {
                    console.log(err)
                    return res.status(500).json({ error: err.code });
                })
    }
}

const getMarketplaceListing = (req, res) => {
    let listingData = {};
    db.doc(`marketplace/${req.params.id}`).get()
        .then(doc => {
            if (!doc.exists) {
                return res.status(404).json({ error: 'Listing not found' })
            };
            listingData = {
                postInfo: {
                    ...doc.data(),
                    postId: doc.id
                }
            }
            return db.collection('comments')
                .orderBy('votes', 'desc')
                .orderBy('createdAt', 'desc')
                .where('listingId', '==', doc.id)
                .get()
                .then(data => {
                    listingData.comments = [];
                    data.forEach(doc => {
                        let commentData = {
                            ...doc.data(),
                            commentId: doc.id
                        }
                        listingData.comments.push(commentData);
                    })
                    return res.json(listingData)
                })
        }).catch(err => {
            console.error(err)
            return res.status(500).json({ error: err.code })
        })
}

const deleteListing = (req, res) => {
    const listingDocument = db.doc(`marketplace/${req.params.id}`);
    listingDocument.get()
        .then(doc => {
            if (!doc.exists)
                return res.status(404).json({ error: 'Listing does not exist' });
            if (doc.data().userId !== req.user.uid)
                return res.status(403).json({ error: 'Unauthorized' });
            listingDocument.delete();
            return res.json({ message: 'Listing deleted' });
        }).catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
}

module.exports = { createMarketplaceListings, getMarkplaceListings, getMarketplaceListing, deleteListing };