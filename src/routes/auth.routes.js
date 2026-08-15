import express from "express";
import {
    registerUser,
    verifyOtp,
    loginUser,
    logoutUser,
    forgotPassword,
    verifyForgotPasswordOTP,
    resetPassword,
    refreshAccessToken,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.post("/verify-otp", authLimiter, verifyOtp);
router.post("/login", authLimiter, loginUser);
router.post("/logout", protectRoute, logoutUser);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post(
    "/verify-forgot-password-otp",
    authLimiter,
    verifyForgotPasswordOTP
);
router.post("/reset-password", authLimiter, resetPassword);
router.post("/refresh-access-token", refreshAccessToken);

export default router;
