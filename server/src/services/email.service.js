import transporter from "../config/mail.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Fire-and-forget: email delivery should never block or fail the HTTP
// response (register/login/forgot-password all still work if SMTP is
// slow, unreachable, or misconfigured). We cap the wait with a timeout.

// transport verify

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("SMTP Connected");
  }
});

const sendMail = ({ to, subject, html, text }) => {
    const send = transporter.sendMail({
        from: process.env.EMAIL_USER || 'noreply.projecto@gmail.com',
        to,
        subject,
        text,
        html,
    });

    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("SMTP timeout")), 8000)
    );

    Promise.race([send, timeout]).catch((error) => {
        console.error("Failed to send email:", error.message);
    });
};

const sendVerificationEmail = async (email, token) => {
    const verificationLink = `${FRONTEND_URL}/verify-email/${token}`;
    await sendMail({
        to: email,
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
    await sendMail({
        to: email,
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
