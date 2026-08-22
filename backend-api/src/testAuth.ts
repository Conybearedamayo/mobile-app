import dotenv from 'dotenv';
dotenv.config();
import { prisma } from './prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';

async function verifyAll() {
  console.log('==============================================');
  console.log('🔍 FULL SYSTEM & ENVIRONMENT AUDIT');
  console.log('==============================================');

  // 1. Database
  try {
    const userCount = await prisma.user.count();
    console.log(`✅ [1/3] Neon PostgreSQL Database: CONNECTED (Total Users: ${userCount})`);
  } catch (e: any) {
    console.error(`❌ [1/3] Database Error:`, e?.message || e);
  }

  // 2. SMTP
  try {
    const user = process.env.SMTP_USER;
    const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    await transporter.verify();
    console.log(`✅ [2/3] Gmail SMTP (${user}): CONNECTED & AUTHENTICATED`);
  } catch (e: any) {
    console.error(`❌ [2/3] SMTP Error:`, e?.message || e);
  }

  // 3. Gemini AI
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    const genAI = new GoogleGenerativeAI(apiKey);
    const list = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash-exp'];
    for (const m of list) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent('Hello');
        console.log(`✅ [3/3] Google Gemini AI (${m}): CONNECTED (Response: "${result.response.text().trim()}")`);
        break;
      } catch (e: any) {
        console.log(`Model ${m} error:`, e.message);
      }
    }
  } catch (e: any) {
    console.warn(`⚠️ [3/3] Gemini API Note:`, e?.message || e);
  }

  console.log('==============================================');
  process.exit(0);
}

verifyAll();
