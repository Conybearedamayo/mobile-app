import nodemailer from 'nodemailer';

export const sendOtpEmail = async (toEmail: string, otpCode: string, alias: string): Promise<boolean> => {
  try {
    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
    const smtpHost = process.env.SMTP_HOST || (smtpUser?.includes('@gmail.com') ? 'smtp.gmail.com' : undefined);
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);

    if (smtpUser && smtpPass) {
      const cleanPass = smtpPass.replace(/\s+/g, '');
      const transporter = nodemailer.createTransport(
        smtpHost === 'smtp.gmail.com'
          ? {
              service: 'gmail',
              auth: {
                user: smtpUser,
                pass: cleanPass,
              },
              tls: {
                rejectUnauthorized: false,
              },
            }
          : {
              host: smtpHost,
              port: smtpPort,
              secure: smtpPort === 465,
              auth: {
                user: smtpUser,
                pass: cleanPass,
              },
              tls: {
                rejectUnauthorized: false,
              },
            }
      );

      const mailOptions = {
        from: `"JUCOCH Wellness" <${smtpUser}>`,
        to: toEmail,
        subject: `[JUCOCH] Your 6-Digit Verification Code: ${otpCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border-radius: 16px; background-color: #F3F8F5; color: #1C1F1D;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="background-color: #2D6A4F; color: #FFF; width: 56px; height: 56px; line-height: 56px; border-radius: 18px; font-size: 28px; font-weight: bold; display: inline-block;">J</div>
              <h2 style="color: #2D6A4F; margin-top: 12px; margin-bottom: 4px;">JUCOCH Wellness</h2>
              <p style="color: #707571; font-size: 14px; margin: 0;">Verification Code</p>
            </div>
            
            <div style="background-color: #FFFFFF; padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: center;">
              <p style="font-size: 15px; color: #333; margin-bottom: 16px;">
                Hello <strong>${alias || 'Valued User'}</strong>,
              </p>
              <p style="font-size: 14px; color: #666; margin-bottom: 24px;">
                Use the following 6-digit verification code to complete your login or registration:
              </p>
              
              <div style="background-color: #E8F5E9; letter-spacing: 8px; color: #2D6A4F; font-size: 32px; font-weight: bold; padding: 16px; border-radius: 12px; display: inline-block; margin-bottom: 20px;">
                ${otpCode}
              </div>

              <p style="font-size: 12px; color: #999; margin-top: 12px;">
                This code will expire in <strong>10 minutes</strong>. If you did not request this code, please ignore this email.
              </p>
            </div>

            <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #909591;">
              JUCOCH - Mindful Wellness & Anonymous Space
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`====================================================`);
      console.log(`📧 OTP Email successfully delivered to: ${toEmail}`);
      console.log(`🔑 Verification Code: ${otpCode}`);
      console.log(`====================================================`);
    } else {
      // Instant console log if SMTP is not yet set in environment
      console.log(`====================================================`);
      console.log(`📧 [SIMULATED OTP] Email requested for: ${toEmail}`);
      console.log(`🔑 Verification Code: ${otpCode}`);
      console.log(`💡 To deliver REAL emails: Add SMTP_USER and SMTP_PASS to Render Environment Variables.`);
      console.log(`====================================================`);
    }

    return true;
  } catch (error: any) {
    console.error('Error sending OTP email via SMTP:', error?.message || error);
    console.log(`====================================================`);
    console.log(`[FALLBACK] Verification Code for ${toEmail}: ${otpCode}`);
    console.log(`====================================================`);
    return true;
  }
};
