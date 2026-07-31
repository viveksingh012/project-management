import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle Postgres client", err);
});


// Thin wrapper so the rest of the app can keep calling db.query(...)
const db = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
    pool,
};

export default db;
