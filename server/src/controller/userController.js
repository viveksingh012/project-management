// Lightweight debug endpoints, not used by the frontend directly.
import db from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { serializeUser } from "../utils/serializeUser.js";
import apiError from "../utils/apiError.js";

const userController = async (req, res, next) => {
    try {
        const result = await db.query("SELECT * FROM users ORDER BY created_at DESC LIMIT 50");
        return apiResponse(res, 200, true, "Users fetched", result.rows.map(serializeUser));
    } catch (error) {
        next(error);
    }
};

const userControllerId = async (req, res, next) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE id = $1", [req.params.id]);
        if (result.rowCount === 0) throw new apiError(404, "User not found");
        return apiResponse(res, 200, true, "User fetched", serializeUser(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

export { userController, userControllerId };
