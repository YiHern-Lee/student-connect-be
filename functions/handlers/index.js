const { createUser, loginUser } = require('./authorizations');
const { getAllForums, createForum, getForumData } = require('./forums');
const { createPosts, getAllPosts, getPost, deletePost } = require('./posts');
const { uploadProfilePicture, updateUserDetails, getUserData, getOtherUserData } = require('./users');
const { upvotePost, downvotePost, removeUpvotePost, removeDownvotePost,
    upvoteComment, downvoteComment, removeUpvoteComment, removeDownvoteComment } = require('./votes');
const { createComment, deleteComment } = require('./comments');
const { followForum, unfollowForum } = require('./follows');

module.exports = { createUser, loginUser, getAllForums, 
    createForum, getForumData, createPosts, 
    getAllPosts, uploadProfilePicture, updateUserDetails, getUserData,
    getPost, upvotePost, downvotePost, createComment, removeUpvotePost,
    removeDownvotePost, upvoteComment, downvoteComment, removeDownvoteComment, 
    removeUpvoteComment, deleteComment, deletePost, getOtherUserData,
    followForum, unfollowForum };