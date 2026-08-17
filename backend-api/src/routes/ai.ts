import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize Google Generative AI with the API Key
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// STRICT MENTAL HEALTH ONLY SYSTEM INSTRUCTION
const STRICT_MENTAL_HEALTH_INSTRUCTION = `You are Jucoch AI, an exclusive, specialized Mental Health and Emotional Wellness Companion for the Jucoch Capstone Application.

STRICT SCOPE & SAFETY BOUNDARIES (CRITICAL MANDATORY RULES):
1. YOU ARE STRICTLY RESTRICTED TO MENTAL HEALTH, EMOTIONAL WELLBEING, STRESS MANAGEMENT, ANXIETY, SLEEP, MOODS, MINDFULNESS, SELF-CARE, AND RELAXATION TOPICS ONLY.
2. IF A USER ASKS ANYTHING UNRELATED TO MENTAL HEALTH (for example: coding, programming, math, history, trivia, science, geography, sports, pop culture, news, gaming, business, general advice, or random tasks), YOU MUST STICK TO YOUR DOMAIN AND REFUSE POLITELY WITH THIS EXACT TYPE OF RESPONSE:
   "I am Jucoch AI, a specialized Mental Health and Emotional Wellness Companion. I can only answer questions related to mental health, emotional wellbeing, stress management, sleep, and self-care. Please feel free to share how you are feeling today!"
3. IF A USER ASKS INAPPROPRIATE, VULGAR, OFFENSIVE, OR BATI/BAD QUESTIONS, POLITELY REFUSE AND RE-DIRECT THEM BACK TO MENTAL HEALTH & WELLBEING.
4. Maintain a warm, gentle, empathetic, respectful, and non-judgmental tone.
5. Keep responses concise, supportive, and under 120 words.
6. If a user expresses self-harm or severe emotional crisis, provide immediate comforting words and gently advise seeking professional emergency or hotline assistance.`;

const RESPONSES_BY_KEYWORD: Record<string, string> = {
  sad: "I'm sorry to hear that you're feeling down. Remember that it's completely okay to feel this way. Would you like to try a 2-minute guided breathing exercise or write down what's on your mind?",
  anxious: "Anxiety can feel overwhelming, but you're safe here. Try taking slow, deep breaths: inhale for 4 seconds, hold for 4, and exhale for 4. I'm right here with you.",
  stressed: "Take a deep breath. You are doing the best you can. Consider stepping away for 5 minutes, drinking a glass of water, or logging a short journal entry.",
  sleep: "Getting quality rest is crucial for your emotional well-being. Try putting away electronic screens 30 minutes before bed and practicing dark-room relaxation.",
  happy: "I love hearing that! 🎉 Celebrating good moments builds resilience. What made your day so special?",
  tired: "Rest is not a reward; it's a necessity. Listen to your body and give yourself permission to recharge today.",
};

const OUT_OF_SCOPE_KEYWORDS = [
  'code', 'coding', 'javascript', 'python', 'java', 'html', 'css', 'math', 'calculator',
  'history', 'who is', 'what is the capital', 'recipe', 'game', 'football', 'basketball',
  'movie', 'song', 'politics', 'president', 'weather forecast', 'stock market'
];

// POST /api/ai/chat
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    const trimmedMsg = message.trim();
    const lower = trimmedMsg.toLowerCase();

    // Quick client-side out-of-scope check for common off-topic queries
    const isExplicitOffTopic = OUT_OF_SCOPE_KEYWORDS.some(kw => lower.includes(kw));
    if (isExplicitOffTopic) {
      res.json({
        reply: "I am Jucoch AI, a specialized Mental Health and Emotional Wellness Companion. I can only assist with topics related to mental health, emotional wellbeing, stress management, sleep, and self-care. Please feel free to share how you are feeling today!",
        timestamp: new Date().toISOString(),
        source: 'guardrail-shield',
      });
      return;
    }

    // Call Google Gemini AI with Strict Mental Health System Instructions
    if (genAI) {
      const candidateModels = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-1.5-flash'];
      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: STRICT_MENTAL_HEALTH_INSTRUCTION,
          });

          const result = await model.generateContent(trimmedMsg);
          const responseText = result.response.text();

          if (responseText && responseText.trim()) {
            res.json({
              reply: responseText.trim(),
              timestamp: new Date().toISOString(),
              source: 'gemini-ai',
            });
            return;
          }
        } catch (geminiErr: any) {
          // Log quiet info for model trial and attempt next model in list
          console.warn(`Gemini API Warning (${modelName} failed, trying fallback):`, geminiErr?.message || geminiErr);
        }
      }
    }

    // Fallback response generator if Gemini call is offline or pending
    let reply = "Thank you for sharing that with me. I'm Jucoch AI, your specialized 24/7 mental health companion. How has your mood or sleep been over the past few days?";

    for (const [keyword, cannedReply] of Object.entries(RESPONSES_BY_KEYWORD)) {
      if (lower.includes(keyword)) {
        reply = cannedReply;
        break;
      }
    }

    res.json({
      reply,
      timestamp: new Date().toISOString(),
      source: 'jucoch-engine',
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process AI chat response.' });
  }
});

export default router;
