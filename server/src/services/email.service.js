// // import transporter from "../config/mail.js";
// import client from "../config/brevo.js";

// const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// // Fire-and-forget: email delivery should never block or fail the HTTP
// // response (register/login/forgot-password all still work if SMTP is
// // slow, unreachable, or misconfigured). We cap the wait with a timeout.

// // transport verify
// // console.log(process.env.SMTP_HOST);
// // console.log(process.env.SMTP_PORT);
// // console.log(process.env.SMTP_USER);

// // transporter.verify((error, success) => {
// //   if (error) {
// //     console.log(error);
// //   } else {
// //     console.log("SMTP Connected");
// //   }
// // });

// // const sendMail = ({ to, subject, html, text }) => {
// //     const send = transporter.sendMail({
// //         from: process.env.SMTP_USER || 'b3f83c001@smtp-brevo.com',
// //         to,
// //         subject,
// //         text,
// //         html,
// //     });

// const sendMail = async ({ email, subject, html, text }) => {
//   return client.transactionalEmails.sendTransacEmail({
//   sender: {
//     name:"Projecto",
//     email:process.env.BREVO_SEND,
//   },
//   to: [
//     {
//       email: email,
//     },
//   ],
//   subject: subject,
//   htmlContent:html,
//   textContent:text,
//   });
// };

//     // const timeout = new Promise((_, reject) =>
//     //     setTimeout(() => reject(new Error("SMTP timeout")), 8000)
//     // );

//     // Promise.race([send, timeout]).catch((error) => {
//     //     console.error("Failed to send email:", error.message);
//     // });

// const sendVerificationEmail = async (email, token) => {
//     const verificationLink = `${FRONTEND_URL}/verify-email/${token}`;
//     await sendMail({
//         email: email,
//         subject: "Verify your Project Camp email",
//         html: `
//             <h2>Email Verification</h2>
//             <p>Click below to verify your email.</p>
//             <a href="${verificationLink}">Verify Email</a>
//         `,
//         text: `Verify your email: ${verificationLink}`,
//     });
// };

// const sendResetVerificationEmail = async (email, token) => {
//     const resetLink = `${FRONTEND_URL}/reset-password/${token}`;
//     await sendMail({
//         email: email,
//         subject: "Reset your Project Camp password",
//         html: `
//             <h2>Password Reset</h2>
//             <p>Click below to reset your password. This link expires in 15 minutes.</p>
//             <a href="${resetLink}">Reset Password</a>
//         `,
//         text: `Reset your password: ${resetLink}`,
//     });
// };


// export { sendVerificationEmail, sendResetVerificationEmail };

import client from "../config/brevo.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const sendMail = async ({ email, subject, html, text }) => {
  try {
    console.log("BREVO_SEND:", process.env.BREVO_SEND);
    console.log("Sending mail to:", email);

    const response = await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: "Projecto",
        email: process.env.BREVO_SEND,
      },
      to: [
        {
          email,
        },
      ],
      subject,
      htmlContent: html,
      textContent: text,
    });

    console.log("Brevo Response:", response);

    return response;
  } catch (error) {
    console.error("Brevo Error:");

    if (error.response) {
      console.error(error.response);
    }

    console.dir(error, { depth: null });

    throw error;
  }
};

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${FRONTEND_URL}/verify-email/${token}`;

  return await sendMail({
    email,
    subject: "Verify your Project Camp email",
    html: `
      <h2>Email Verification</h2>
      <p>Click below to verify your email.</p>
      <a href="${verificationLink}">Verify Email</a>
    `,
    text: `Verify your email: ${verificationLink}`,
  });
};

const sendResetVerificationEmail = async (email, token) => {
  const resetLink = `${FRONTEND_URL}/reset-password/${token}`;

  return await sendMail({
    email,
    subject: "Reset your Project Camp password",
    html: `
      <h2>Password Reset</h2>
      <p>Click below to reset your password. This link expires in 15 minutes.</p>
      <a href="${resetLink}">Reset Password</a>
    `,
    text: `Reset your password: ${resetLink}`,
  });
};

export { sendVerificationEmail, sendResetVerificationEmail };