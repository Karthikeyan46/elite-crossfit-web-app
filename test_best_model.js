import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.VITE_GEMINI_API_KEY;

async function testModel(modelName) {
    console.log(`Testing model: ${modelName}...`);
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'OK'");
        const response = await result.response;
        console.log(`✅ ${modelName} works! Response: ${response.text()}`);
        return true;
    } catch (err) {
        console.log(`❌ ${modelName} failed: ${err.message}`);
        return false;
    }
}

async function runTests() {
    const modelsToTest = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite-preview-09-2025",
        "gemini-1.5-pro"
    ];

    for (const m of modelsToTest) {
        if (await testModel(m)) {
            console.log(`\nRECOMMENDED MODEL: ${m}`);
            break;
        }
    }
}

runTests();
