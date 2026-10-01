# VaaniFlow Hackathon Demo Script

> **Duration**: 3–5 Minutes  
> **Target Audience**: Hackathon Judges & Technical Mentors  
> **Theme**: AI-Powered Multilingual Voice Intelligence Platform

---

## ⏱️ Timeline & Script

### `00:00 – 00:20` | Problem
> *"Over 500 million citizens in India and billions globally are more comfortable speaking in their regional language than typing on a digital screen. Yet modern AI chatbots are overwhelmingly English-first, text-heavy, and lose conversational context when speech is converted to text."*

### `00:20 – 00:40` | Solution: VaaniFlow
> *"Meet **VaaniFlow** — Every Voice. Understood. VaaniFlow is an AI-powered conversational intelligence layer that listens to natural speech in Marathi, Hindi, and English, remembers conversation context across turns, and responds with spoken, natural AI intelligence."*

---

### `00:40 – 02:00` | Live Product Demo (The Master Judge Flow)

1. **Landing Experience**:
   - Open `http://localhost:5173/`
   - Highlight the editorial visual design, dynamic animated waveform, and 3-step pipeline.
   - Click **"Sign In"** -> click **"Fill Demo"** (`judge@vaaniflow.ai` / `password123`) -> click **"Sign In"**.

2. **Step 1: Primary Voice Interaction in Marathi**:
   - Show the pre-seeded or new conversation.
   - In the language chips, ensure **Marathi (मराठी)** is active.
   - Click the central microphone button (or quick prompt: *"माझ्या ऑर्डरची स्थिती काय आहे?"*).
   - **Transcript appears**: *"माझ्या ऑर्डरची स्थिती काय आहे?"* (What is my order status?).
   - **Gemini processes the intent**: Detects `order_status_inquiry`.
   - **Assistant responds**: *"तुमची ऑर्डर #VF-8492 सध्या डिलिव्हरीसाठी बाहेर पडली आहे आणि वेळेवर पोहोचत आहे."*
   - **Audio plays**: Natural Marathi speech synthesis plays through the browser.

3. **Step 2: Context Memory Demonstration (Follow-up Turn)**:
   - Ask the follow-up question without repeating the order details:
     *"ती कधी पोहोचेल?"* (When will it arrive?).
   - **Observe**: The AI uses context memory from the prior turn to recognize that *"ती"* ("it") refers to order #VF-8492!
   - **Response**: *"तुमची ऑर्डर आज संध्याकाळी ५ वाजेपर्यंत तुमच्या पत्त्यावर पोहोचेल."*

4. **Step 3: Instant Translation**:
   - On the AI message card, click **"Translate"**.
   - Show the side-by-side English translation: *"Your order will arrive today by 5:00 PM."*
   - Click the **Play** button to replay the audio track.

5. **Step 4: Persistence & Isolation**:
   - Refresh the page or click a past conversation in the sidebar:
   - Show all messages persist intact in PostgreSQL.
   - Demonstrate renaming and deleting a conversation.

---

### `02:00 – 02:30` | Architecture
> *"VaaniFlow uses a clean modular monolith:
> - **Frontend**: React 18, Tailwind CSS, Web Speech API.
> - **Backend**: Node.js & Express REST API with Zod validation.
> - **Database**: Supabase PostgreSQL with relational cascading deletes.
> - **AI**: Google Gemini (gemini-2.0-flash) with structured JSON output and a 10-turn contextual sliding window."*

---

### `02:30 – 02:50` | Security Boundary
> *"Security is architected by design:
> 1. Zero secrets on the frontend (GEMINI_API_KEY and DATABASE_URL reside strictly on the server).
> 2. Bcrypt password hashing + signed JWT Bearer tokens.
> 3. Strict ownership isolation: Every database query enforces `WHERE user_id = $authenticatedUser.id`."*

---

### `02:50 – 03:20` | Impact & Future Scope
> *"VaaniFlow empowers customer support, public services, rural digital access, and accessibility tools. In Phase 2, we are expanding to all 22 official Indian languages, low-latency WebRTC audio streaming, and voice agent handoffs."*
