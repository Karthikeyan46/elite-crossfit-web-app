import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY not found in .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function test() {
  try {
    console.log("Testing Gemini API with model: gemini-2.0-flash...");
    const result = await model.generateContent("Hello, are you working?");
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("Error Type:", error.constructor.name);
    console.error("Error Message:", error.message);
    if (error.response) {
      console.error("Response Status:", error.response.status);
      console.error("Response Data:", JSON.stringify(error.response.data, null, 2));
    }
  }
}

test();
