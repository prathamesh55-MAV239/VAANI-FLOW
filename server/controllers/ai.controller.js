import db from '../config/db.js';
import geminiService from '../services/gemini.service.js';
import sttService from '../services/stt.service.js';
import ttsService from '../services/tts.service.js';
import translationService from '../services/translation.service.js';

/**
 * Handle AI conversational chat with full context memory & persistence
 * POST /api/ai/chat
 */
export async function chat(req, res, next) {
  try {
    const userId = req.user.id;
    const { conversationId, message, inputLanguage = 'en', responseLanguage = 'en' } = req.body;

    // 1. Verify conversation ownership
    const convResult = await db.query(
      'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
      [conversationId, userId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied.',
      });
    }

    const conversation = convResult.rows[0];

    // 2. Load recent conversation history (last 10 messages)
    const historyResult = await db.query(
      'SELECT role, content, language, intent FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT 10',
      [conversationId]
    );
    const history = historyResult.rows;

    // 3. Send to Gemini Conversational AI
    const aiResult = await geminiService.generateChatResponse({
      message,
      history,
      inputLanguage,
      responseLanguage,
    });

    // 4. Optional Translation if target language differs or requested
    let translation = null;
    if (aiResult.needs_translation || (responseLanguage !== 'en' && inputLanguage === 'en')) {
      const transResult = await translationService.translateText({
        text: aiResult.response,
        sourceLanguage: aiResult.language,
        targetLanguage: responseLanguage,
      });
      translation = transResult.translation;
    }

    // 5. Persist user message
    await db.query(
      'INSERT INTO messages (conversation_id, role, content, language, intent) VALUES ($1, $2, $3, $4, $5)',
      [conversationId, 'user', message, inputLanguage, aiResult.intent]
    );

    // 6. Persist assistant response
    const assistantMsgResult = await db.query(
      'INSERT INTO messages (conversation_id, role, content, language, intent) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at',
      [conversationId, 'assistant', aiResult.response, responseLanguage, aiResult.intent]
    );
    const savedAssistantMsg = assistantMsgResult.rows[0];

    // 7. Update conversation title if still default
    if (conversation.title === 'New Conversation' || !conversation.title) {
      const autoTitle = message.length > 30 ? `${message.slice(0, 30)}...` : message;
      await db.query(
        'UPDATE conversations SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [autoTitle, conversationId]
      );
    } else {
      await db.query('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [conversationId]);
    }

    // 8. Return structured response matching master specification
    res.status(200).json({
      success: true,
      data: {
        intent: aiResult.intent,
        language: aiResult.language,
        response: aiResult.response,
        translation: translation || undefined,
        confidence: aiResult.confidence,
        messageId: savedAssistantMsg.id,
        createdAt: savedAssistantMsg.created_at,
        source: aiResult.source,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Speech-To-Text transcription endpoint
 * POST /api/ai/transcribe
 */
export async function transcribe(req, res, next) {
  try {
    const { audio, mimeType, language = 'mr' } = req.body;

    const result = await sttService.transcribeAudio({
      audioBase64: audio,
      mimeType,
      languageHint: language,
    });

    res.status(200).json({
      success: true,
      data: {
        text: result.text,
        language: result.language,
        confidence: result.confidence,
        provider: result.provider,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Text-To-Speech synthesis endpoint
 * POST /api/ai/speak
 */
export async function speak(req, res, next) {
  try {
    const { text, language = 'mr' } = req.body;

    const result = await ttsService.synthesizeSpeech({
      text,
      language,
    });

    res.status(200).json({
      success: true,
      data: {
        text: result.text,
        language: result.language,
        speechConfig: result.speechConfig,
        audioBase64: result.audioBase64,
        provider: result.provider,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Modular Translation endpoint
 * POST /api/ai/translate
 */
export async function translate(req, res, next) {
  try {
    const { text, sourceLanguage = 'auto', targetLanguage = 'en' } = req.body;

    const result = await translationService.translateText({
      text,
      sourceLanguage,
      targetLanguage,
    });

    res.status(200).json({
      success: true,
      data: {
        originalText: result.originalText,
        translation: result.translation,
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage,
        provider: result.provider,
      },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  chat,
  transcribe,
  speak,
  translate,
};
