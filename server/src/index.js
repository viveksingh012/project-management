import dotenv from "dotenv";
import app from "./app.js";
import { initDb } from "./config/initDb.js";

dotenv.config();

const port = process.env.PORT || 8000;

const start = async () => {
    try {
        await initDb();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

start();
