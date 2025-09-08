export const verificationTemplate = (otp: string) => `
  <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <h2 style="color: #333333; text-align: center;">Verify Your Email</h2>
      <p style="color: #555555; font-size: 16px; text-align: center;">
        Use the OTP below to verify your email address. This OTP is valid for <strong>10 minutes</strong>.
      </p>

      <div style="margin: 30px 0; text-align: center;">
        <span style="
          display: inline-block;
          padding: 15px 25px;
          font-size: 24px;
          letter-spacing: 5px;
          color: #ffffff;
          background-color: #ff4d4d;
          border-radius: 8px;
          font-weight: bold;
        ">
          ${otp}
        </span>
      </div>

      <p style="color: #777777; font-size: 14px; text-align: center;">
        If you did not request this verification, please ignore this email.
      </p>

      <p style="text-align: center; color: #aaa; font-size: 12px; margin-top: 40px;">
        &copy; ${new Date().getFullYear()} YourCompany. All rights reserved.
      </p>
    </div>
  </div>
`;


export const resetPasswordTemplate = (url: string) => `
  <h1>Reset Your Password</h1>
  <p>Click the link below to reset your password:</p>
  <a href="${url}">${url}</a>
`;
