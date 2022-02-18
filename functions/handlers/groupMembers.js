const { db, admin } = require('../util/admin');

const addMember = (req, res) => {
    const groupRef = db.doc(`/groups/${req.params.id}`);
    let groupData;
    groupRef.get()
        .then(doc => {
            if (!doc.exists) return res.status(400).json({ user: 'Group does not exist' });
            groupData = doc.data();
            let modIdx = groupData.members.findIndex(member => member.userId === req.user.uid && member.role === 'moderator');
            if (modIdx < 0 && groupData.ownerId !== req.user.uid) 
                return res.status(404).json({ user: 'Unauthorised to add member' });
            return db.collection('groupMembers')
                .where('username', '==', req.body.username)
                .where('groupId', '==', req.params.id)
                .limit(1)
                .get()
                .then(data => {
                    if (!data.empty) return res.status(400).json({ user: 'User is already a member' });
                     else return db.collection('users')
                        .where('username', '==', req.body.username)
                        .limit(1)
                        .get()
                        .then(data => {
                            if (data.empty) return res.status(404).json({ user: 'User does not exists' });
                            const userData = data.docs[0].data();
                            const newMember = {
                                userId: userData.userId,
                                username: userData.username,
                                groupId: req.params.id
                            };
                            const batch = db.batch();
                            const groupMemberRef = db.collection('groupMembers').doc();
                            batch.set(groupMemberRef, newMember);
                            const userRole = { 
                                username: userData.username, 
                                userId: userData.userId,
                                role: 'member' };
                            groupData.members.push(userRole);
                            batch.update(groupRef, { members: groupData.members });
                            batch.commit();
                            return res.json(userRole);
                        })
                })
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ error: err.code });
        })
}

const removeMember = (req, res) => {
    const groupRef = db.doc(`/groups/${req.params.id}`);
    let groupData;
    groupRef.get()
        .then(doc => {
            if (!doc.exists) return res.status(400).json({ error: 'Group does not exist' });
            groupData = doc.data();
            let modIdx = groupData.members.findIndex(member => member.userId === req.user.uid && member.role === 'moderator');
            if (modIdx < 0 && groupData.ownerId !== req.user.uid) 
                return res.status(404).json({ error: 'Unauthorised to remove member' });
            return db.collection('groupMembers')
                .where('userId', '==', req.body.userId)
                .where('groupId', '==', req.params.id)
                .limit(1)
                .get()
                .then(data => {
                    if (data.empty) return res.status(400).json({ error: 'User is not a member' });
                    const batch = db.batch();
                    batch.delete(data.docs[0].ref);
                    const memberIdx = groupData.members.findIndex(member => member.userId === req.body.userId);
                    groupData.members.splice(memberIdx, 1);
                    batch.set(groupRef, groupData);
                    batch.commit();
                    return res.json(req.body.userId);
                })
        }).catch(err => {
            console.log(err);
            res.status(500).json({ error: err.code });
        })
}

const getUserGroups = (req, res) => {
    db.collection('groupMembers')
        .where('userId', '==', req.user.uid)
        .get()
        .then(data => {
            let groups = [];
            data.forEach(doc => {
                groups.push({ title: doc.data().groupId });
            });
            return res.json(groups);
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ error: err.code });
        })
}

const makeModerator = (req, res) => {
    const groupRef = db.doc(`/groups/${req.params.id}`);
    let groupData;
    groupRef.get()
        .then(doc => {
            if (!doc.exists) return res.status(404).json({ error: 'Group does not exists' });
            groupData = doc.data();
            if (groupData.ownerId !== req.user.uid) return res.status(403).json({ error: 'Unauthorised' });
            const memberIdx = groupData.members.findIndex(member => member.userId === req.body.userId);
            if (memberIdx < 0) return res.status(400).json({ error: 'Member does not exist' });
            else if (groupData.members[memberIdx].role == 'owner') return res.status(400).json({ error: 'Owner cannot be made moderator' })
            else groupData.members[memberIdx].role = 'moderator';
            return groupRef.set(groupData)
                .then(() => {
                    return res.json({ message: 'Member is now a moderator' });
                })
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ error: err.code });
        })
}

const removeModerator = (req, res) => {
    const groupRef = db.doc(`/groups/${req.params.id}`);
    let groupData;
    groupRef.get()
        .then(doc => {
            if (!doc.exists) return res.status(404).json({ error: 'Group does not exists' });
            groupData = doc.data();
            if (groupData.ownerId !== req.user.uid) return res.status(403).json({ error: 'Unauthorised' });
            const memberIdx = groupData.members.findIndex(member => member.userId === req.body.userId);
            if (memberIdx < 0) return res.status(400).json({ error: 'Member does not exist' });
            else if (groupData.members[memberIdx].role == 'owner') return res.status(400).json({ error: 'Owner cannot be made member' })
            else groupData.members[memberIdx].role = 'member';
            return groupRef.set(groupData)
                .then(() => {
                    return res.json({ message: 'Moderator is now a member' });
                })
        }).catch(err => {
            console.log(err);
            return res.status(500).json({ error: err.code });
        })
}

module.exports = { addMember, getUserGroups, makeModerator, removeModerator, removeMember };