const { firebaseConfig, admin, db } = require('../util/admin');

const firebase = require('firebase');
const { validateSignUpData, validateLoginData } = require('../util/validators');
firebase.initializeApp(firebaseConfig);

const createUser = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        username: req.body.username,
    };

    const userValidation = validateSignUpData(newUser);
    if (!userValidation.valid) {
        return res.status(400).json(userValidation.errors)
    }

    const noImg = 'no-img.png';
    
    let token, userId;

    db.collection('users').where('username', '==', newUser.username)
        .limit(1).get()
        .then(data => {
            if (data.empty) {
                firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
                    .then(data => {
                        userId = data.user.uid;
                        return data.user.getIdToken();
                    }).then(idToken => {
                        token = idToken;
                        const userCredentials = {
                            username: newUser.username,
                            email: newUser.email,
                            createdAt: new Date().toISOString(),
                            userImageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
                            userId
                        };
                        return db.doc(`/users/${userId}`).set(userCredentials);
                    }).then(() => {
                        return res.status(201).json({ token });
                    }).catch(err => {
                        if (err.code === 'auth/email-already-in-use') {
                            return res.status(400).json({ email: 'Email is already in use' })
                        } else {
                            return res.status(500).json({ error: err.code });
                        }
                    })
            } else {
                return res.status(400).json({ username: 'Username is already taken' })
            }
        })

    
}

const loginUser = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    };

    const userValidation = validateLoginData(user);
    if (!userValidation.valid) {
        return res.status(400).json(userValidation.errors);
    }

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        }).then(token => {
            return res.json({ token });
        }).catch(err => {
            console.error(err);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                return res.status(403).json({ general: 'Wrong credentials, please try again.' });
            } else return res.status(500).json({ error: err.code });
        });
}

module.exports = { createUser, loginUser };