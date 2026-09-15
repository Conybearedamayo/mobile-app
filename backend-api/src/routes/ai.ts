import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();

// Initialize Google Generative AI with the API Key
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// STRICT MENTAL HEALTH ONLY SYSTEM INSTRUCTION WITH UNIVERSAL MULTILINGUAL SUPPORT
const STRICT_MENTAL_HEALTH_INSTRUCTION = `You are Jucoch AI, an exclusive, specialized Mental Health and Emotional Wellness Companion for the Jucoch Capstone Application.

🌐 UNIVERSAL MULTILINGUAL CAPABILITIES & STRICT LANGUAGE MIRRORING (CRITICAL):
1. UNIVERSAL LANGUAGE UNDERSTANDING: You natively and fluently understand ANY language, dialect, or colloquial vernacular worldwide (most especially Cebuano/Bisaya, Tagalog/Filipino, Taglish, Bislish, English, Hiligaynon/Ilonggo, Ilocano, Waray, Bicolano, Spanish, etc.).
2. STRICT LANGUAGE MIRRORING: Always respond in the EXACT SAME language, dialect, and conversational tone that the user uses:
   - If the user chats in Bisaya / Cebuano (e.g., "gikapoy nako sa skwela", "guol kaayo ko", "unsaon pag-relax?", "dili ko katulog", "lisod akong kinabuhi"):
     -> YOU MUST RESPOND IN NATURAL, WARM, FLUENT BISAYA / CEBUANO (e.g., "Nakasabot ko sa imong gibati...", "Ayaw kabalaka, ania ko para maminaw nimo...").
   - If the user chats in Tagalog / Filipino (e.g., "sobrang lungkot ko ngayon", "ang bigat ng pakiramdam ko", "pagod na ako"):
     -> YOU MUST RESPOND IN NATURAL, EMPATHETIC TAGALOG / FILIPINO.
   - If the user chats in Bislish or Taglish (code-switching between English and local language):
     -> Respond naturally in the same conversational blend.
   - If the user chats in English:
     -> Respond in fluent, empathetic English.
   - If the user chats in any other language:
     -> Respond in that exact language.

🛡️ STRICT SCOPE & DOMAIN RESTRICTIONS (MENTAL HEALTH ONLY):
3. YOU ARE STRICTLY RESTRICTED TO MENTAL HEALTH, EMOTIONAL WELLBEING, STRESS MANAGEMENT, ANXIETY, SLEEP, MOODS, MINDFULNESS, SELF-CARE, AND RELAXATION TOPICS ONLY.
4. IF A USER ASKS ANYTHING UNRELATED TO MENTAL HEALTH (for example: coding, programming, math, history, trivia, science, geography, sports, pop culture, news, gaming, business, general advice, or random tasks):
   -> Politely refuse and re-direct them back to mental wellness IN THE USER'S OWN LANGUAGE:
   - Bisaya refusal: "Ako si Jucoch AI, ang imong kauban alang sa mental health ug emotional wellness. Makatabang lamang ako sa mga topiko bahin sa emosyonal nga kahimsog, stress, kabalaka, pagkatulog, ug self-care. Palihug ipaambit kanako kung unsa ang imong gibati karon!"
   - Tagalog refusal: "Ako si Jucoch AI, ang iyong kasama para sa mental health at emotional wellness. Maaari lamang akong tumugon sa mga paksang may kinalaman sa emosyonal na kalusugan, stress, pagtulog, at self-care. Huwag mag-atubiling ibahagi kung ano ang iyong nararamdaman ngayon!"
   - English refusal: "I am Jucoch AI, a specialized Mental Health and Emotional Wellness Companion. I can only assist with topics related to mental health, emotional wellbeing, stress management, sleep, and self-care. Please feel free to share how you are feeling today!"
5. IF A USER ASKS INAPPROPRIATE, VULGAR, OFFENSIVE, OR BATI/BAD QUESTIONS:
   -> Politely refuse and re-direct them back to mental health & wellbeing in their language.
6. TONE & BREVITY: Maintain a warm, gentle, empathetic, respectful, and non-judgmental tone. Keep responses concise, supportive, and under 120 words.
7. CRISIS SAFETY: If a user expresses self-harm or severe emotional crisis, provide immediate comforting words in their language and gently advise seeking professional emergency assistance or a trusted counselor.`;

