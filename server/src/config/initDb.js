import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const initDb = async () => {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");
    await db.query(schema);
    console.log("Postgres schema ready (tables created if they did not exist).");
};

// Allow running directly: `npm run db:init`
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    initDb()
        .then(() => process.exit(0))
        .catch((err) => {
            console.error("Failed to initialize database:", err);
            process.exit(1);
        });
}
