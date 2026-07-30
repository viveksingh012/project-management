import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    userSignup,
    userLogin,
    userVerify,
    resendEmailVerification,
    getCurrentUser,
    refressTokenAuth,
    userLogout,
    changePassword,
    forgetPassword,
    resetPassword,
} from "../controller/userSignup.js";

const router = express.Router();

router.post("/register", userSignup);
router.post("/login", userLogin);
router.post("/logout", authMiddleware, userLogout);
router.get("/current-user", authMiddleware, getCurrentUser);
router.post("/change-password", authMiddleware, changePassword);
router.post("/resend-email-verification", authMiddleware, resendEmailVerification);
router.post("/refresh-token", refressTokenAuth);
router.get("/verify-email/:token", userVerify);
router.post("/forgot-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