// Language detector helper for fallback responses
const detectLanguage = (text: string): 'ceb' | 'tl' | 'en' => {
  const lower = text.toLowerCase();
  const cebWords = [
    'unsa', 'ngano', 'nganong', 'kaayo', 'kayo', 'nako', 'ko', 'nimo', 'akong', 
    'karon', 'gani', 'diay', 'gyud', 'jud', 'bai', 'bay', 'kapoy', 'gikapoy', 
    'guol', 'subo', 'kaguol', 'kasubo', 'hilak', 'hadlok', 'katulog', 'lipay', 'ginhawa'
  ];
  const tlWords = [
    'ano', 'bakit', 'sobra', 'sobrang', 'ako', 'mo', 'aking', 'ngayon', 'pala', 
    'naman', 'talaga', 'tol', 'pre', 'pagod', 'napagod', 'lungkot', 'nalulungkot', 
    'iyak', 'takot', 'tulog', 'antok', 'saya', 'masaya', 'hinga'
  ];

  if (cebWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower))) return 'ceb';
  if (tlWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower))) return 'tl';
  return 'en';
};

interface KeywordCategory {
  keywords: string[];
  replies: {
    ceb: string;
    tl: string;
    en: string;
  };
}

const MULTILINGUAL_FALLBACK_CATEGORIES: KeywordCategory[] = [
  {
    keywords: ['sad', 'down', 'depressed', 'subo', 'guol', 'kaguol', 'kasubo', 'hilak', 'lungkot', 'nalulungkot', 'iyak'],
    replies: {
      ceb: "Naguol ko nga nakadungog ana. Hinumdomi nga normal ra gyud nga mobati og kaguol usahay. Gusto ba nimo mosulay og guided breathing exercise o isulat ang imong gibati sa journal?",
      tl: "Nalulungkot akong marinig iyan. Tandaan mong normal lang maramdaman iyan paminsan-minsan. Nais mo bang subukan ang isang guided breathing exercise o isulat ang iyong nararamdaman sa journal?",
      en: "I'm sorry to hear that you're feeling down. Remember that it's completely okay to feel this way. Would you like to try a 2-minute guided breathing exercise or write down what's on your mind?",
    },
  },
  {
    keywords: ['tired', 'exhausted', 'kapoy', 'gikapoy', 'kakapoy', 'pagod', 'napagod', 'hapo'],
    replies: {
      ceb: "Ang pagpahulay dili usa ka ganti; usa kini ka panginahanglan. Paminawa ang imong lawas ug hatagi ang imong kaugalingon og higayon nga makapahulay karon.",
      tl: "Ang pahinga ay hindi gantimpala; ito ay pangangailangan. Pakinggan ang iyong katawan at bigyan ang iyong sarili ng pahintulot na magpahinga ngayong araw.",
      en: "Rest is not a reward; it's a necessity. Listen to your body and give yourself permission to recharge today.",
    },
  },
  {
    keywords: ['anxious', 'anxiety', 'panic', 'kabalaka', 'hadlok', 'kulba', 'nerbyos', 'kaba', 'takot', 'nag-aalala'],
    replies: {
      ceb: "Maka-overwhelm gyud ang kabalaka, apan luwas ka dinhi. Sulayi ang hinay nga pagginhawa: pasudla ang hangin sulod sa 4 ka segundo, pugngi og 4, ug ipagawas og 4. Ania ra ko uban nimo.",
      tl: "Maaaring maging mabigat ang labis na kaba, ngunit ligtas ka rito. Subukan ang mabagal na paghinga: lumanghap ng 4 segundo, pigilin ng 4, at ibuga ng 4. Nandito lang ako kasama mo.",
      en: "Anxiety can feel overwhelming, but you're safe here. Try taking slow, deep breaths: inhale for 4 seconds, hold for 4, and exhale for 4. I'm right here with you.",
    },
  },
  {
    keywords: ['stressed', 'stress', 'pressure', 'overwhelmed', 'labad', 'libog', 'hirap', 'bigat'],
    replies: {
      ceb: "Pahuwaya kadiyot ang imong hunahuna ug ginhawa og lawom. Gibuhat na nimo ang imong pinakamaayo. Pwede kang moinom og basong tubig o magpahulay og 5 minutos.",
      tl: "Huminga nang malalim. Ginagawa mo ang iyong makakaya. Subukang uminom ng isang basong tubig o magpahinga muna nang limang minuto.",
      en: "Take a deep breath. You are doing the best you can. Consider stepping away for 5 minutes, drinking a glass of water, or logging a short journal entry.",
    },
  },
  {
    keywords: ['sleep', 'insomnia', 'puyat', 'katulog', 'di katulog', 'tulog', 'antok', 'matulog'],
    replies: {
      ceb: "Importante kaayo ang igong pagkatulog para sa imong emosyonal nga kahimsog. Sulayi nga ipalayo ang cellphone o screens 30 minutos sa dili pa matulog aron makapahulay ang mata ug utok.",
      tl: "Napakalaki ng epekto ng maayos na tulog sa ating kalusugang pangkaisipan. Subukang ilayo ang screens 30 minuto bago matulog upang mapahinga ang isip.",
      en: "Getting quality rest is crucial for your emotional well-being. Try putting away electronic screens 30 minutes before bed and practicing dark-room relaxation.",
    },
  },
  {
    keywords: ['happy', 'excited', 'good', 'lipay', 'nalipay', 'nindot', 'saya', 'masaya', 'tuwa'],
    replies: {
      ceb: "Nalipay ko nga nakadungog ana! 🎉 Ang pagsaulog sa mga nindot nga higayon makatabang sa pagpalig-on sa atong resilience. Unsay nakapanindot sa imong adlaw karon?",
      tl: "Natutuwa akong marinig iyan! 🎉 Ang pagpapahalaga sa magagandang sandali ay nagpapatibay ng ating resilience. Ano ang nagpaganda ng araw mo ngayon?",
      en: "I love hearing that! 🎉 Celebrating good moments builds resilience. What made your day so special?",
    },
  },
  {
    keywords: ['quote', 'mindset', 'inspire', 'motivate', 'positive', 'positibo', 'pahinumdom'],
    replies: {
      ceb: "🌱 Ania ang imong pahinumdom karon:\n\n'It is okay to rest. Even the sun sets to rise again tomorrow.'\n(Okey ra kaayo mopahuway. Bisan ang adlaw mosalop aron mosubang pag-usab ugma.)\n\nAmpingi ang imong kaugalingon, usa-usa lang paghimo sa mga butang! ✨",
      tl: "🌱 Narito ang iyong paalala ngayong araw:\n\n'It is okay to rest. Even the sun sets to rise again tomorrow.'\n(Ayos lang magpahinga. Kahit ang araw ay lumulubog upang sumikat muli bukas.)\n\nHuminga nang malalim, nandito lang ako kasama mo! ✨",
      en: "🌱 Here is your reminder for today:\n\n'It is okay to rest. Even the sun sets to rise again tomorrow.'\n\nBe gentle with yourself—you are doing the best you can with what you have today! ✨",
    },
  },
];

