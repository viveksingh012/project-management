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
// const transporter = nodemailer.createTransport({
//     service:"gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   connectionTimeout: 10000,
//   greetingTimeout: 10000,
// });
console.log(process.env.SMTP_HOST);
console.log(process.env.SMTP_PORT);
console.log(process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});


export default transporter;
