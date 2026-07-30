import db from "../config/db.js";
import apiError from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

const serializeAssignee = (id, username, email, fullName, avatar) => {
    if (!id) return null;
    return { _id: id, id, username, email, fullName, avatar };
};

const serializeTask = (row) => ({
    _id: row.id,
    id: row.id,
    project: row.project_id,
    title: row.title,
    description: row.description,
    status: row.status,
    attachments: row.attachments || [],
    assignedTo: serializeAssignee(
        row.assigned_to,
        row.assignee_username,
        row.assignee_email,
        row.assignee_full_name,
        row.assignee_avatar
    ),
    createdBy: row.created_by,
    subtaskCount: row.subtask_count !== undefined ? Number(row.subtask_count) : undefined,
    subtasks: row.subtasks || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

const serializeSubtask = (row) => ({
    _id: row.id,
    id: row.id,
    task: row.task_id,
    project: row.project_id,
    title: row.title,
    isCompleted: row.is_completed,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

const TASK_SELECT = `
    SELECT t.*,
           u.username AS assignee_username,
           u.email AS assignee_email,
           u.full_name AS assignee_full_name,
           u.avatar AS assignee_avatar,
           COUNT(st.id) AS subtask_count
    FROM tasks t
    LEFT JOIN users u ON u.id = t.assigned_to
    LEFT JOIN subtasks st ON st.task_id = t.id
`;

// GET /tasks/:projectId
const listProjectTask = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const result = await db.query(
            `${TASK_SELECT} WHERE t.project_id = $1 GROUP BY t.id, u.username, u.email, u.full_name, u.avatar ORDER BY t.created_at DESC`,
            [projectId]
        );
        return apiResponse(res, 200, true, "Tasks fetched", result.rows.map(serializeTask));
    } catch (error) {
        next(error);
    }
};

// POST /tasks/:projectId  (multipart/form-data: title, description, assignedTo, attachments[])
const createProjectTask = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { title, description, assignedTo } = req.body;
        if (!title || !title.trim()) {
            throw new apiError(400, "Task title is required");
        }

        const attachments = (req.files || []).map((f) => ({
            url: `/uploads/${f.filename}`,
            originalName: f.originalname,
            mimeType: f.mimetype,
            size: f.size,
        }));

        const result = await db.query(
            `INSERT INTO tasks (project_id, title, description, assigned_to, created_by, attachments)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                projectId,
                title.trim(),
                description || null,
                assignedTo || null,
                req.user.id,
                JSON.stringify(attachments),
            ]
        );

        return apiResponse(res, 201, true, "Task created", serializeTask({ ...result.rows[0], subtask_count: 0 }));
    } catch (error) {
        next(error);
    }
};

// GET /tasks/:projectId/t/:taskId
const getTaskDetails = async (req, res, next) => {
    try {
        const { projectId, taskId } = req.params;
        const result = await db.query(
            `${TASK_SELECT} WHERE t.id = $1 AND t.project_id = $2 GROUP BY t.id, u.username, u.email, u.full_name, u.avatar`,
            [taskId, projectId]
        );
        if (result.rowCount === 0) {
            throw new apiError(404, "Task not found");
        }

        const subtasksResult = await db.query(
            "SELECT * FROM subtasks WHERE task_id = $1 ORDER BY created_at ASC",
            [taskId]
        );

        const task = serializeTask({
            ...result.rows[0],
            subtasks: subtasksResult.rows.map(serializeSubtask),
        });

        return apiResponse(res, 200, true, "Task fetched", task);
    } catch (error) {
        next(error);
    }
};

// PUT /tasks/:projectId/t/:taskId
const UpdateTask = async (req, res, next) => {
    try {
        const { projectId, taskId } = req.params;
        const { title, description, status, assignedTo } = req.body;

        if (status && !["todo", "in_progress", "done"].includes(status)) {
            throw new apiError(400, "status must be one of todo, in_progress, done");
        }

        // assignedTo has three possible states: not sent (leave unchanged),
        // sent as "" (unassign), or sent with a user id (reassign).
        const hasAssignedTo = Object.prototype.hasOwnProperty.call(req.body, "assignedTo");
        const assignedToValue = hasAssignedTo
            ? (assignedTo === "" || assignedTo === null ? null : Number(assignedTo))
            : null;

        const result = await db.query(
            `UPDATE tasks SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                status = COALESCE($3, status),
                assigned_to = CASE WHEN $4 THEN $5 ELSE assigned_to END,
                updated_at = now()
             WHERE id = $6 AND project_id = $7
             RETURNING *`,
            [title, description, status, hasAssignedTo, assignedToValue, taskId, projectId]
        );
        if (result.rowCount === 0) {
            throw new apiError(404, "Task not found");
        }
        return apiResponse(res, 200, true, "Task updated", serializeTask(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// DELETE /tasks/:projectId/t/:taskId
const deleteTask = async (req, res, next) => {
    try {
        const { projectId, taskId } = req.params;
        const result = await db.query(
            "DELETE FROM tasks WHERE id = $1 AND project_id = $2 RETURNING id",
            [taskId, projectId]
        );
        if (result.rowCount === 0) {
            throw new apiError(404, "Task not found");
        }
        return apiResponse(res, 200, true, "Task deleted", null);
    } catch (error) {
        next(error);
    }
};

// POST /tasks/:projectId/t/:taskId/subtasks
const createSubTask = async (req, res, next) => {
    try {
        const { projectId, taskId } = req.params;
        const { title } = req.body;
        if (!title || !title.trim()) {
            throw new apiError(400, "Subtask title is required");
        }

        const taskCheck = await db.query("SELECT id FROM tasks WHERE id = $1 AND project_id = $2", [taskId, projectId]);
        if (taskCheck.rowCount === 0) {
            throw new apiError(404, "Task not found");
        }

        const result = await db.query(
            `INSERT INTO subtasks (task_id, project_id, title, created_by) VALUES ($1, $2, $3, $4) RETURNING *`,
            [taskId, projectId, title.trim(), req.user.id]
        );
        return apiResponse(res, 201, true, "Subtask created", serializeSubtask(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// PUT /tasks/:projectId/st/:subTaskId
const updateSubTask = async (req, res, next) => {
    try {
        const { projectId, subTaskId } = req.params;
        const { title, isCompleted } = req.body;

        const result = await db.query(
            `UPDATE subtasks SET
                title = COALESCE($1, title),
                is_completed = COALESCE($2, is_completed),
                updated_at = now()
             WHERE id = $3 AND project_id = $4
             RETURNING *`,
            [title, typeof isCompleted === "boolean" ? isCompleted : null, subTaskId, projectId]
        );
        if (result.rowCount === 0) {
            throw new apiError(404, "Subtask not found");
        }
        return apiResponse(res, 200, true, "Subtask updated", serializeSubtask(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// DELETE /tasks/:projectId/st/:subTaskId
const deleteSubTask = async (req, res, next) => {
    try {
        const { projectId, subTaskId } = req.params;
        const result = await db.query(
            "DELETE FROM subtasks WHERE id = $1 AND project_id = $2 RETURNING id",
            [subTaskId, projectId]
        );
        if (result.rowCount === 0) {
            throw new apiError(404, "Subtask not found");
        }
        return apiResponse(res, 200, true, "Subtask deleted", null);
    } catch (error) {
        next(error);
    }
};

export {
    listProjectTask,
    createProjectTask,
    getTaskDetails,
    UpdateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask,
};
