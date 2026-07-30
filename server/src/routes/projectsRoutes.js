import express from "express";
import {
    getProjects,
    createProjects,
    getProjectsWithId,
    updateProjects,
    deleteProjects,
    listPorjectsMembers,
    addPorjectsMembers,
    updatePorjectsMembers,
    deletePorjectsMembers,
} from "../controller/projectsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { verifyProjectMembership, requireRole } from "../middleware/projectAccessMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getProjects);
router.post("/", createProjects);

router.get("/:projectId", verifyProjectMembership, getProjectsWithId);
router.put("/:projectId", verifyProjectMembership, requireRole("admin"), updateProjects);
router.delete("/:projectId", verifyProjectMembership, requireRole("admin"), deleteProjects);

router.get("/:projectId/members", verifyProjectMembership, listPorjectsMembers);
router.post("/:projectId/members", verifyProjectMembership, requireRole("admin"), addPorjectsMembers);
router.put("/:projectId/members/:userId", verifyProjectMembership, requireRole("admin"), updatePorjectsMembers);
router.delete("/:projectId/members/:userId", verifyProjectMembership, requireRole("admin"), deletePorjectsMembers);

export default router;
