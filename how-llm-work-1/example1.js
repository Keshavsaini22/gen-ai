const { GoogleGenAI } = require("@google/genai");
const readlineSync = require("readline-sync");
require("dotenv").config();

const ai = new GoogleGenAI({});

const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [],
});

async function main() {
    const question = readlineSync.question("Enter your question: ");

    const response = await chat.sendMessage({
        message: question,
    });
    console.log("Answer: ", response.text);

    main();
}

main();

// async function main() {
//     const response = await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents: "What is the capital of India?",
//     });
//     console.log(response.text);
// }
