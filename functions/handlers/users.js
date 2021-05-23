const { firebaseConfig, admin, db } = require('../util/admin');

const firebase = require('firebase');
const { validateSignUpData, validateLoginData } = require('../util/validators');
firebase.initializeApp(firebaseConfig);

const createUser = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    const userValidation = validateSignUpData(newUser);
    if (!userValidation.valid) {
        return res.status(400).json(userValidation.errors)
    }
    
    let token, userId;
    db.doc(`/users/${newUser.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                return res.status(400).json({ handle: `Handle ${newUser.handle} is already taken.` })
            } else {
                return firebase.auth()
                    .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        }).then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        }).then(idToken => {
            token = idToken;
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: admin.firestore.Timestamp.fromDate(new Date()),
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        }).then(() => {
            return res.status(201).json({ token });
        }).catch(err => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: 'Email is already in use.' })
            } else {
                return res.status(500).json({ error: err.code });
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
            if (err.code === 'auth/wrong-password') {
                return res.status(403).json({ general: 'Wrong credentials, please try again.' });
            } else return res.status(500).json({ error: err.code });
        });
}

module.exports = { createUser, loginUser };