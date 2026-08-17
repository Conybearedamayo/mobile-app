# 🌿 JUCOCH — Mental Health & Wellness Capstone System

> **Anonymized Mental Health Tracking, Google Gemini AI Coaching, & Cloud Database Platform.**

Jucoch is a full-stack mental health and wellness application built with **Expo React Native**, **TypeScript**, **Node.js Express**, **Prisma ORM**, **Neon PostgreSQL**, and **Google Gemini AI**. It prioritizes user privacy through **anonymous alias protection** while providing Master Admins with real-time system monitoring and strict safety guardrails for mental wellness support.

---

## 📌 1. System Roles & Access Guide

Jucoch enforces **3 distinct role levels** with strict security and privacy controls:

| Role | Access Level | Official Login Credentials | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| 🛡️ **Admin** | Master System Control | `conybeared69@gmail.com`<br>`christiancarlmacan@gmail.com`<br>*(Use your Admin Password)* | • Live Real-time Daily Activity Audit Feed<br>• Registered Users Roster Management<br>• Master System Counter Analytics |
| 🎓 **Student** | Student User | Public Sign Up (Create Account) | • AI Wellness Index & Score<br>• 24/7 Google Gemini AI Wellness Companion<br>• Guided Breathwork & Mood Check-in |
| 👤 **Individual**| Personal User | Public Sign Up (Create Account) | • Personal Wellness Index & Loggers<br>• Anonymous Alias Identity Protection |

---

## 🚀 2. Quick Execution Guide (How to Run the Capstone System)

### Prerequisites:
- **Node.js** (v18 or higher installed on your computer)
- **npm** (comes with Node.js)
- **Expo Go App** on your phone (optional, or press `w` to run directly in your browser)

---

### Step A: Launching the Backend API Server

1. Open your terminal window and navigate to `backend-api`:
   ```bash
   cd backend-api
   ```

2. Install backend dependencies (if not yet installed):
   ```bash
   npm install
   ```

3. Ensure `.env` is configured with your **Neon PostgreSQL** and **Google Gemini AI** keys:
   ```env
   PORT=3000
   JWT_SECRET=your_jwt_secret_here
   DATABASE_URL="postgresql://user:password@your-neon-db-host/neondb?sslmode=require"
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

4. Push schema tables to Neon PostgreSQL and seed Admin accounts:
   ```bash
   npx prisma db push
   npx ts-node src/seed.ts
   ```

5. Start the API Server:
   ```bash
   npm run dev
   ```
   *(Server starts at `http://localhost:3000`)*

---

### Step B: Launching the Mobile Application (Expo Go / Android / iOS)

1. Open a second terminal window and navigate to `mobile-app`:
   ```bash
   cd mobile-app
   ```

2. Install mobile dependencies (if not yet installed):
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start -c
   ```

4. **Running on Mobile**:
   - Open **Expo Go** app on your Android or iPhone and scan the displayed **QR Code**.
   - Or press **`a`** to launch on Android Emulator / Physical USB device.
   - Or press **`i`** to launch on iOS Simulator.

---

## 🔒 3. Security & AI Mental Health Guardrails

- **Password Visibility Toggle**: Interactive eye icon button on Login and Register screens.
- **Strict Input Validation**: Rejects empty strings or whitespace-only inputs (`"   "`) to prevent unauthorized access.
- **Google Gemini AI Guardrails**:
  - The AI Chatbot is strictly restricted to **Mental Health & Emotional Wellness** topics only.
  - Automatically politely declines off-topic questions (e.g. coding, math, general trivia, sports) and redirects users back to emotional support.

---

## 📂 4. Project Directory Structure

```
semi-capstone/
├── .gitignore                 # Excludes node_modules, build artifacts, and secret .env files
├── mobile-app/                # Frontend Expo React Native Application
│   ├── app/                   # Expo Router screens (login, register, loggers)
│   │   └── (tabs)/            # Main bottom-tab navigation (index, chat, insights, profile)
│   ├── components/            # Reusable UI components & Dashboards
│   │   ├── dashboards/        # AdminDashboard.tsx (Master Control Panel)
│   │   ├── OtpModal.tsx       # 6-Digit Email OTP Verification Modal
│   │   └── ForgotPassModal.tsx# Interactive Password Reset Modal
│   ├── context/               # WellnessContext.tsx (Global state manager)
│   └── src/services/          # API HTTP Services (authService.ts, wellnessService.ts)
│
├── backend-api/               # Node.js + Express + Prisma API Backend
│   ├── prisma/                # Database schema.prisma (PostgreSQL)
│   ├── src/                   # Express routes (/auth, /wellness, /admin, /ai)
│   └── .env                   # Environment variables (Neon DB URL, Gemini Key)
│
└── documentation/             # Project Design Documentation & ERD Specification
    ├── ERD_SPECIFICATION.md   # Visual Mermaid ERD Diagram & Entity Dictionary
    └── ARCHITECTURE.md        # System Architecture & Technical Specifications
```

---

## 🎨 5. Key System Features & Highlights

- **Hero AI Wellness Index**: Real-time emotional score calculation with streak counter.
- **Guided Breathwork Exercise**: Interactive 2-minute relaxation modal with breathing ring animation.
- **Quick Mood Check-in**: 1-Tap mood selector carousel on the home dashboard.
- **Master Admin Control Panel**: Live daily audit activity feed and registered user management.
- **24/7 AI Coach Chat**: Powered by Google Gemini AI with strict mental health safety boundaries.

---

## 📄 License & Contribution Policy
This project is developed for educational capstone demonstration purposes.
