import db from "../config/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import apiError from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { sendVerificationEmail, sendResetVerificationEmail } from "../services/email.service.js";
import { accessToken, refressToken } from "../utils/jwtToken.js";
import { serializeUser } from "../utils/serializeUser.js";
import { cookieOptions } from "../utils/cookieOptions.js";

const VERIFICATION_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

const userSignup = async (req, res, next) => {
    try {
        const { username, email, password, fullName } = req.body;

        if (!username || !email || !password) {
            throw new apiError(400, "username, email and password are required");
        }

        const existing = await db.query(
            "SELECT id FROM users WHERE email = $1 OR username = $2",
            [email, username]
        );
        if (existing.rowCount > 0) {
            throw new apiError(409, "Email or username already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiry = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

        const result = await db.query(
            `INSERT INTO users (username, email, password, full_name, verification_token, verification_token_expiry)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [username, email, hashedPassword, fullName || null, verificationToken, verificationTokenExpiry]
        );
        console.log("verify before sending email")

        await sendVerificationEmail(email, verificationToken);

        return apiResponse(
            res,
            201,
            true,
            "User registered successfully. Please verify your email.",
            serializeUser(result.rows[0])
        );
    } catch (error) {
        next(error);
    }
};

const userVerify = async (req, res, next) => {
    try {
        const token = req.params.token || req.query.token;
        if (!token) throw new apiError(400, "Verification token is required");

        const result = await db.query("SELECT * FROM users WHERE verification_token = $1", [token]);
        if (result.rowCount === 0) {
            throw new apiError(404, "Invalid verification token");
        }

        const verifyData = result.rows[0];
        if (verifyData.is_verified) {
            return apiResponse(res, 200, true, "Email already verified", null);
        }
        if (new Date(verifyData.verification_token_expiry) <= new Date()) {
            throw new apiError(400, "Verification link has expired. Please request a new one.");
        }

        await db.query(
            "UPDATE users SET is_verified = true, verification_token = NULL, verification_token_expiry = NULL WHERE id = $1",
            [verifyData.id]
        );

        return apiResponse(res, 200, true, "Email verified successfully", null);
    } catch (error) {
        next(error);
    }
};

const resendEmailVerification = async (req, res, next) => {
    try {
        const user = req.user;
        if (user.is_verified) {
            return apiResponse(res, 200, true, "Email is already verified", null);
        }
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiry = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
        await db.query(
            "UPDATE users SET verification_token = $1, verification_token_expiry = $2 WHERE id = $3",
            [verificationToken, verificationTokenExpiry, user.id]
        );
        await sendVerificationEmail(user.email, verificationToken);
        return apiResponse(res, 200, true, "Verification email sent", null);
    } catch (error) {
        next(error);
    }
};

const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new apiError(400, "email and password are required");
        }

        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rowCount === 0) {
            throw new apiError(404, "User not found");
        }
        const resultData = result.rows[0];

        const checkPassword = await bcrypt.compare(password, resultData.password);
        if (!checkPassword) {
            throw new apiError(401, "Invalid credentials");
        }

        if (!resultData.is_verified) {
            throw new apiError(403, "Please verify your email before logging in");
        }

        const atoken = accessToken(resultData.id);
        const rtoken = refressToken(resultData.id);

        await db.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [rtoken, resultData.id]);

        console.log("NODE_ENV =", process.env.NODE_ENV);
        console.log(cookieOptions);
        res.cookie("rtoken", rtoken, cookieOptions)
            .cookie("atoken", atoken, cookieOptions)
            .status(200)
            .json({
                success: true,
                message: "Login successful",
                data: { user: serializeUser(resultData) },
            });
    } catch (error) {
        next(error);
    }
};

const getCurrentUser = async (req, res, next) => {
    try {
        return apiResponse(res, 200, true, "Current user fetched", serializeUser(req.user));
    } catch (error) {
        next(error);
    }
};

const refressTokenAuth = async (req, res, next) => {
    try {
        const rtoken = req.cookies?.rtoken;
        if (!rtoken) {
            throw new apiError(401, "Refresh token missing");
        }

        let decode;
        try {
            decode = jwt.verify(rtoken, process.env.REFRESH_TOKEN_SECRET);
        } catch (error) {
            throw new apiError(401, "Invalid or expired refresh token");
        }

        const result = await db.query("SELECT * FROM users WHERE id = $1", [decode.id]);
        if (result.rowCount === 0) {
            throw new apiError(404, "User not found");
        }
        const user = result.rows[0];

        if (user.refresh_token !== rtoken) {
            throw new apiError(401, "Refresh token does not match");
        }

        const newAtoken = accessToken(user.id);
        const newRtoken = refressToken(user.id);

        await db.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [newRtoken, user.id]);

        res.cookie("atoken", newAtoken, cookieOptions)
            .cookie("rtoken", newRtoken, cookieOptions)
            .status(200)
            .json({ success: true, message: "Token refreshed", data: null });
    } catch (error) {
        next(error);
    }
};

const userLogout = async (req, res, next) => {
    try {
        await db.query("UPDATE users SET refresh_token = NULL WHERE id = $1", [req.user.id]);
        res.clearCookie("atoken", cookieOptions)
            .clearCookie("rtoken", cookieOptions)
            .status(200)
            .json({ success: true, message: "Logged out", data: null });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            throw new apiError(400, "oldPassword and newPassword are required");
        }

        const result = await db.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
        const user = result.rows[0];

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new apiError(401, "Current password is incorrect");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, user.id]);

        return apiResponse(res, 200, true, "Password changed successfully", null);
    } catch (error) {
        next(error);
    }
};

const forgetPassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        if (!email) throw new apiError(400, "email is required");

        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        // Don't leak whether the account exists.
        if (result.rowCount === 0) {
            return apiResponse(res, 200, true, "If an account exists for this email, a reset link has been sent", null);
        }

        const user = result.rows[0];
        const token = crypto.randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
        await db.query(
            "UPDATE users SET verification_token = $1, verification_token_expiry = $2 WHERE email = $3",
            [token, expiry, email]
        );
        await sendResetVerificationEmail(email, token);

        return apiResponse(res, 200, true, "If an account exists for this email, a reset link has been sent", null);
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const token = req.params.token || req.query.token;
        const { password } = req.body;
        if (!token) throw new apiError(400, "Reset token is required");
        if (!password) throw new apiError(400, "New password is required");

        const result = await db.query("SELECT * FROM users WHERE verification_token = $1", [token]);
        if (result.rowCount === 0) {
            throw new apiError(401, "Invalid or expired reset token");
        }
        const user = result.rows[0];
        if (user.verification_token_expiry && new Date(user.verification_token_expiry) <= new Date()) {
            throw new apiError(401, "Reset link has expired. Please request a new one.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            "UPDATE users SET password = $1, verification_token = NULL, verification_token_expiry = NULL WHERE id = $2",
            [hashedPassword, user.id]
        );

        return apiResponse(res, 200, true, "Password reset successful", null);
    } catch (error) {
        next(error);
    }
};

export {
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
};
