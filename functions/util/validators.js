const { errorMessages } = require("./errorMessages");

const isEmpty = (string) => {
    console.log(string)
    if (string)
        return string.trim() === '' ? true : false;
    else
        return true;
};

const isEmail = (email) => {
    if (email) {
        const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return email.match(regEx) ? true : false;
    } else return false;
};

const hasNoWhiteSpace = (string) => {
    if (string) {
        const regEx = /^\S*$/;
        return string.match(regEx) ? true : false;
    } else return false;
}

const validateSignUpData = (data) => {
    let errors = {};

    if (isEmpty(data.email)) {
        errors.email = errorMessages.emailEmpty;
    } else if (!isEmail(data.email)) {
        errors.email = errorMessages.emailInvalid;
    }

    if (isEmpty(data.password)) errors.password = errorMessages.passwordEmpty;
    if (data.password.length < 6) errors.password = errorMessages.passWordTooShort;
    if (isEmpty(data.confirmPassword)) {
        errors.confirmPassword = errorMessages.confirmPasswordEmpty;
    } else if (data.password !== data.confirmPassword) {
        errors.confirmPassword = errorMessages.confirmPasswordMismatch;
    }
    if (isEmpty(data.username)) errors.username = errorMessages.usernameEmpty;

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    }
}

const validateLoginData = (data) => {
    let errors = {};

    if (isEmpty(data.email)) {
        errors.email = errorMessages.emailEmpty
    } else if (!isEmail(data.email)) {
        errors.email = errorMessages.emailInvalid;
    }

    if (isEmpty(data.password)) errors.password = errorMessages.passwordEmpty;

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    }
}

const validateForumCreation = (data) => {
    let errors = {};
    if (isEmpty(data.title)) {
        errors.title = errorMessages.forumTitleEmpty;
    } else if (!hasNoWhiteSpace(data.title)) {
        errors.title = errorMessages.forumTitleInvalid;
    }

    if (isEmpty(data.faculty)) errors.faculty = errorMessages.forumFacultyEmpty;

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    }
}

const validateGroupCreation = (data) => {
    let errors = {};
    if (isEmpty(data.title)) {
        errors.title = errorMessages.groupTitleEmpty;
    } else if (!hasNoWhiteSpace(data.title)) {
        errors.title = errorMessages.groupTitleInvalid;
    }

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    }
}

const consolidateUserData = (data) => {
    const userDetails = {};
    console.log(data.bio)
    console.log(data.major)
    if (!isEmpty(data.bio)) userDetails.bio = data.bio;
    if (!isEmpty(data.major)) userDetails.major = data.major;

    return userDetails;
}

const validatePostCreation = (data) => {
    let errors = {};
    if (isEmpty(data.title)) errors.title = errorMessages.postTitleEmpty;
    if (isEmpty(data.body)) errors.body = errorMessages.postBodyEmpty;
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

module.exports = { validateSignUpData, validateLoginData, validateForumCreation, 
    consolidateUserData, validatePostCreation, validateGroupCreation };