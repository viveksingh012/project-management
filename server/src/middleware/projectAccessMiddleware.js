import db from "../config/db.js";
import apiError from "../utils/apiError.js";

// Ensures the logged-in user belongs to :projectId and attaches their
// membership (with role) to req.membership for downstream permission checks.
export const verifyProjectMembership = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const result = await db.query(
            "SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2",
            [projectId, req.user.id]
        );
        if (result.rowCount === 0) {
            throw new apiError(403, "You are not a member of this project");
        }
        req.membership = result.rows[0];
        next();
    } catch (error) {
        next(error);
    }
};

// role checks: 'admin' only, or 'admin'/'project_admin'
export const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.membership || !roles.includes(req.membership.role)) {
            return next(new apiError(403, "You do not have permission to perform this action"));
        }
        next();
    };
};
