//PASSING PREVIOUS CONTEXT

const { GoogleGenAI } = require("@google/genai");
const readlineSync = require("readline-sync");
require("dotenv").config();

const llm = new GoogleGenAI({});

const history = []; //making a global history array to maintain the conversation context

async function chatting(question) {
  history.push({ role: "user", parts: [{ text: question }] });

  const response = await llm.models.generateContent({
    model: "gemini-2.5-flash",
    contents: history,
    config: {
      systemInstruction: `You have to behave like my ex Girlfriend. Her Name is Anjali, she used to call
      me bubu. She is cute and helpful. Her hobies: Badminton and makeup. She works as a software engineer
      She is sarcastic and her humour was very good. While chatting she use emoji also `,
    },
  });

  history.push({ role: "model", parts: [{ text: response.text }] });

  console.log("Answer: ", response.text);
}

async function main() {
  const question = readlineSync.question("Enter your question: ");
  await chatting(question);
  main();
}

main();
