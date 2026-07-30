import db from "../config/db.js";
import apiError from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

const serializeNote = (row) => ({
    _id: row.id,
    id: row.id,
    project: row.project_id,
    title: row.title,
    content: row.content,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

// GET /notes/:projectId
const listNotes = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const result = await db.query(
            "SELECT * FROM notes WHERE project_id = $1 ORDER BY created_at DESC",
            [projectId]
        );
        return apiResponse(res, 200, true, "Notes fetched", result.rows.map(serializeNote));
    } catch (error) {
        next(error);
    }
};

// POST /notes/:projectId
const createNotes = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { title, content } = req.body;
        if (!content || !content.trim()) {
            throw new apiError(400, "Note content is required");
        }

        const result = await db.query(
            `INSERT INTO notes (project_id, title, content, created_by) VALUES ($1, $2, $3, $4) RETURNING *`,
            [projectId, title || null, content.trim(), req.user.id]
        );
        return apiResponse(res, 201, true, "Note created", serializeNote(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// GET /notes/:projectId/n/:noteId
const getNotes = async (req, res, next) => {
    try {
        const { projectId, noteId } = req.params;
        const result = await db.query(
            "SELECT * FROM notes WHERE id = $1 AND project_id = $2",
            [noteId, projectId]
        );
        if (result.rowCount === 0) {
            throw new apiError(404, "Note not found");
        }
        return apiResponse(res, 200, true, "Note fetched", serializeNote(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// PUT /notes/:projectId/n/:noteId
const UpdateNotes = async (req, res, next) => {
    try {
        const { projectId, noteId } = req.params;
        const { title, content } = req.body;

        const result = await db.query(
            `UPDATE notes SET
                title = COALESCE($1, title),
                content = COALESCE($2, content),
                updated_at = now()
             WHERE id = $3 AND project_id = $4
             RETURNING *`,
            [title, content, noteId, projectId]
        );
        if (result.rowCount === 0) {
            throw new apiError(404, "Note not found");
        }
        return apiResponse(res, 200, true, "Note updated", serializeNote(result.rows[0]));
    } catch (error) {
        next(error);
    }
};

// DELETE /notes/:projectId/n/:noteId
const deleteNotes = async (req, res, next) => {
    try {
        const { projectId, noteId } = req.params;
        const result = await db.query(
            "DELETE FROM notes WHERE id = $1 AND project_id = $2 RETURNING id",
            [noteId, projectId]
        );
        if (result.rowCount === 0) {
            throw new apiError(404, "Note not found");
        }
        return apiResponse(res, 200, true, "Note deleted", null);
    } catch (error) {
        next(error);
    }
};

export { listNotes, createNotes, getNotes, UpdateNotes, deleteNotes };
