let db = {
    users: [
        {
            userId: '(auto-generated)',
            email: 'user@email.com',
            username: 'user',
            createdAt: '2021-06-03T08:48:04.968Z',
            imageUrl: 'image/abcdefg',
            bio: 'Hello',
            major: 'Computer Science',
        }
    ],

    forums: [
        {
            forumId: '(auto-generated)',
            faculty: 'School of Computing',
            title: 'CS1101S',
        }
    ],

    posts: [
        {
            body: "Hello",
            createdAt: "2021-06-03T08:48:04.968Z",
            forum: 'CS1101S',
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/student-connect-3d3e3.appspot.com/o/57558964.jpeg?alt=media',
            title: 'Hello everyone',
            username: 'user9'
        }
    ],

    comments: [
        {
            username: 'user',
            imageUrl: 'z',
            postId: '(auto-generated)',
            body: '',
            createdAt: '2021-06-03T08:48:04.968Z',
            likeCount: 0
        }
    ]
};

// Redux data 
const userData = {
    credentials: {
        userId: '',
        email: 'user@email.com',
        username: 'user',
        createdAt: '2021-06-03T08:48:04.968Z',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/student-connect-3d3e3.appspot.com/o/57558964.jpeg?alt=media',
        bio: 'Hello',
        major: 'Comp Science'
    },
    likes: {
        
    }
}
