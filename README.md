# VaaniFlow (वाणीफ्लो)

> **Every Voice. Understood.**  
> *AI-powered multilingual conversational intelligence platform.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v24.x-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Google-Gemini%202.0%20Flash-orange.svg)](https://ai.google.dev)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-339933.svg)](https://supabase.com)

---

## 📖 Overview

**VaaniFlow** transforms natural human speech into context-aware, intelligent, and spoken multilingual conversations across **Marathi (मराठी)**, **Hindi (हिन्दी)**, and **English**.

Unlike traditional chatbots that treat turns as isolated text fragments, VaaniFlow bridges the voice gap by preserving context memory across conversations, recognizing colloquial Indian language nuances, translating on demand, and vocalizing responses using natural speech synthesis.

---

## 🎯 The Problem

1. **The Regional Voice Barrier**: Over 500 million people in India and billions worldwide are more comfortable speaking than typing, yet digital interfaces are text-heavy.
2. **Context Loss in Speech**: Most speech bots discard multi-turn context once audio is transcribed into text, failing on simple follow-ups like *"When will it arrive?"*.
3. **Fragmented Multi-Model Stacks**: Cobbling together disjointed STT, LLM, and TTS APIs often introduces high latency, security vulnerabilities, and brittle user experiences.

---

## 💡 The Solution

VaaniFlow provides a unified conversational intelligence loop:
```
  USER SPEAKS (मराठी / हिन्दी / English)
             ↓
    SPEECH-TO-TEXT (STT)
             ↓
    LANGUAGE & INTENT DETECTION
             ↓
  GEMINI 2.0 CONTEXTUAL REASONING (Retains 10-turn memory)
             ↓
    DYNAMIC TRANSLATION (Optional)
             ↓
    TEXT-TO-SPEECH (Spoken Audio Output)
             ↓
  DATABASE PERSISTENCE (Supabase PostgreSQL)
```

---

## ✨ Key Features

- 🎙️ **Voice-First Interaction**: Instant microphone recording with live interim transcripts and dynamic waveform visualization.
- 🧠 **Context Memory**: Gemini retains recent conversation turns to resolve pronouns (*"it"*, *"that"*, *"the previous order"*) across turns.
- 🌐 **Multilingual Triad**: Native speech comprehension and pronunciation for **Marathi (मराठी)**, **Hindi (हिन्दी)**, and **English**.
- 🔊 **Text-to-Speech (TTS) & Replay**: Crystal-clear voice playback with waveform progress bars and replay controls.
- 🌍 **Instant Translation**: One-click side-by-side translation into alternate languages without interrupting conversation flow.
- 🔒 **Backend-Only AI Security**: Zero API keys or database connection strings are exposed to the client bundle.
- 📂 **Session Persistence & Isolation**: Users can only query, rename, and delete their own conversations.

---

## 🏗️ Architecture

```
  [ React 18 + Vite Frontend ]
              │  ▲
  HTTPS / JWT │  │ JSON / Audio Data
              ▼  │
  [ Express.js REST API Server ]
              │
      ┌───────┼─────────────────────────┐
      ▼       ▼                         ▼
  [Supabase] [Gemini Conversational AI] [Voice Layer]
  Postgres   - Multilingual Prompting   - STT Adapter
             - Context Sliding Window   - TTS Adapter
```

Detailed architecture specifications and flow diagrams are documented in [docs/architecture.md](docs/architecture.md).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router DOM.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Zod.
- **Database**: Supabase PostgreSQL (with embedded SQLite fallback for zero-friction local development).
- **AI Engine**: Google Gemini API (`gemini-2.0-flash`).
- **Voice Engine**: Web Speech API with modular backend STT/TTS adapters.

---

## 🗄️ Database Schema

PostgreSQL schema is available in [database/schema.sql](database/schema.sql):

- `users`: `id`, `name`, `email` (UNIQUE), `password_hash`, `created_at`
- `conversations`: `id`, `user_id` (FK), `title`, `created_at`, `updated_at`
- `messages`: `id`, `conversation_id` (FK), `role` (`user`|`assistant`), `content`, `language`, `intent`, `created_at`

---

## 🔑 Environment Variables

### Backend (`server/.env`):
```env
PORT=5000
DATABASE_URL=postgresql://postgres:...@...supabase.co:5432/postgres
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key
STT_API_KEY=your_stt_api_key_optional
TTS_API_KEY=your_tts_api_key_optional
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`client/.env`):
```env
VITE_API_URL=
```
*(Leave blank in local development to use the Vite reverse proxy)*

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+ (tested on Node.js v24 LTS)
- npm v9+

### 1. Clone & Install
```bash
git clone https://github.com/your-org/vaaniflow.git
cd vaaniflow

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Verify Backend Tests
Run the comprehensive test suite verifying Checkpoints 1 through 5:
```bash
cd server
node test-runner.js
```

### 3. Run Development Servers
In terminal 1 (Backend API):
```bash
cd server
node server.js
```
*Backend runs on `http://localhost:5000`*

In terminal 2 (Frontend Client):
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🎬 Master Judge Demo Flow

1. Open `http://localhost:5173` in your browser.
2. Click **"Sign In"** -> click **"Fill Demo"** (`judge@vaaniflow.ai` / `password123`) -> click **"Sign In"**.
3. Select **मराठी (Marathi)** from the language selector.
4. Click the central microphone button and speak (or click the quick prompt):
   > *"माझ्या ऑर्डरची स्थिती काय आहे?"* *(What is my order status?)*
5. **Observe**:
   - The Marathi transcript is captured.
   - Gemini detects the intent `order_status_inquiry`.
   - Assistant responds with order details.
   - Spoken audio plays back automatically.
6. Ask the follow-up question:
   > *"ती कधी पोहोचेल?"* *(When will it arrive?)*
7. **Observe Context Memory**:
   - Gemini connects *"ती"* (*"it"*) to order #VF-8492 and provides the exact delivery time.
8. Click **"Translate"** on the response card to see instant English or Hindi translation.

Detailed timing breakdown in [docs/demo-script.md](docs/demo-script.md).

---

## 🗺️ Future Roadmap

- **Phase 2**: Expansion to all 22 official Indian languages, customizable voice timbre, sentiment analysis.
- **Phase 3**: WebRTC bidirectional live audio streaming, human agent handoff for customer service desks.
- **Phase 4**: Multi-tenant enterprise platform with custom domain knowledge bases and telephony IVR integration.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
