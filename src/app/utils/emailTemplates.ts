export const resetPasswordTemplate = (name: string, resetLink: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; color: #1f2937;">
    <h2 style="color: #02b290;">Reset your password</h2>
    <p>Hi ${name},</p>
    <p>We got a request to reset your password. Click the button below to choose a new one.</p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="${resetLink}"
         style="background: #02b290; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
        Reset Password
      </a>
    </p>
    <p>This link works once and expires in 10 minutes.</p>
    <p>If you did not ask for this, you can ignore this email. Your password will stay the same.</p>
  </div>
`;
