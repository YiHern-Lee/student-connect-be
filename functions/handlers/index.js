const { createUser, loginUser } = require('./authorizations');
const { getAllForums, createForum, getForumData } = require('./forums');
const { createPosts, getAllPosts, getPost, deletePost } = require('./posts');
const { uploadProfilePicture, updateUserDetails, getUserData } = require('./users');
const { upvotePost, downvotePost, removeUpvotePost, removeDownvotePost,
    upvoteComment, downvoteComment, removeUpvoteComment, removeDownvoteComment } = require('./votes');
const { createComment, deleteComment } = require('./comments');

module.exports = { createUser, loginUser, getAllForums, 
    createForum, getForumData, createPosts, 
    getAllPosts, uploadProfilePicture, updateUserDetails, getUserData,
    getPost, upvotePost, downvotePost, createComment, removeUpvotePost,
    removeDownvotePost, upvoteComment, downvoteComment, removeDownvoteComment, 
    removeUpvoteComment, deleteComment, deletePost };