import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// const transporter = nodemailer.createTransport({
//     host: process.env.MAIL_HOST || "sandbox.smtp.mailtrap.io",
//     port: Number(process.env.MAIL_PORT) || 2525,
//     auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS,
//     },
// });
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export default transporter;
