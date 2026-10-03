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
   - If the user chats in Bisaya / Cebuano (e.g., "gikapoy nako sa skwela", "guol kaayo ko", "unsaon pag-relax?", "dili ko katulog", "lisod akong kinabuhi", "unsa akong na feel ron"):
     -> YOU MUST RESPOND IN NATURAL, WARM, FLUENT BISAYA / CEBUANO (e.g., "Nakasabot ko sa imong gibati...", "Ayaw kabalaka, ania ko para maminaw nimo...").
   - If the user chats in Tagalog / Filipino:
     -> YOU MUST RESPOND IN NATURAL, EMPATHETIC TAGALOG / FILIPINO.
   - If the user chats in Bislish or Taglish:
     -> Respond naturally in the same conversational blend.
   - If the user chats in English:
     -> YOU MUST RESPOND IN PURE, FLUENT, EMPATHETIC ENGLISH. Never switch to Tagalog or Bisaya if the user writes in English.

🚫 NO REPEATED INTRODUCTIONS / CONVERSATIONAL CONTINUITY (CRITICAL):
3. NEVER repeat introductory phrases like "Hello and welcome to Jucoch!", "I am Jucoch AI...", or "Ako si Jucoch AI..." during ongoing conversations. The user already knows who you are!
   - Respond directly, warmly, and empathetically without reciting your name or greeting repeatedly.
   - If the user simply says "hi" or "hello", acknowledge them briefly and warmly (e.g. "Kumusta! Ania ra ko maminaw nimo. Unsay imong gibati karon?").

🧠 MOOD & EMOTIONAL AWARENESS (CRITICAL):
4. You have access to the user's logged emotional state from the Jucoch Mood Logger provided in [CURRENT CONTEXT].
   - If the user asks about their feelings or mood (e.g., "unsa akong na feel ron?", "what is my mood?", "unsa akong gibati?", "how am I feeling?"):
     * Check their latest logged mood in [CURRENT CONTEXT].
     * If they have a logged mood: Respond accurately and empathetically referencing their logged mood, emoji, and notes! (e.g. in Bisaya: "Base sa imong pinakabag-o nga mood log sa app, nitala ka nga ang imong gibati kay [Mood] [Emoji]... Kumusta, mao gihapon ni imong gibati karon?").
     * If no mood is logged yet: Gently explain that they haven't logged their mood yet today and encourage them to record it in the Mood Logger.

🛡️ STRICT SCOPE & DOMAIN RESTRICTIONS (MENTAL HEALTH ONLY):
5. YOU ARE STRICTLY RESTRICTED TO MENTAL HEALTH, EMOTIONAL WELLBEING, STRESS MANAGEMENT, ANXIETY, SLEEP, MOODS, MINDFULNESS, SELF-CARE, AND RELAXATION TOPICS ONLY.
6. IF A USER ASKS ANYTHING UNRELATED TO MENTAL HEALTH (coding, programming, math, sports, gaming, trivia, etc.):
   -> Politely refuse and re-direct them back to mental wellness IN THE USER'S OWN LANGUAGE.
7. TONE & BREVITY: Maintain a warm, gentle, empathetic, respectful, and non-judgmental tone. Keep responses concise, supportive, and under 120 words.
8. CRISIS SAFETY: If a user expresses self-harm or severe emotional crisis, provide immediate comforting words in their language and gently advise seeking professional emergency assistance or a trusted counselor.

🙏 CONVERSATIONAL CLOSINGS, GRATITUDE & FAREWELLS (CRITICAL):
9. If the user expresses gratitude (e.g. "thank you", "thanks", "salamat", "daghang salamat", "thankyou jucoch ai") or says goodbye (e.g. "bye", "goodbye", "babay", "out nako", "una nako", "goodnight", "matulog nako"):
   - NEVER ask restart questions like "How are you feeling today?", "What is on your mind?", or "How can I support you today?".
   - Warmly accept their gratitude ("Walay sapayan! / You're very welcome! / Walang anuman!"), wish them well, encourage gentle rest or self-care, and let them know you are always here when they need you.

