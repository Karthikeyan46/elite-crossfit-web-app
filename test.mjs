import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.VITE_GEMINI_API_KEY; 

if (!API_KEY) {
  console.error("❌ Error: VITE_GEMINI_API_KEY not found in .env file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(model, prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      if (err.message.toLowerCase().includes("429") || err.message.toLowerCase().includes("quota") || err.message.toLowerCase().includes("rate limit")) {
        console.warn(`⚠️ Rate limited. Waiting 10s... (attempt ${i + 1}/${retries})`);
        await delay(10000);
      } else {
        throw err; 
      }
    }
  }
  throw new Error("Max retries reached");
}

try {
  console.log(`🚀 Starting secure test (VITE_ prefix)...`);
  const text = await generateWithRetry(model, "Say hi briefly");
  console.log("✅ Success:", text);
} catch (err) {
  console.error("❌ Final Error:", err.message);
}
