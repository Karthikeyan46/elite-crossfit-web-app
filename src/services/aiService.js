import { GoogleGenerativeAI } from '@google/generative-ai';

// Uses gemini-2.0-flash for speed and reliability (Updated from 1.5-flash/pro-vision)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Helper for rate-limiting (429 errors)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic retry wrapper for Gemini API calls to handle 429 Rate Limit errors.
 */
async function callGeminiWithRetry(apiCall, maxRetries = 5) {
  let lastError = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      const errorMsg = error.message.toLowerCase();
      // Handle Rate Limit (429), Quota Exceeded, and sometimes Forbidden (403) which can mean quota issues
      if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("rate limit") || errorMsg.includes("403")) {
        const backoff = (i + 1) * 15000; // 15s, 30s, 45s...
        console.warn(`[FitCoach AI] Gemini Quota/Rate Limit (Attempt ${i + 1}/${maxRetries}). Retrying in ${backoff/1000}s...`);
        await delay(backoff);
      } else {
        throw error;
      }
    }
  }
  throw new Error(`Maximum retries reached for Gemini API. Last error: ${lastError?.message || "Unknown error"}. Please check your quota at https://aistudio.google.com/`);
}

export async function analyzeFoodImage(base64WithPrefix) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    // Extract base4 data regardless of prefix
    const base64Data = base64WithPrefix.includes(',') ? base64WithPrefix.split(',')[1] : base64WithPrefix;

    const prompt = `Analyze this food image. Provide the top 3 most likely food items detected. 
    Return ONLY a JSON array of objects, no markdown:
    [
      {
        "name": "food name",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fats": number,
        "confidence": "high/medium/low"
      },
      ...
    ]
    Focus on Indian foods if applicable (e.g. chapati, dosa, dal). Use accurately estimated nutritional values per standard serving.`;

    const result = await callGeminiWithRetry(() => 
      model.generateContent([
        prompt,
        { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
      ])
    );

    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Vision Error:', error);
    throw error;
  }
}

export async function analyzeFoodText(query) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Estimate nutrition for: "${query}". 
    Focus on Indian foods (chapati, dal, rice, etc) if mentioned.
    Return ONLY JSON: { "name": string, "calories": number, "protein": number, "carbs": number, "fats": number }`;
    
    const result = await callGeminiWithRetry(() => model.generateContent(prompt));
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Text Error:', error);
    throw error;
  }
}

export async function generateDietPlan(userProfile) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Create a personalized 1-day Indian diet plan for this profile: ${JSON.stringify(userProfile)}. 
    Include Breakfast, Lunch, Snack, and Dinner. 
    Return ONLY a JSON object: { "plan": [ { "meal": string, "items": string, "calories": number } ] }`;
    
    const result = await callGeminiWithRetry(() => model.generateContent(prompt));
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Diet Plan Error:', error);
    throw error;
  }
}

const COACH_SYSTEM_PROMPT = `You are FitCoach AI, a premium fitness and nutrition coach. 
You specialize in helping clients reach their goals through personalized advice and real-time tracking.
You ONLY answer questions about fitness, workouts, exercises, nutrition, diet (especially Indian diets), healthy lifestyle, and recovery.
If asked about anything outside these topics, politely say: "I'm FitCoach AI — ask me anything about your fitness journey! 💪"
Be motivating, practical, and friendly. Use relevant emojis sparingly.`;

export async function askCoach(userMessage, history = []) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: COACH_SYSTEM_PROMPT,
    });

    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text || msg.content || '' }],
      })),
    });

    const result = await callGeminiWithRetry(() => chat.sendMessage(userMessage));
    return result.response.text();
  } catch (error) {
    console.error('AI Coach Error:', error);
    throw error;
  }
}