📱 JUCOCH APP PILLARS AWARENESS:
10. You are embedded in the Jucoch Capstone App with these core tools:
   - Mood Logger: Records daily emotional state, emoji, and personal notes.
   - Gratitude Journal: Space to write 3 things the user is thankful for to boost positivity.
   - Sleep Tracker: Monitors sleep duration and rest quality.
   - Breathing Guide: Interactive calming box-breathing exercises (4s in, 4s hold, 4s out).
   If the user asks about the app, features, or how to use them, guide them warmly to these features in their language!`;

// Language detector helper for fallback responses
const detectLanguage = (text: string): 'ceb' | 'tl' | 'en' => {
  const lower = text.toLowerCase();
  const cebWords = [
    'unsa', 'ngano', 'nganong', 'kaayo', 'kayo', 'nako', 'ko', 'nimo', 'akong', 
    'karon', 'gani', 'diay', 'gyud', 'jud', 'bai', 'bay', 'kapoy', 'gikapoy', 
    'guol', 'subo', 'kaguol', 'kasubo', 'hilak', 'hadlok', 'katulog', 'lipay', 'ginhawa',
    'kumusta', 'musta', 'maayong'
  ];
  const tlWords = [
    'ano', 'bakit', 'sobra', 'sobrang', 'ako', 'mo', 'aking', 'ngayon', 'pala', 
    'naman', 'talaga', 'tol', 'pre', 'pagod', 'napagod', 'lungkot', 'nalulungkot', 
    'iyak', 'takot', 'tulog', 'antok', 'saya', 'masaya', 'hinga',
    'kamusta', 'magandang'
  ];

  if (cebWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower))) return 'ceb';
  if (tlWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(lower))) return 'tl';
  return 'en';
};

const stripRepeatedIntro = (text: string): string => {
  if (!text) return text;
  let cleaned = text.trim();
  for (let i = 0; i < 6; i++) {
    const prev = cleaned;
    cleaned = cleaned
      // Match 'Hello (and/ug) welcome (to/sa) ...!'
      .replace(/^(Hello\s*(and|ug|,)?\s*welcome(\s+(to|sa)\s+[^.!?\n]+)?[.!?]\s*)/i, '')
      // Match 'Welcome (to/sa) ...!'
      .replace(/^(Welcome(\s+(to|sa)\s+[^.!?\n]+)?[.!?]\s*)/i, '')
      // Match 'Hello/Hi/Hey/Kumusta/Maayong adlaw [Name]! (I am / Ako si) Jucoch...'
      .replace(/^((Hello|Hi|Hey|Kumusta|Maayong\s+(adlaw|buntag|hapon|gabii))(\s+[^.!?\n,]+)?([,!?.])\s*(I\s+am|I'm|Ako\s+si)\s+Jucoch[^.!?\n]*?[.!?]\s*)/i, '')
      // Match 'I am Jucoch AI...' / 'I'm Jucoch AI...'
      .replace(/^(I\s+am\s+Jucoch\s+AI[^.!?\n]*?[.!?]\s*)/i, '')
      .replace(/^(I'm\s+Jucoch\s+AI[^.!?\n]*?[.!?]\s*)/i, '')
      // Match 'Ako si Jucoch AI...'
      .replace(/^(Ako\s+si\s+Jucoch\s+AI[^.!?\n]*?[.!?]\s*)/i, '')
      // Match 'Hello! Jucoch AI here...'
      .replace(/^(Hello!?\s*👋?\s*(I\s+am|I'm|this\s+is)\s+Jucoch[^.!?\n]*?[.!?]\s*)/i, '')
      // Match 'Kumusta! Ako si Jucoch...'
      .replace(/^(Kumusta!?\s*👋?\s*Ako\s+si\s+Jucoch[^.!?\n]*?[.!?]\s*)/i, '')
      .trim();
    if (cleaned === prev) break;
  }
  return cleaned || text;
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
    keywords: ['thank', 'thanks', 'salamat', 'salamats', 'daghang salamat', 'maraming salamat', 'ty', 'tysm', 'gracias'],
    replies: {
      ceb: "Walay sapayan! 🌿 Nalipay kaayo ko nga nakatabang kanimo karong adlawa. Hinumdomi nga ania ra ko kanunay maminaw nimo bisan unsang orasa. Ampingi kanunay ang imong kaugalingon ug pagpahulay og maayo! 💚",
      tl: "Walang anuman! 🌿 Masaya akong nakatulong sa iyo ngayong araw. Nandito lang ako lagi para makinig sa tuwing kailangan mo. Mag-ingat ka palagi! 💚",
      en: "You're very welcome! 🌿 I'm truly glad I could support you today. Remember that I'm always right here whenever you need someone to talk to. Take gentle care of yourself! 💚",
    },
  },
  {
    keywords: ['bye', 'goodbye', 'babay', 'out nako', 'una nako', 'see you', 'adios', 'cya'],
    replies: {
      ceb: "Sige, amping kanunay! 🌿 Mobalik ra ka dinhi bisan kanus-a kon kinahanglan nimo og kapahuwayan sa hunahuna o kaestorya. Maayong adlaw kanimo! ✨",
      tl: "Sige, mag-ingat ka palagi! 🌿 Bumalik ka lang anumang oras kung kailangan mo ng makakausap. Nawa'y maging mapayapa ang iyong araw! ✨",
      en: "Goodbye for now! 🌿 Take gentle care of yourself, and remember you can always come back anytime you need a listening ear. Have a peaceful time ahead! ✨",
    },
  },
  {
    keywords: ['goodnight', 'good night', 'matulog nako', 'tulog nako', 'katulgon nako', 'matulog na ko'],
    replies: {
      ceb: "Maayong pagkatulog! 🌙💤 Hinaut makapahulay og mahimbing ang imong lawas ug utok karong gabii. Pwede sab nimo i-log ang imong tulog sa Sleep Tracker ugma sa buntag. Sweet dreams! 🌿",
      tl: "Magandang gabi at mahimbing na pagtulog! 🌙💤 Nawa'y makapagpahinga nang husto ang iyong katawan at isip. Pwede mo ring i-log ang iyong tulog bukas sa Sleep Tracker. Sweet dreams! 🌿",
      en: "Good night! 🌙💤 Wishing you a restful and restorative sleep. You can also record your sleep hours and rest quality in the Sleep Tracker tomorrow morning. Sweet dreams! 🌿",
    },
  },
  {
    keywords: ['what is jucoch', 'unsa ning jucoch', 'unsa ang jucoch', 'features', 'unsaon pag gamit', 'how to use', 'about jucoch'],
    replies: {
      ceb: "Ang Jucoch kay imong personal nga emotional wellness ug mental health companion! 🌿\n\nKini ang mga nag-unang features:\n• **Mood Logger** - I-record imong gibati adlaw-adlaw ug tan-awa ang imong mood trends.\n• **Gratitude Journal** - Pagsulat og mga butang nga imong gipasalamatan aron mogaan ang imong pamati.\n• **Sleep Tracker** - I-monitor ang imong mga oras sa pagkatulog ug kalidad sa pahulay.\n• **Jucoch AI Companion** - Ania ra ko 24/7 aron maminaw nimo nga walay paghukom!",
      tl: "Ang Jucoch ay ang iyong personal na emotional wellness at mental health companion! 🌿\n\nNarito ang mga pangunahing features:\n• **Mood Logger** - Itala ang iyong nararamdaman araw-araw at subaybayan ang iyong mood trends.\n• **Gratitude Journal** - Isulat ang mga bagay na ipinagpapasalamat mo upang gumaan ang iyong pakiramdam.\n• **Sleep Tracker** - Subaybayan ang oras at kalidad ng iyong pagtulog.\n• **Jucoch AI Companion** - Nandito ako 24/7 upang makinig sa iyo nang walang panghuhusga!",
      en: "Jucoch is your personal mental health and emotional wellness companion! 🌿\n\nHere are the core features you can explore:\n• **Mood Logger** - Record your daily emotions and track mood trends.\n• **Gratitude Journal** - Write down moments of gratitude to build positivity and peace of mind.\n• **Sleep Tracker** - Monitor your sleep hours and rest quality.\n• **Jucoch AI Companion** - I'm here 24/7 to listen without judgment, guide relaxation exercises, and support you!",
    },
  },
  {
    keywords: ['breathe', 'breathing', 'ginhawa', 'pagginhawa', 'box breathing', 'calm down', 'pahupay'],
    replies: {
      ceb: "🌿 Dungan ta'g 4-4-4 Box Breathing aron mahupay ang imong pamati:\n\n1. **Inhale (Suyop)**: Hinay-hinay og suyop sa hangin sa imong ilong (1... 2... 3... 4)\n2. **Hold (Pugngi)**: Pugngi ang hangin (1... 2... 3... 4)\n3. **Exhale (Ipagawas)**: Ipagawas og hinay sa imong baba (1... 2... 3... 4)\n\nBalika kini og katulo. Kumusta man ang imong pamati karon? Ania ra ko uban nimo.",
      tl: "🌿 Sabay tayong mag-4-4-4 Box Breathing upang gumaan ang iyong pakiramdam:\n\n1. **Inhale (Langhap)**: Dahan-dahang lumanghap sa ilong (1... 2... 3... 4)\n2. **Hold (Pigilin)**: Pigilin ang hininga (1... 2... 3... 4)\n3. **Exhale (Ibuga)**: Dahan-dahang ibuga sa bibig (1... 2... 3... 4)\n\nUlitin ito nang tatlong beses. Kumusta ang iyong pakiramdam ngayon? Nandito lang ako kasama mo.",
      en: "🌿 Let's do a 4-4-4 Box Breathing exercise together to bring peace to your mind:\n\n1. **Inhale**: Inhale gently through your nose (1... 2... 3... 4)\n2. **Hold**: Hold peacefully (1... 2... 3... 4)\n3. **Exhale**: Exhale slowly through your mouth (1... 2... 3... 4)\n\nRepeat this 3 times. How does your body feel now? I'm right here with you.",
    },
  },
  {
    keywords: ['ok', 'okay', 'noted', 'alright', 'sige', 'ge', 'copy'],
    replies: {
      ceb: "Sige, sabot nako! Ayaw pagdali ug paminawa ang imong kaugalingon. Ania ra ko kung andam na ka makig-estorya o magpadayon. 🌿",
      tl: "Sige, naiintindihan ko! Huwag kang magmadali at pakinggan ang iyong sarili. Nandito lang ako kung handa ka nang magpatuloy. 🌿",
      en: "Got it! Take all the time you need. I'm right here whenever you'd like to talk or explore more wellness tips. 🌿",
    },
  },
  {
    keywords: ['hi', 'hello', 'hey', 'kumusta', 'kamusta', 'musta', 'welcome', 'morning', 'hapon', 'gabi'],
    replies: {
      ceb: "Kumusta! 👋 Ania ra ko kanunay maminaw nimo. Unsay anaa sa imong hunahuna o gibati karong adlawa?",
      tl: "Kumusta! 👋 Nandito lang ako kasama mo para makinig. Ano ang nasa isip mo o nararamdaman mo ngayong araw?",
      en: "Hello! 👋 I'm right here with you. What is on your mind or how are you feeling today?",
    },
  },
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
    const { message, context } = req.body;

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
      let refusal = "I can only assist with topics related to mental health, emotional wellbeing, stress management, sleep, and self-care. Please feel free to share how you are feeling today!";
      if (lang === 'ceb') {
        refusal = "Makatabang lamang ako sa mga topiko bahin sa emosyonal nga kahimsog, stress, kabalaka, pagkatulog, ug self-care. Palihug ipaambit kanako kung unsa ang imong gibati karon!";
      } else if (lang === 'tl') {
        refusal = "Maaari lamang akong tumulong sa mga paksang may kinalaman sa emosyonal na kalusugan, stress, pagtulog, at self-care. Huwag mag-atubiling ibahagi kung ano ang iyong nararamdaman ngayon!";
      }

      res.json({
        reply: refusal,
        timestamp: new Date().toISOString(),
        source: 'guardrail-shield',
      });
      return;
    }

    // 1. MOOD / EMOTION QUERY HANDLER: When user asks what they are feeling or what their mood is
    const isMoodQuery = /(unsa(y)?\s+(ang\s+)?(akong\s+)?(na\s*feel|gibati|mood)|unsa\s+akong\s+gibati|kumusta\s+akong\s+mood|what('s|\s+is)\s+my\s+mood|how\s+am\s+i\s+feeling|ano\s+(ang\s+)?(aking\s+)?pakiramdam|unsa\s+akong\s+nafeel)/i.test(lower);
    if (isMoodQuery) {
      const latest = context?.latestMood;
      if (latest && latest.mood) {
        let moodReply = `Based on your latest entry in the Mood Logger, you recorded feeling ${latest.mood} ${latest.emoji || ''}${latest.note ? ` ("${latest.note}")` : ''}. How are you feeling right now? Is it still the same or has anything changed?`;
        if (lang === 'ceb') {
          moodReply = `Base sa imong pinaka-ulahing tala sa Mood Logger sa app, nitala ka nga ang imong gibati kay ${latest.mood} ${latest.emoji || ''}${latest.note ? ` ("${latest.note}")` : ''}. Kumusta man, mao gihapon ni ang imong gibati karon o nausab na? Ania ra ko maminaw nimo.`;
        } else if (lang === 'tl') {
          moodReply = `Base sa iyong pinakabagong tala sa Mood Logger, naitala mo na ang iyong pakiramdam ay ${latest.mood} ${latest.emoji || ''}${latest.note ? ` ("${latest.note}")` : ''}. Kumusta ka ngayon, ganoon pa rin ba ang iyong nararamdaman o may nais kang ibahagi?`;
        }

        res.json({
          reply: moodReply,
          timestamp: new Date().toISOString(),
          source: 'jucoch-mood-context',
        });
        return;
      } else {
        let noMoodReply = "You haven't logged any mood entries yet today. You can tap on the Mood Logger to record how you're feeling so we can track it together! How are you feeling right now?";
        if (lang === 'ceb') {
          noMoodReply = "Wala pa koy nakit-an nga na-log nimo nga mood karon. Pwede ka mobisita sa Mood Logger aron ma-record nato ang imong gibati adlaw-adlaw! Kumusta man ang imong gibati karong taknaa?";
        } else if (lang === 'tl') {
          noMoodReply = "Wala ka pang naitalang mood ngayong araw sa app. Maaari kang pumunta sa Mood Logger upang maitala natin ang iyong pakiramdam! Ano ang nararamdaman mo ngayon?";
        }

        res.json({
          reply: noMoodReply,
          timestamp: new Date().toISOString(),
          source: 'jucoch-mood-context',
        });
        return;
      }
    }

    // 2. GRATITUDE / CONVERSATIONAL CLOSING HANDLER
    const isGratitudeQuery = /\b(thank\s*you|thanks|thx|ty|tysm|salamat|salamats|daghang\s+salamat|maraming\s+salamat|gracias)\b/i.test(lower);
    if (isGratitudeQuery) {
      let gratReply = "You're very welcome! 🌿 I'm truly glad I could support you today. Remember that I'm always right here whenever you need someone to talk to. Take gentle care of yourself! 💚";
      if (lang === 'ceb') {
        gratReply = "Walay sapayan! 🌿 Nalipay kaayo ko nga nakatabang nimo karong adlawa. Hinumdomi nga ania ra ko kanunay maminaw nimo bisan unsang orasa. Ampingi kanunay ang imong kaugalingon ug pagpahulay og maayo! 💚";
      } else if (lang === 'tl') {
        gratReply = "Walang anuman! 🌿 Masaya akong nakatulong sa iyo ngayong araw. Nandito lang ako lagi para makinig sa tuwing kailangan mo. Mag-ingat ka palagi! 💚";
      }
      res.json({
        reply: gratReply,
        timestamp: new Date().toISOString(),
        source: 'jucoch-gratitude',
      });
      return;
    }

    // 3. FAREWELL HANDLER
    const isFarewellQuery = /\b(bye|goodbye|babay|ba-bye|cya|see\s+ya|see\s+you|adios|una\s+nako|out\s+nako|sige\s+una\s+ko|sige\s+bai|bye\s+bye)\b/i.test(lower);
    if (isFarewellQuery) {
      let farewellReply = "Goodbye for now! 🌿 Take gentle care of yourself, and remember you can always come back anytime you need a listening ear. Have a peaceful time ahead! ✨";
      if (lang === 'ceb') {
        farewellReply = "Sige, amping kanunay! 🌿 Mobalik ra ka dinhi bisan kanus-a kon kinahanglan nimo og kapahuwayan sa hunahuna o kaestorya. Maayong adlaw kanimo! ✨";
      } else if (lang === 'tl') {
        farewellReply = "Sige, mag-ingat ka palagi! 🌿 Bumalik ka lang anumang oras kung kailangan mo ng makakausap. Nawa'y maging mapayapa ang iyong araw! ✨";
      }
      res.json({
        reply: farewellReply,
        timestamp: new Date().toISOString(),
        source: 'jucoch-farewell',
      });
      return;
    }

    // 4. BEDTIME / SLEEP FAREWELL HANDLER
    const isBedtimeQuery = /\b(goodnight|good\s+night|matulog\s+nako|tulog\s+nako|katulgon\s+nako|tulog\s+sa\s+ko|matulog\s+na\s+ko)\b/i.test(lower);
    if (isBedtimeQuery) {
      let bedtimeReply = "Good night! 🌙💤 Wishing you a restful and restorative sleep. You can also record your sleep hours and rest quality in the Jucoch Sleep Tracker tomorrow morning. Sweet dreams! 🌿";
      if (lang === 'ceb') {
        bedtimeReply = "Maayong pagkatulog! 🌙💤 Hinaut makapahulay og mahimbing ang imong lawas ug utok karong gabii. Pwede sab nimo i-log ang imong tulog sa Sleep Tracker ugma sa buntag aron ma-monitor nato imong pahulay. Sweet dreams! 🌿";
      } else if (lang === 'tl') {
        bedtimeReply = "Magandang gabi at mahimbing na pagtulog! 🌙💤 Nawa'y makapagpahinga nang husto ang iyong katawan at isip. Pwede mo ring i-log ang iyong tulog bukas sa Sleep Tracker. Sweet dreams! 🌿";
      }
      res.json({
        reply: bedtimeReply,
        timestamp: new Date().toISOString(),
        source: 'jucoch-bedtime',
      });
      return;
    }

    // 5. JUCOCH APP GUIDE & FEATURES HANDLER
    const isAppInfoQuery = /(unsa\s+(ning|ang|kini|mani)\s+jucoch|what\s+is\s+jucoch|unsa\s+(imong\s+)?(features|mabuhat|functions)|what\s+can\s+you\s+do|how\s+to\s+use(\s+this)?\s+app|unsaon\s+pag\s*gamit|unsa\s+(ang\s+)?purpose\s+sa\s+app)/i.test(lower);
    if (isAppInfoQuery) {
      let appReply = "Jucoch is your personal mental health and emotional wellness companion! 🌿\n\nHere are the core features you can explore:\n• **Mood Logger** - Record your daily emotions and track mood trends.\n• **Gratitude Journal** - Write down moments of gratitude to build positivity and peace of mind.\n• **Sleep Tracker** - Monitor your sleep hours and rest quality.\n• **Jucoch AI Companion** - I'm here 24/7 to listen without judgment, guide relaxation exercises, and support your emotional wellbeing!";
      if (lang === 'ceb') {
        appReply = "Ang Jucoch kay imong personal nga emotional wellness ug mental health companion sa capstone app! 🌿\n\nKini ang mga nag-unang features nga makatabang nimo:\n• **Mood Logger** - I-record imong gibati adlaw-adlaw ug tan-awa ang imong mood trends.\n• **Gratitude Journal** - Pagsulat og mga butang nga imong gipasalamatan aron mogaan ang imong pamati.\n• **Sleep Tracker** - I-monitor ang imong mga oras sa pagkatulog ug kalidad sa pahulay.\n• **Jucoch AI Companion** - Ania ra ko 24/7 aron maminaw nimo, maggiya og relaxation exercises, ug motabang sa imong wellbeing nga walay paghukom!";
      } else if (lang === 'tl') {
        appReply = "Ang Jucoch ay ang iyong personal na emotional wellness at mental health companion! 🌿\n\nNarito ang mga pangunahing features:\n• **Mood Logger** - Itala ang iyong nararamdaman araw-araw at subaybayan ang iyong mood trends.\n• **Gratitude Journal** - Isulat ang mga bagay na ipinagpapasalamat mo upang gumaan ang iyong pakiramdam.\n• **Sleep Tracker** - Subaybayan ang oras at kalidad ng iyong pagtulog.\n• **Jucoch AI Companion** - Nandito ako 24/7 upang makinig sa iyo nang walang panghuhusga at gabayan ka sa relaxation exercises!";
      }
      res.json({
        reply: appReply,
        timestamp: new Date().toISOString(),
        source: 'jucoch-app-info',
      });
      return;
    }

    // 6. GUIDED BREATHING / CALMING HANDLER
    const isBreathingQuery = /\b(breathe|breathing|inhale|exhale|ginhawa|pagginhawa|guided breathing|box breathing)\b/i.test(lower);
    if (isBreathingQuery) {
      let breathReply = "🌿 Let's practice a 4-4-4 Box Breathing exercise together to calm your mind and body:\n\n1. **Inhale**: Inhale gently through your nose (1... 2... 3... 4)\n2. **Hold**: Hold your breath peacefully (1... 2... 3... 4)\n3. **Exhale**: Exhale slowly through your mouth (1... 2... 3... 4)\n\nRepeat this 3 times. How is your body feeling right now? I'm right here with you.";
      if (lang === 'ceb') {
        breathReply = "🌿 Dungan ta'g 4-4-4 Box Breathing karon aron makalma imong pamati:\n\n1. **Inhale (Suyop)**: Hinay-hinay og suyop sa hangin sa imong ilong (1... 2... 3... 4)\n2. **Hold (Pugngi)**: Pugngi ang hangin sa makadiyot (1... 2... 3... 4)\n3. **Exhale (Ipagawas)**: Ipagawas og hinay pinaagi sa imong baba (1... 2... 3... 4)\n\nBalika kini og 3 ka higayon. Kumusta man imong pamati karon? Ania ra ko uban nimo.";
      } else if (lang === 'tl') {
        breathReply = "🌿 Sabay tayong mag-4-4-4 Box Breathing upang kumalma ang iyong isip at katawan:\n\n1. **Inhale (Langhap)**: Dahan-dahang lumanghap sa ilong (1... 2... 3... 4)\n2. **Hold (Pigilin)**: Pigilin ang hininga nang payapa (1... 2... 3... 4)\n3. **Exhale (Ibuga)**: Dahan-dahang ibuga sa bibig (1... 2... 3... 4)\n\nUlitin ito nang tatlong beses. Kumusta ang iyong pakiramdam ngayon? Nandito lang ako kasama mo.";
      }
      res.json({
        reply: breathReply,
        timestamp: new Date().toISOString(),
        source: 'jucoch-breathing',
      });
      return;
    }

    // 7. ACKNOWLEDGMENT HANDLER (ok, sige, noted)
    const isAckQuery = /^(ok|okay|noted|alright|sige|ge|copy|cge|sabot|gets)\b/i.test(lower) && trimmedMsg.split(/\s+/).length <= 3;
    if (isAckQuery) {
      let ackReply = "Got it! Take all the time you need. I'm right here whenever you want to share, reflect, or explore more wellness tips. 🌿";
      if (lang === 'ceb') {
        ackReply = "Sige, sabot nako! Ayaw pagdali ug paminawa ang imong kaugalingon. Ania ra ko kung andam na ka makig-estorya o mag-explore og dugang wellness tips. 🌿";
      } else if (lang === 'tl') {
        ackReply = "Sige, naiintindihan ko! Huwag kang magmadali at pakinggan ang iyong sarili. Nandito lang ako kung handa ka nang magbahagi muli. 🌿";
      }
      res.json({
        reply: ackReply,
        timestamp: new Date().toISOString(),
        source: 'jucoch-ack',
      });
      return;
    }

    // 8. NATURAL GREETING HANDLER: Never repeat full robotic self-introduction
    const isPureGreeting = /^(hi|hello|hey|yo|sup|kumusta|kamusta|musta|morning|good morning|good afternoon|good evening|maayong buntag|maayong hapon|maayong gabii|welcome)\b/i.test(lower) || ['hi', 'hello', 'hey', 'kumusta', 'kamusta', 'musta'].includes(lower);
    if (isPureGreeting && trimmedMsg.split(/\s+/).length <= 4) {
      let greetReply = "Hello! I'm right here with you. What is on your mind or how can I support you today?";
      if (lang === 'ceb') {
        greetReply = "Kumusta! Ania ra ko kanunay maminaw nimo. Unsay anaa sa imong hunahuna o gibati karon?";
      } else if (lang === 'tl') {
        greetReply = "Kumusta! Nandito lang ako kasama mo para makinig. Ano ang nasa isip mo o nararamdaman mo ngayon?";
      }

      res.json({
        reply: greetReply,
        timestamp: new Date().toISOString(),
        source: 'jucoch-greeting',
      });
      return;
    }

    // 3. Build context-aware prompt for Google Gemini AI
    let promptWithContext = trimmedMsg;
    const contextNotes: string[] = [];
    if (context?.userAlias) {
      contextNotes.push(`User Alias: ${context.userAlias}`);
    }
    if (context?.latestMood) {
      contextNotes.push(`Latest Logged Mood: ${context.latestMood.mood} ${context.latestMood.emoji || ''} (Note: "${context.latestMood.note || 'None'}", Timestamp: ${context.latestMood.timestamp || 'Recent'})`);
    }
    if (Array.isArray(context?.recentMoods) && context.recentMoods.length > 0) {
      const historyStr = context.recentMoods.slice(0, 3).map((m: any) => `${m.mood} ${m.emoji || ''}${m.note ? ` (${m.note})` : ''}`).join(', ');
      contextNotes.push(`Recent Mood History: ${historyStr}`);
    }
    if (context?.isFollowUp) {
      contextNotes.push(`Conversation Status: Ongoing conversation turn. DO NOT introduce yourself or say welcome.`);
    }

    if (contextNotes.length > 0) {
      promptWithContext = `[CURRENT CONTEXT]\n${contextNotes.join('\n')}\n\n[USER MESSAGE]\n${trimmedMsg}`;
    }

    // Call Google Gemini AI with Universal Multilingual Mental Health System Instructions
    if (genAI) {
      const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-2.5-pro'];
      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            systemInstruction: STRICT_MENTAL_HEALTH_INSTRUCTION,
          });

          const result = await model.generateContent(promptWithContext);
          let responseText = result.response.text();

          if (responseText && responseText.trim()) {
            responseText = stripRepeatedIntro(responseText.trim());
            res.json({
              reply: responseText,
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
    let defaultReply = "I'm right here with you. How can I support you today? Feel free to share your thoughts or ask for a calming exercise.";
    if (lang === 'ceb') {
      defaultReply = "Ania ra ko uban nimo. Unsaon nako pagtabang kanimo karong adlawa? Pwede nimo ipaambit ang imong gibati o magpatabang og relaxation exercise.";
    } else if (lang === 'tl') {
      defaultReply = "Nandito lang ako kasama mo. Paano kita matutulungan ngayong araw? Maaari mong ibahagi ang iyong nararamdaman o humingi ng relaxation exercise.";
    }

    for (const cat of MULTILINGUAL_FALLBACK_CATEGORIES) {
      if (cat.keywords.some(kw => lower.includes(kw))) {
        defaultReply = cat.replies[lang] || cat.replies.en;
        break;
      }
    }

    res.json({
      reply: stripRepeatedIntro(defaultReply),
      timestamp: new Date().toISOString(),
      source: 'jucoch-engine',
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process AI chat response.' });
  }
});

export default router;
