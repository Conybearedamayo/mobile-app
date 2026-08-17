# System Architecture

## Overview
The Capstone System (named "Jucoch") is a wellness‑focused mobile application that enables users to log moods, sleep, activities, and journal entries, and to interact with an AI‑powered wellness coach. The system consists of three main parts:

1. **backend-api** – A Node.js/Express server written in TypeScript that exposes a RESTful API for data persistence (likely backed by a database; see ERD) and serves as the bridge to external AI services.
2. **mobile-app** – A React Native application built with Expo that provides the user interface (mood logger, chat, insights, profile, etc.) and consumes the backend API.
3. **documentation** – Contains entity‑relationship diagrams, screen mockups, and other design artifacts.

## Backend (backend-api)
- **Framework**: Express.js with TypeScript.
- **Entry point**: `src/index.ts`.
- **Middleware**: CORS, JSON body parsing.
- **Environment**: Configuration via `.env` (managed by `dotenv`).
- **Port**: Defined by `PORT` env var, default `3000`.
- **Routes**: Currently a single health‑check endpoint (`GET /`) returning a friendly message.
- **Planned extensions**: User authentication, wellness data endpoints, AI service integration.

## Mobile Application (mobile-app)
- **Framework**: React Native with Expo.
- **State Management**: React Context (`WellnessContext`) for global state (user alias, role, logs, computed wellness score).
- **Screen Structure** (organized under `app/(tabs)/`):
  - Dashboard (home)
  - Mood Logger
  - AI Chat
  - AI Insights
  - Wellness Profile
- **Styling**: Centralized theme (`src/theme.ts`) and reusable components (`src/components/`).
- **Assets**: Images, icons, and SVG illustrations located in `assets/`.
- **Persistence**: Currently uses in‑memory state via React state; future versions will persist via the backend API or local storage (AsyncStorage).

## Documentation (documentation/)
- `erd_diagram.svg` – Entity‑Relationship Diagram illustrating the planned data model (users, mood logs, sleep logs, activity logs, journal entries).
- Screen mockups (`screen_*.png`) – Visual references for each major screen in the mobile app.
- Additional design notes may be added here.

## Data Flow
1. User interacts with the mobile UI (e.g., logs a mood).
2. The UI dispatches an action via `WellnessContext` (currently updates local state).
3. In the final implementation, the context will send a request to the backend API (`POST /moods`, etc.).
4. The API validates, stores the data in the database, and returns a response.
5. The mobile app updates its local state or fetches updated data to reflect changes.
6. For AI chat/insights, the mobile app sends user input to the backend, which forwards it to an external LLM (e.g., Claude) and returns the generated response.

## Dependencies & Tooling
- **Backend**: Node.js, TypeScript, Express, CORS, dotenv.
- **Mobile**: Expo, React Native, React.
- **Development Tools**: ESLint, Prettier (via VSCode settings), Git.
- **Package Managers**: npm (backend) and npm/Yarn (mobile via Expo).

## Deployment Considerations
- Backend can be deployed to any Node‑compatible host (e.g., Render, Fly.io, AWS Elastic Beanstalk).
- Mobile app is built with Expo; can be distributed via Expo Go, Apple App Store, Google Play Store, or as a standalone binary.
- Environment variables (API keys, database URLs) must be kept secret and not committed to the repository.

## Diagrams
See `documentation/erd_diagram.svg` for the current entity‑relationship model.

---
*Last updated: 2026-07-30*