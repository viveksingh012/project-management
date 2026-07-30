import express from "express";
import {
    listProjectTask,
    createProjectTask,
    getTaskDetails,
    UpdateTask,
    deleteTask,
    createSubTask,
    updateSubTask,
    deleteSubTask,
} from "../controller/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { verifyProjectMembership, requireRole } from "../middleware/projectAccessMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.use(authMiddleware);
router.use("/:projectId", verifyProjectMembership);

router.get("/:projectId", listProjectTask);
router.post(
    "/:projectId",
    requireRole("admin", "project_admin"),
    upload.array("attachments", 10),
    createProjectTask
);

router.get("/:projectId/t/:taskId", getTaskDetails);
router.put("/:projectId/t/:taskId", requireRole("admin", "project_admin"), UpdateTask);
router.delete("/:projectId/t/:taskId", requireRole("admin", "project_admin"), deleteTask);

router.post("/:projectId/t/:taskId/subtasks", requireRole("admin", "project_admin"), createSubTask);
router.put("/:projectId/st/:subTaskId", requireRole("admin", "project_admin"), updateSubTask);
router.delete("/:projectId/st/:subTaskId", requireRole("admin", "project_admin"), deleteSubTask);

export default router;
