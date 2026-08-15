import { Resend } from "resend";

export const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

export const sendVerificationEmail = async (toEmail, otp) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
        from: "StudySphere <otp@priyanshudahiya.online>",
        to: toEmail,
        subject: "Verify Your Email - OTP",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto;">
        <h2>Email Verification</h2>
        <p>Use the 4-digit OTP below to verify your email. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px;
                    padding: 16px; background: #f0f0f0; text-align: center;
                    border-radius: 8px;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 16px;">
          If you didn't request this, ignore this email.
        </p>
      </div>
    `,
    });
};
