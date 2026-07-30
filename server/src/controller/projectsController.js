import db from "../config/db.js";
import apiError from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

const serializeProject = (row) => ({
    _id: row.id,
    id: row.id,
    name: row.name,
    description: row.description,
    createdBy: row.created_by,
    memberCount: row.member_count !== undefined ? Number(row.member_count) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

const serializeMember = (row) => ({
    _id: row.id,
    id: row.id,
    role: row.role,
    createdAt: row.created_at,
    user: {
        _id: row.user_id,
        id: row.user_id,
        username: row.username,
        email: row.email,
        fullName: row.full_name,
        avatar: row.avatar,
    },
});

// GET /projects - list projects the current user is a member of
const getProjects = async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT p.*, COUNT(pm2.id) AS member_count
             FROM projects p
             JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
             LEFT JOIN project_members pm2 ON pm2.project_id = p.id
             GROUP BY p.id
             ORDER BY p.created_at DESC`,
            [req.user.id]
        );
        return apiResponse(res, 200, true, "Projects fetched", result.rows.map(serializeProject));
    } catch (error) {
        next(error);
    }
};

// POST /projects - create a project, creator becomes admin member
const createProjects = async (req, res, next) => {
    const client = await db.getClient();
    try {
        const { name, description } = req.body;
        if (!name || !name.trim()) {
            throw new apiError(400, "Project name is required");
        }

        await client.query("BEGIN");
        const projectResult = await client.query(
            `INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING *`,
            [name.trim(), description || null, req.user.id]
        );
        const project = projectResult.rows[0];

        await client.query(
            `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'admin')`,
            [project.id, req.user.id]
        );
        await client.query("COMMIT");

        return apiResponse(res, 201, true, "Project created", serializeProject({ ...project, member_count: 1 }));
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
};

// GET /projects/:projectId
const getProjectsWithId = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const result = await db.query(
            `SELECT p.*, COUNT(pm2.id) AS member_count
             FROM projects p
             LEFT JOIN project_members pm2 ON pm2.project_id = p.id
             WHERE p.id = $1
             GROUP BY p.id`,
            [projectId]
        );
        if (result.rowCount === 0) {
            throw new apiError(404, "Project not found");
        }
        return apiResponse(res, 200, true, "Project fetched", serializeProject(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// PUT /projects/:projectId (admin only)
const updateProjects = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { name, description } = req.body;

        const result = await db.query(
            `UPDATE projects SET
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                updated_at = now()
             WHERE id = $3
             RETURNING *`,
            [name, description, projectId]
        );
        if (result.rowCount === 0) {
            throw new apiError(404, "Project not found");
        }
        return apiResponse(res, 200, true, "Project updated", serializeProject(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// DELETE /projects/:projectId (admin only)
const deleteProjects = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const result = await db.query("DELETE FROM projects WHERE id = $1 RETURNING id", [projectId]);
        if (result.rowCount === 0) {
            throw new apiError(404, "Project not found");
        }
        return apiResponse(res, 200, true, "Project deleted", null);
    } catch (error) {
        next(error);
    }
};

// GET /projects/:projectId/members
const listPorjectsMembers = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const result = await db.query(
            `SELECT pm.*, u.username, u.email, u.full_name, u.avatar
             FROM project_members pm
             JOIN users u ON u.id = pm.user_id
             WHERE pm.project_id = $1
             ORDER BY pm.created_at ASC`,
            [projectId]
        );
        return apiResponse(res, 200, true, "Members fetched", result.rows.map(serializeMember));
    } catch (error) {
        next(error);
    }
};

// POST /projects/:projectId/members (admin only) - add by email
const addPorjectsMembers = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { email, role } = req.body;
        if (!email) throw new apiError(400, "email is required");

        const userResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rowCount === 0) {
            throw new apiError(404, "No user found with that email");
        }
        const user = userResult.rows[0];

        const existing = await db.query(
            "SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2",
            [projectId, user.id]
        );
        if (existing.rowCount > 0) {
            throw new apiError(409, "User is already a member of this project");
        }

        const validRoles = ["admin", "project_admin", "member"];
        const memberRole = validRoles.includes(role) ? role : "member";

        const result = await db.query(
            `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) RETURNING *`,
            [projectId, user.id, memberRole]
        );

        return apiResponse(
            res,
            201,
            true,
            "Member added",
            serializeMember({
                ...result.rows[0],
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                avatar: user.avatar,
            })
        );
    } catch (error) {
        next(error);
    }
};

// PUT /projects/:projectId/members/:userId (admin only)
const updatePorjectsMembers = async (req, res, next) => {
    try {
        const { projectId, userId } = req.params;
        const { role } = req.body;
        const validRoles = ["admin", "project_admin", "member"];
        if (!validRoles.includes(role)) {
            throw new apiError(400, "role must be one of admin, project_admin, member");
        }

        const result = await db.query(
            `UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3 RETURNING *`,
            [role, projectId, userId]
        );
        if (result.rowCount === 0) {
            throw new apiError(404, "Member not found in this project");
        }

        const userResult = await db.query("SELECT * FROM users WHERE id = $1", [userId]);
        return apiResponse(
            res,
            200,
            true,
            "Member role updated",
            serializeMember({
                ...result.rows[0],
                username: userResult.rows[0].username,
                email: userResult.rows[0].email,
                full_name: userResult.rows[0].full_name,
                avatar: userResult.rows[0].avatar,
            })
        );
    } catch (error) {
        next(error);
    }
};

// DELETE /projects/:projectId/members/:userId (admin only)
const deletePorjectsMembers = async (req, res, next) => {
    try {
        const { projectId, userId } = req.params;
        const result = await db.query(
            "DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING id",
            [projectId, userId]
        );
        if (result.rowCount === 0) {
            throw new apiError(404, "Member not found in this project");
        }
        return apiResponse(res, 200, true, "Member removed", null);
    } catch (error) {
        next(error);
    }
};

export {
    getProjects,
    createProjects,
    getProjectsWithId,
    updateProjects,
    deleteProjects,
    listPorjectsMembers,
    addPorjectsMembers,
    updatePorjectsMembers,
    deletePorjectsMembers,
};
