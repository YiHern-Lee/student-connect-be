const { errorMessages } = require("./errorMessages");

const isEmpty = (string) => {
    return string.trim() === '' ? true : false;
};

const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return email.match(regEx)  ? true : false;
};

const validateSignUpData = (data) => {
    let errors = {};

    if (isEmpty(data.email)) {
        errors.email = errorMessages.emailEmpty;
    } else if (!isEmail(data.email)) {
        errors.email = errorMessages.emailInvalid;
    }

    if (isEmpty(data.password)) errors.password = errorMessages.passwordEmpty;
    if (data.password !== data.confirmPassword) errors.confirmPassword = errorMessages.confirmPasswordMismatch;
    if (isEmpty(data.handle)) errors.handle = errorMessages.handleEmpty;

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

    if (isEmpty(data.password)) error.password = errorMessages.passwordEmpty;

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false,
    }
}


module.exports = { validateSignUpData, validateLoginData };