import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

async function testGmail() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  console.log('Testing SMTP with User:', user);
  console.log('Password length:', pass ? pass.length : 0);

  if (!user || !pass) {
    console.error('❌ Missing user or pass in .env');
    return;
  }

  const cleanPass = pass.replace(/\s+/g, '');
  console.log('Cleaned pass length:', cleanPass.length);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: cleanPass,
    },
  });

  try {
    console.log('Verifying transporter connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection verified successfully!');

    console.log('Sending test email to:', user);
    const info = await transporter.sendMail({
      from: `"JUCOCH Wellness" <${user}>`,
      to: user,
      subject: '[JUCOCH] Test Verification Code: 888999',
      text: 'Your 6-digit verification code is: 888999',
      html: '<h2>JUCOCH Wellness</h2><p>Your 6-digit verification code is: <b>888999</b></p>',
    });

    console.log('✅ Test email sent! MessageId:', info.messageId);
    console.log('Response:', info.response);
  } catch (err: any) {
    console.error('❌ SMTP Error encountered:', err);
  }
}

testGmail();
