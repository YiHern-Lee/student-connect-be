const { createUser, loginUser } = require('./authorizations');
const { getAllForums, createForum, getForums, getForumPosts } = require('./forums');
const { createPosts, getPost, deletePost, getPosts } = require('./posts');
const { uploadProfilePicture, updateUserDetails, getUserData, 
    getOtherUserData, markNotificationsRead } = require('./users');
const { upvotePost, downvotePost, removeUpvotePost, removeDownvotePost,
    upvoteComment, downvoteComment, removeUpvoteComment, removeDownvoteComment } = require('./votes');
const { createComment, deleteComment } = require('./comments');
const { followForum, unfollowForum } = require('./follows');
const { createGroup } = require('./groups');
const { getMarketplace, createMarketPosts } = require('./marketplace');

module.exports = { createUser, loginUser, getAllForums, 
    createForum, createPosts, 
    uploadProfilePicture, updateUserDetails, getUserData,
    getPost, upvotePost, downvotePost, createComment, removeUpvotePost,
    removeDownvotePost, upvoteComment, downvoteComment, removeDownvoteComment, 
    removeUpvoteComment, deleteComment, deletePost, getOtherUserData,
    followForum, unfollowForum, markNotificationsRead, getPosts, getForums, createGroup, getForumPosts, 
    getMarketplace, createMarketPosts };