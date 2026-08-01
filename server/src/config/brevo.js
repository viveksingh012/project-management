import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

export const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export default client;