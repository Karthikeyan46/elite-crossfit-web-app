import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

const apiKey = process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await result.json();
        console.log("Saving model data to models_debug.json...");
        fs.writeFileSync('models_debug.json', JSON.stringify(data, null, 2));
        console.log("Done.");
    } catch (err) {
        console.error("Error listing models:", err);
    }
}

listModels();
