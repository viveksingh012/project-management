import express from "express";
import { listNotes, createNotes, getNotes, UpdateNotes, deleteNotes } from "../controller/notesController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { verifyProjectMembership, requireRole } from "../middleware/projectAccessMiddleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use("/:projectId", verifyProjectMembership);

router.get("/:projectId", listNotes);
router.post("/:projectId", requireRole("admin"), createNotes);
router.get("/:projectId/n/:noteId", getNotes);
router.put("/:projectId/n/:noteId", requireRole("admin"), UpdateNotes);
router.delete("/:projectId/n/:noteId", requireRole("admin"), deleteNotes);

export default router;
