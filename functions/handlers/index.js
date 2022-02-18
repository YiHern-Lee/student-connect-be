const { createUser, loginUser } = require('./authorizations');
const { getAllForums, createForum, getForums, getForumPosts } = require('./forums');
const { createPosts, getPost, deletePost, getPosts } = require('./posts');
const { uploadProfilePicture, updateUserDetails, getUserData, 
    getOtherUserData, markNotificationsRead } = require('./users');
const { upvotePost, downvotePost, removeUpvotePost, removeDownvotePost,
    upvoteComment, downvoteComment, removeUpvoteComment, removeDownvoteComment,
    upvoteGroupPost, downvoteGroupPost, removeUpvoteGroupPost, removeDownvoteGroupPost } = require('./votes');
const { createComment, deleteComment, createGroupPostComment, createMarketplaceListingComment } = require('./comments');
const { followForum, unfollowForum } = require('./follows');
const { createGroup, getGroupInfo, getGroupPosts } = require('./groups');
const { addMember, getUserGroups, makeModerator, removeModerator, removeMember } = require('./groupMembers');
const { createGroupPosts, getGroupPost, deleteGroupPost } = require('./groupPosts');
const { createMarketplaceListings, getMarkplaceListings, getMarketplaceListing, deleteListing } = require('./marketplace');

module.exports = { createUser, loginUser, getAllForums, 
    createForum, createPosts, 
    uploadProfilePicture, updateUserDetails, getUserData,
    getPost, upvotePost, downvotePost, createComment, removeUpvotePost,
    removeDownvotePost, upvoteComment, downvoteComment, removeDownvoteComment, 
    removeUpvoteComment, deleteComment, deletePost, getOtherUserData,
    followForum, unfollowForum, markNotificationsRead, getPosts, 
    getForums, createGroup, getForumPosts, createGroup, 
    createGroupPosts, getGroupInfo, getGroupPosts, addMember,
    getGroupPost, deleteGroupPost, createGroupPostComment,
    upvoteGroupPost, downvoteGroupPost, removeUpvoteGroupPost, removeDownvoteGroupPost,
    getUserGroups, makeModerator, removeModerator, removeMember, createMarketplaceListings, 
    getMarkplaceListings, getMarketplaceListing, createMarketplaceListingComment, deleteListing };