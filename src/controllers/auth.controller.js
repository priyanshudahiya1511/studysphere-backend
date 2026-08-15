import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateOTP, sendVerificationEmail } from "../utils/sendEmail.js";
import { saveOtp, getOTP, deleteOTP } from "../utils/otpStore.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.createAccessToken();
        const refreshToken = user.createRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        console.log(
            "Something went wrong while generating access and refresh token",
            error
        );
        throw new Error("Token generation failed");
    }
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res
                .status(409)
                .json({ message: "User already exists with this email" });
        }

        const otp = generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);

        await saveOtp(normalizedEmail, hashedOtp, {
            name,
            email: normalizedEmail,
            password,
        });

        await sendVerificationEmail(normalizedEmail, otp);

        return res.status(200).json({
            message:
                "OTP sent to email. Please verify to complete registration.",
        });
    } catch (error) {
        console.log("Register error:", error.message);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res
                .status(400)
                .json({ message: "Email and OTP are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const record = getOTP(normalizedEmail);

        if (!record) {
            return res
                .status(400)
                .json({ message: "OTP not found. Please register again." });
        }

        if (record.expiry < new Date()) {
            deleteOTP(normalizedEmail);
            return res
                .status(400)
                .json({ message: "OTP expired. Please register again." });
        }

        const isOtpValid = await bcrypt.compare(otp, record.hashedOtp);
        if (!isOtpValid) {
            return res
                .status(400)
                .json({ message: "Invalid OTP. Please try again." });
        }

        const { name, password } = record.userData;

        const newUser = await User.create({
            name,
            email: normalizedEmail,
            password,
            isVerified: true,
        });

        deleteOTP(normalizedEmail);

        const createdUser = await User.findById(newUser._id).select(
            "-password -refreshToken"
        );
        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(newUser._id);

        return res.status(201).json({
            message: "Email verified! Registration complete.",
            user: createdUser,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.log("Verify OTP error:", error.message);
        return res.status(500).json({ message: "Something went wrong" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!existingUser.isVerified) {
            return res
                .status(401)
                .json({ message: "Please verify your email first" });
        }

        const isPasswordCorrect =
            await existingUser.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(existingUser._id);
        const userData = await User.findById(existingUser._id).select(
            "-password -refreshToken"
        );

        return res.status(200).json({
            message: "Login successful",
            user: userData,
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.log("Error in loginUser", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logoutUser = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $unset: { refreshToken: 1 } },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.log("Error in logoutUser", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = generateOTP();
        const hashedOtp = await bcrypt.hash(otp, 10);

        await saveOtp(normalizedEmail, hashedOtp, {});

        await sendVerificationEmail(normalizedEmail, otp);

        return res.status(200).json({
            message: "OTP sent to your email.",
        });
    } catch (error) {
        console.log("Error in forgotPassword", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const verifyForgotPasswordOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res
                .status(400)
                .json({ message: "Email and OTP are required" });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const record = getOTP(normalizedEmail);

        if (!record) {
            return res
                .status(400)
                .json({ message: "OTP not found. Please try again." });
        }

        if (record.expiry < new Date()) {
            deleteOTP(normalizedEmail);
            return res
                .status(400)
                .json({ message: "OTP expired. Please try again." });
        }

        const isOtpValid = await bcrypt.compare(otp, record.hashedOtp);
        if (!isOtpValid) {
            return res
                .status(400)
                .json({ message: "Invalid OTP. Please try again." });
        }

        deleteOTP(normalizedEmail);

        const resetToken = jwt.sign(
            { email: normalizedEmail },
            process.env.JWT_ACCESS_TOKEN_SECRET,
            { expiresIn: "10m" }
        );

        return res.status(200).json({
            message: "OTP verified. You can now reset your password.",
            resetToken,
        });
    } catch (error) {
        console.log("Error in verifyForgotPasswordOTP", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res
                .status(400)
                .json({ message: "Token and new password are required" });
        }

        if (newPassword.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters" });
        }

        const decoded = jwt.verify(
            resetToken,
            process.env.JWT_ACCESS_TOKEN_SECRET
        );

        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            message: "Password reset successful. Please login.",
        });
    } catch (error) {
        console.log("Error in resetPassword", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res
                .status(400)
                .json({ message: "Refresh token is required" });
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decoded._id);

        if (user.refreshToken !== refreshToken) {
            return res
                .status(401)
                .json({ message: "Refresh token expired or used" });
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await generateAccessAndRefreshToken(user._id);

        return res.status(200).json({
            message: "Token refreshed successfully",
            accessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        console.log("Error in refreshAccessToken", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
