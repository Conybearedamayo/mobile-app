import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import wellnessRouter from './routes/wellness';
import adminRouter from './routes/admin';
import aiRouter from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/wellness', wellnessRouter);
app.use('/api/admin', adminRouter);
app.use('/api/ai', aiRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('JUCOCH API is running! 🚀 Connected to Neon PostgreSQL Database.');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
