import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../config/db.js";
import apiError from "../utils/apiError.js";
import { serializeUser } from "../utils/serializeUser.js";

dotenv.config();

const authMiddleware = async (req, res, next) => {
    try {
        const atoken = req.cookies?.atoken || req.header("Authorization")?.replace("Bearer ", "");

        if (!atoken) {
            throw new apiError(401, "Unauthorized - no access token");
        }

        let decode;
        try {
            decode = jwt.verify(atoken, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            throw new apiError(401, "Unauthorized - invalid or expired token");
        }

        const result = await db.query("SELECT * FROM users WHERE id = $1", [decode.id]);
        if (result.rowCount === 0) {
            throw new apiError(401, "Unauthorized - user no longer exists");
        }

        req.user = result.rows[0];
        req.userSerialized = serializeUser(result.rows[0]);
        next();
    } catch (error) {
        next(error);
    }
};

export default authMiddleware;
