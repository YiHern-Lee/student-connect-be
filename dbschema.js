let db = {
    users: [
        {
            userId: '(auto-generated)',
            email: 'user@email.com',
            handle: 'user',
            createdAt: 'May 19, 2021 at 10:48:20 PM UTC+8',
            imageUrl: 'image/abcdefg',
            bio: 'Hello',
            major: 'Computer Science',
        }
    ],

    forums: [
        {
            forumId: '(auto-generated)',
            title: 'CS1101S',
            posts: [
                {
                    userHandle: 'user',
                    title: 'My post',
                    body: 'Hello',
                    createdAt: 'May 19, 2021 at 10:48:20 PM UTC+8',
                    likes: [
                        {
                            userHandle: 'user',
                            likedAt: 'May 19, 2021 at 10:48:20 PM UTC+8',
                        }
                    ],
                    comments: [
                        {
                            userHandle: 'user',
                            body: 'Hello',
                            createdAt: 'May 19, 2021 at 10:48:20 PM UTC+8',
                        }   
                    ]
                }
            ]

        },
    ],
}