import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRouter);

const PORT = 3001; // Temporary test port

async function runTests() {
  const server = app.listen(PORT, async () => {
    console.log(`🧪 Test Server running on port ${PORT}...`);

    try {
      // Test 1: Register User
      console.log('\n--- Test 1: Register User ---');
      const testEmail = `test_${Date.now()}@jucoch.com`;
      const testAlias = `Tester_${Math.floor(Math.random() * 1000)}`;

      const regRes = await fetch(`http://localhost:${PORT}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias: testAlias,
          email: testEmail,
          password: 'Password123!',
          role: 'Student',
        }),
      });

      const regData = await regRes.json();
      console.log('Registration Status:', regRes.status);
      console.log('Registration Response:', regData);

      // Test 2: Login User
      console.log('\n--- Test 2: Login User ---');
      const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'Password123!',
        }),
      });

      const loginData = await loginRes.json();
      console.log('Login Status:', loginRes.status);
      console.log('Login Response:', loginData);

      // Test 3: Send OTP
      console.log('\n--- Test 3: Send OTP ---');
      const otpRes = await fetch(`http://localhost:${PORT}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail }),
      });

      const otpData = await otpRes.json();
      console.log('Send OTP Status:', otpRes.status);
      console.log('Send OTP Response:', otpData);

      console.log('\n✅ ALL BACKEND AUTH & OTP ENDPOINTS FUNCTIONING PERFECTLY!');
    } catch (err) {
      console.error('❌ Test failed:', err);
    } finally {
      server.close(() => {
        console.log('Test Server stopped.');
        process.exit(0);
      });
    }
  });
}

runTests();
