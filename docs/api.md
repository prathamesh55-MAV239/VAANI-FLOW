# VaaniFlow API Documentation

This document describes the REST API endpoints provided by the VaaniFlow backend service.

Base URL: `http://localhost:5000/api` (or production host)

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new user account.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Rohan Sharma",
    "email": "rohan@example.com",
    "password": "password123"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Account created successfully",
    "token": "eyJhbGciOi...",
    "user": {
      "id": "a1b2c3d4-...",
      "name": "Rohan Sharma",
      "email": "rohan@example.com",
      "created_at": "2026-10-01T08:00:00.000Z"
    }
  }
  ```

---

### `POST /auth/login`
Authenticates a user and issues a JWT token.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "judge@vaaniflow.ai",
    "password": "password123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "token": "eyJhbGciOi...",
    "user": {
      "id": "a1b2c3d4-...",
      "name": "Hackathon Judge",
      "email": "judge@vaaniflow.ai"
    }
  }
  ```

---

### `GET /auth/me`
Retrieves the currently authenticated user profile.
- **Access**: Protected (`Authorization: Bearer <JWT>`)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "user": {
      "id": "a1b2c3d4-...",
      "name": "Hackathon Judge",
      "email": "judge@vaaniflow.ai",
      "created_at": "2026-10-01T08:00:00.000Z"
    }
  }
  ```

---

### `POST /auth/logout`
Logs out user and clears cookies.
- **Access**: Public
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully."
  }
  ```

---

## 2. Conversation Endpoints

### `GET /conversations`
Lists all conversations belonging to the authenticated user, sorted by recency.
- **Access**: Protected
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "id": "7da8fab6-...",
        "user_id": "a1b2c3d4-...",
        "title": "Customer Service Demo (मराठी)",
        "created_at": "2026-10-01T08:00:00.000Z",
        "updated_at": "2026-10-01T08:05:00.000Z"
      }
    ]
  }
  ```

---

### `POST /conversations`
Creates a new conversation thread.
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "title": "Travel Inquiry"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "...",
      "title": "Travel Inquiry",
      "created_at": "..."
    }
  }
  ```

---

### `GET /conversations/:id`
Retrieves a conversation thread with its complete message history.
- **Access**: Protected (Strict ownership verification)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "...",
      "title": "Customer Service Demo",
      "messages": [
        {
          "id": "...",
          "role": "user",
          "content": "माझ्या ऑर्डरची स्थिती काय आहे?",
          "language": "mr",
          "intent": "order_status_inquiry"
        },
        {
          "id": "...",
          "role": "assistant",
          "content": "तुमची ऑर्डर #VF-8492 सध्या डिलिव्हरीसाठी बाहेर पडली आहे.",
          "language": "mr",
          "intent": "order_status_inquiry"
        }
      ]
    }
  }
  ```

---

### `PATCH /conversations/:id`
Renames an existing conversation.
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "title": "Order #VF-8492 Resolution"
  }
  ```

---

### `DELETE /conversations/:id`
Permanently deletes a conversation and cascades to its messages.
- **Access**: Protected

---

## 3. AI & Voice Pipeline Endpoints

### `POST /ai/chat`
Sends a message to the Gemini Conversational AI with context memory and persistence.
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "conversationId": "7da8fab6-...",
    "message": "माझ्या ऑर्डरची स्थिती काय आहे?",
    "inputLanguage": "mr",
    "responseLanguage": "mr"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "intent": "order_status_inquiry",
      "language": "mr",
      "response": "तुमची ऑर्डर #VF-8492 सध्या डिलिव्हरीसाठी बाहेर पडली आहे आणि वेळेवर पोहोचत आहे.",
      "confidence": 0.99,
      "messageId": "msg-uuid-...",
      "createdAt": "2026-10-01T08:10:00.000Z"
    }
  }
  ```

---

### `POST /ai/transcribe`
Converts voice audio into text.
- **Access**: Public / Session
- **Request Body**:
  ```json
  {
    "audio": "data:audio/webm;base64,...",
    "mimeType": "audio/webm",
    "language": "mr"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "text": "माझ्या ऑर्डरची स्थिती काय आहे?",
      "language": "mr",
      "confidence": 0.95
    }
  }
  ```

---

### `POST /ai/speak`
Synthesizes speech configuration and audio data for playback.
- **Access**: Public / Session
- **Request Body**:
  ```json
  {
    "text": "तुमची ऑर्डर डिलिव्हरीसाठी बाहेर पडली आहे.",
    "language": "mr"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "text": "तुमची ऑर्डर डिलिव्हरीसाठी बाहेर पडली आहे.",
      "language": "mr",
      "speechConfig": {
        "code": "mr-IN",
        "name": "Marathi (India)",
        "pitch": 1.0,
        "rate": 0.95
      },
      "provider": "browser_speech_synthesis"
    }
  }
  ```

---

### `POST /ai/translate`
Translates text between supported languages.
- **Access**: Public / Session
- **Request Body**:
  ```json
  {
    "text": "तुमची ऑर्डर सध्या डिलिव्हरीसाठी बाहेर पडली आहे.",
    "sourceLanguage": "mr",
    "targetLanguage": "en"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "originalText": "तुमची ऑर्डर सध्या डिलिव्हरीसाठी बाहेर पडली आहे.",
      "translation": "Your order is currently out for delivery.",
      "sourceLanguage": "mr",
      "targetLanguage": "en"
    }
  }
  ```

---

## 4. Health Check

### `GET /health`
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "service": "VaaniFlow API",
    "status": "healthy",
    "timestamp": "2026-10-01T08:12:00.000Z",
    "version": "1.0.0"
  }
  ```
