const otpStore = {};

export const saveOtp = (email, hashedOtp, userData) => {
    otpStore[email] = {
        hashedOtp,
        expiry: new Date(Date.now() + 10 * 60 * 1000),
        userData,
    };
};

export const getOTP = (email) => {
    return otpStore[email];
};

export const deleteOTP = (email) => {
    delete otpStore[email];
};
