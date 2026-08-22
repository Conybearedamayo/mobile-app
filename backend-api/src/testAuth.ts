import dotenv from 'dotenv';
dotenv.config();

async function testResend() {
  const apiKey = process.env.RESEND_API_KEY;
  console.log('Sending live email via Resend API...');
  
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'JUCOCH Wellness <onboarding@resend.dev>',
        to: ['conybeared69@gmail.com'],
        subject: '[JUCOCH] Real Verification Code: 654321',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; background-color: #F3F8F5; border-radius: 16px;">
            <h2 style="color: #2D6A4F;">JUCOCH Wellness</h2>
            <p>Your 6-digit verification code is:</p>
            <div style="background-color: #E8F5E9; letter-spacing: 8px; color: #2D6A4F; font-size: 32px; font-weight: bold; padding: 16px; border-radius: 12px; display: inline-block;">
              654321
            </div>
          </div>
        `,
      }),
    });

    const data = await res.json();
    console.log('RESEND STATUS:', res.status);
    console.log('RESEND RESPONSE:', JSON.stringify(data));
  } catch (err: any) {
    console.error('RESEND ERROR:', err);
  }
}

testResend();
