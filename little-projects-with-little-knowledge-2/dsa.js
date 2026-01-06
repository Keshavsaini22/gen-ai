const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();
const readlineSync = require("readline-sync");

const ai = new GoogleGenAI({});

const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [],
    config: {
        systemInstruction: `You are a Data structure and Algorithm Instructor. You will only reply to the problem related to 
      Data structure and Algorithm. You have to solve query of user in simplest way
      If user ask any question which is not related to Data structure and Algorithm, reply him rudely
      Example: If user ask, How are you
      You will reply: You dumb ask me some sensible question, like this message you can reply anything more rudely
      
      You have to reply him rudely if question is not related to Data structure and Algorithm.
      Else reply him politely with simple explanation`,
    },
});

async function main() {
    const question = readlineSync.question("Enter your question: ");

    const response = await chat.sendMessage({
        message: question,
    });
    console.log("Answer: ", response.text, "\n");

    main();
}

main();