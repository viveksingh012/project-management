import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import healthCheck from "./routes/healthCheck.routes.js";
import userSignupRoutes from "./routes/userSignupRoutes.js";
import projectsRoutes from "./routes/projectsRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/auth", userSignupRoutes);
app.use("/api/v1/projects", projectsRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/notes", notesRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/healthcheck", healthCheck);

// Centralized error handler - must be registered last.
app.use(errorHandler);

export default app;
