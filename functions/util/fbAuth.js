const { admin, db } = require("./admin");

const FBAuth = (req, res, next) => {
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No Token found.');
        return res.status(403).json({ error: 'Unauthorized' });
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get();
        }).then(data => {
            req.user = { ...req.user, 
                username: data.docs[0].data().username,
                userImageUrl: data.docs[0].data().userImageUrl
            }
            return next();
        }).catch(err => {
            console.error('Error while verifying token ', err);
            return res.status(403).json(err)
        })
}

module.exports = { FBAuth };