const OUT_OF_SCOPE_KEYWORDS = [
  'javascript', 'python', 'html', 'css', 'calculator',
  'what is the capital', 'football', 'basketball',
  'weather forecast', 'stock market'
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
    const lang = detectLanguage(trimmedMsg);

    // Explicit technical out-of-scope check
    const isExplicitOffTopic = OUT_OF_SCOPE_KEYWORDS.some(kw => lower.includes(kw));
    if (isExplicitOffTopic) {
      let refusal = "I am Jucoch AI, a specialized Mental Health and Emotional Wellness Companion. I can only assist with topics related to mental health, emotional wellbeing, stress management, sleep, and self-care. Please feel free to share how you are feeling today!";
      if (lang === 'ceb') {
        refusal = "Ako si Jucoch AI, ang imong espesyalista nga kauban alang sa Mental Health ug Emotional Wellness. Makatabang lamang ako sa mga topiko bahin sa emosyonal nga kahimsog, stress, kabalaka, pagkatulog, ug self-care. Palihug ipaambit kanako kung unsa ang imong gibati karon!";
      } else if (lang === 'tl') {
        refusal = "Ako si Jucoch AI, ang iyong kasama para sa Mental Health at Emotional Wellness. Maaari lamang akong tumulong sa mga paksang may kinalaman sa emosyonal na kalusugan, stress, pagtulog, at self-care. Huwag mag-atubiling ibahagi kung ano ang iyong nararamdaman ngayon!";
      }

      res.json({
        reply: refusal,
        timestamp: new Date().toISOString(),
        source: 'guardrail-shield',
      });
      return;
    }

    // Call Google Gemini AI with Universal Multilingual Mental Health System Instructions
    if (genAI) {
      const candidateModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-pro'];
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
          console.warn(`Gemini API Warning (${modelName} failed, trying fallback):`, geminiErr?.message || geminiErr);
        }
      }
    }

    // Multilingual Fallback generator if Gemini call is offline
    let defaultReply = "Thank you for sharing that with me. I'm Jucoch AI, your specialized 24/7 mental health companion. How has your mood or sleep been over the past few days?";
    if (lang === 'ceb') {
      defaultReply = "Salamat sa pagpaambit niana kanako. Ako si Jucoch AI, ang imong 24/7 mental health companion. Kumusta man ang imong gibati o pagkatulog karong mga adlawa?";
    } else if (lang === 'tl') {
      defaultReply = "Salamat sa pagbahagi niyan sa akin. Ako si Jucoch AI, ang iyong 24/7 mental health companion. Kumusta ang iyong pakiramdam o pagtulog nitong mga nakaraang araw?";
    }

    for (const cat of MULTILINGUAL_FALLBACK_CATEGORIES) {
      if (cat.keywords.some(kw => lower.includes(kw))) {
        defaultReply = cat.replies[lang] || cat.replies.en;
        break;
      }
    }

    res.json({
      reply: defaultReply,
      timestamp: new Date().toISOString(),
      source: 'jucoch-engine',
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process AI chat response.' });
  }
});

export default router;
