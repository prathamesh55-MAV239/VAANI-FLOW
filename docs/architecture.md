# VaaniFlow Architecture Documentation

> **Every Voice. Understood.**  
> AI-powered multilingual conversational intelligence platform.

---

## 1. System Overview

VaaniFlow is built as a clean modular monolith that connects real-time speech recognition, conversational intent understanding, multilingual translation, and speech synthesis into a unified conversational loop.

```
                          [ USER ]
                             │  ▲
             Natural Speech  │  │ Spoken Audio / Text
                             ▼  │
               ┌───────────────────────────┐
               │    React + Vite Client    │
               │  - Web Speech / STT Blob  │
               │  - Audio Player / TTS     │
               │  - Editorial Minimalist UI│
               └─────────────┬─────────────┘
                             │  ▲
               HTTPS / JSON  │  │ Structured Data
                             ▼  │
               ┌───────────────────────────┐
               │    Node.js + Express      │
               │  - JWT Authentication     │
               │  - Conversation CRUD      │
               │  - Zod Request Validation │
               │  - Ownership Boundaries   │
               └─────────────┬─────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
     │   Database   │ │  Gemini AI   │ │ Voice Layer  │
     │  PostgreSQL  │ │ Multilingual │ │  STT Adapter │
     │  (Supabase)  │ │ Context Mem  │ │  TTS Adapter │
     └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 2. Component Architecture

### A. Frontend Layer (`/client`)
- **Framework**: React 18 with Vite.
- **Routing**: React Router DOM (v6) with `ProtectedRoute` wrappers for authenticated session security.
- **Styling**: Tailwind CSS with custom design tokens (`vf-accent`, `vf-bg`, `vf-surface`, `vf-dark`).
- **State Management**:
  - `AuthContext`: Tracks JWT token, user credentials, login, and registration states.
  - `ConversationContext`: Manages conversations list, active message thread, optimistic updates, and selected languages.
- **Audio & Speech**:
  - `useVoice`: Web Speech Recognition / MediaRecorder recording for STT.
  - Native Web Speech Synthesis for high-fidelity spoken response generation.

### B. Backend API Layer (`/server`)
- **Runtime**: Node.js (ES Modules).
- **Framework**: Express.js with JSON/URL-encoded parsers (15MB limits for audio payloads) and cookie-parser.
- **Security & Authorization**:
  - `bcryptjs`: Password hashing with 10 salt rounds.
  - `jsonwebtoken`: 7-day signed JWT tokens via Authorization Bearer headers or HttpOnly cookies.
  - Strict user-scoping: Every conversation and message operation explicitly queries `WHERE user_id = $authenticatedUser.id`.
- **Validation**: Strict schema validation on all inputs via `zod`.

### C. Database Architecture (`/database`)
- **Engine**: Supabase PostgreSQL with `pgcrypto` for UUID generation.
- **Tables**:
  1. `users`: Stores user profile and salted password hashes.
  2. `conversations`: Stores user conversation threads with auto-updating timestamps.
  3. `messages`: Stores individual turns (`user` vs `assistant`), detected intents, language codes, and timestamps.
- **Development Fallback**: Embedded SQLite/JSON store adapter automatically activates if no `DATABASE_URL` is set, ensuring offline demo reliability.

### D. AI & Voice Pipeline (`/server/services`)
1. **Gemini Conversational Engine (`gemini.service.js`)**:
   - Integrates Google Gemini (`gemini-2.0-flash` / `gemini-1.5-flash`).
   - Retains the last 10 turns of conversation history for pronoun reference resolution (e.g., "it", "when will it arrive").
   - Returns structured JSON: `{ intent, language, response, needs_translation, confidence }`.
2. **Speech-to-Text Adapter (`stt.service.js`)**:
   - Accepts audio blobs/base64 and passes to Gemini multimodal audio models or Web Speech transcripts.
3. **Text-to-Speech Adapter (`tts.service.js`)**:
   - Synthesizes speech configurations (`mr-IN`, `hi-IN`, `en-US`) with pitch and speaking rate parameters.
4. **Translation Service (`translation.service.js`)**:
   - Dynamic translation between Marathi, Hindi, and English using Gemini.

---

## 3. Security Boundary

```
  [ FRONTEND BROWSER ]
          │
          │ HTTPS (JWT in Authorization Bearer)
          ▼
  [ EXPRESS API SERVER ]  <--- Secrets remain ONLY here!
          │
          ├──> DATABASE_URL (Supabase PostgreSQL)
          ├──> GEMINI_API_KEY (Google AI Studio)
          ├──> STT_API_KEY / TTS_API_KEY
          └──> JWT_SECRET
```

- **Zero Secrets on Client**: No API keys, database credentials, or signing secrets are bundled into the client build.
- **CORS Protection**: Restricted to trusted origins (`http://localhost:5173` and deployed Vercel domain).
