const errorMessages = {
    emailEmpty: 'Email must not be empty',
    emailInvalid: 'Must be a valid email address',
    passwordEmpty: 'Password must not be empty',
    passWordTooShort: 'Password must be 6 or more characters long',
    confirmPasswordEmpty: 'Confirm password must not be empty',
    confirmPasswordMismatch: 'Please make sure that you retyped the correct password',
    usernameEmpty: 'Username must not be empty',
    forumTitleEmpty: 'Forum title must not be empty',
    forumTitleInvalid: 'Forum title must not contain whitespace',
    forumFacultyEmpty: 'Forum faculty must not be empty',
    groupTitleEmpty: 'Group title must not be empty',
    groupTitleInvalid: 'Group title must not contain whitespace',
    postTitleEmpty: 'Post title must not be empty',
    postBodyEmpty: 'Post body must not be empty',
    marketPostNoImage: 'Marketplace listing needs to have image',
    marketPostPriceEmpty: 'Price must not be empty',
    moduleEmpty: 'Module code must not be empty',
    moduleInvalid: 'Module code is not valid'
}

module.exports = { errorMessages };