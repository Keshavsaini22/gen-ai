const { GoogleGenAI } = require("@google/genai");
const readlineSync = require("readline-sync");
require("dotenv").config();

const ai = new GoogleGenAI({});

const history = [];

function sum({ num1, num2 }) {
    return num1 + num2;
}

function prime({ num }) {
    if (num <= 1) return false;

    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }

    return true;
}

async function getCryptoPrice({ coin }) {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin}`);
    const data = await response.json();

    return data;
}

const sumDeclaration = {
    name: "sum",
    description: "Returns the sum of two numbers.",
    parameters: {
        type: "OBJECT",
        properties: {
            num1: { type: "number", description: "The first number." },
            num2: { type: "number", description: "The second number." },
        },
        required: ["num1", "num2"],
    },
};

const primeDeclaration = {
    name: "prime",
    description: "Checks if a number is prime.",
    parameters: {
        type: "OBJECT",
        properties: {
            num: { type: "number", description: "The number to check." },
        },
        required: ["num"],
    },
};

const cryptoPriceDeclaration = {
    name: "getCryptoPrice",
    description: "Returns the current price of a cryptocurrency.",
    parameters: {
        type: "OBJECT",
        properties: {
            coin: { type: "string", description: "The name of the cryptocurrency like 'bitcoin'." },
        },
        required: ["coin"],
    },
};

const availableTools = {
    sum: sum,
    prime: prime,
    getCryptoPrice: getCryptoPrice,
};

async function runAgent(userQuery) {
    history.push({ role: "user", parts: [{ text: userQuery }] });

    while (true) {

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: history,
            config: {
                systemInstruction: `You are an AI Agent, You have access of 3 available tools like to find sum of 2 number, get crypto price of any currency and find a number is prime or not.
                Use these tools whenever required to confirm user query. If user ask general question you can answer it directly if you don't need help of these three tools`,
                tools: [{
                    functionDeclarations: [sumDeclaration, primeDeclaration, cryptoPriceDeclaration],
                }]
            },
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            console.log(response.functionCalls[0]);
            const { name, args } = response.functionCalls[0];

            const funCall = availableTools[name];
            const result = await funCall(args);

            const functionResponsePart = {
                name: name,
                response: {
                    result: result,
                }
            };

            // model 
            history.push({
                role: "model",
                parts: [
                    {
                        functionCall: response.functionCalls[0],
                    },
                ],
            });

            // result Ko history me daalna
            history.push({
                role: "user",
                parts: [
                    {
                        functionResponse: functionResponsePart,
                    },
                ],
            });

        } else {
            history.push({ role: "model", parts: [{ text: response.text }] });
            console.log("Answer: ", response.text);
            break;
        }
    }
}

async function main() {
    const question = readlineSync.question("Enter your question: ");
    await runAgent(question);
    main();
}

main();
