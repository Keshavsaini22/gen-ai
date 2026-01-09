const readlineSync = require("readline-sync");
require("dotenv").config();
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { GoogleGenAI } = require("@google/genai");
const { Pinecone } = require("@pinecone-database/pinecone");

const ai = new GoogleGenAI({});
const history = []; // Global history array to maintain conversation context

async function transformQuery(question) {

    history.push({
        role: "user",
        parts: [{ text: question }],
    })

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: history,
        config: {
            systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
                            Only output the rewritten question and nothing else.`,
        },
    });

    history.pop(); // Remove the last user question to avoid duplication
    return response.text;
}


async function chatting(question) {
    //convert this question to vector
    const queries = await transformQuery(question);

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
    });

    //convert this question to vector
    const queryVector = await embeddings.embedQuery(queries);

    //make connection with pinecone
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const searchResults = await pineconeIndex.query({
        vector: queryVector,
        topK: 10,
        includeMetadata: true,
    });

    const context = searchResults.matches
        .map(match => match.metadata.text)
        .join("\n\n---\n\n");


    //generate the final answer
    history.push({ role: "user", parts: [{ text: queries }] }); // Use the rewritten question

    const finalResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: history,
        config: {
            systemInstruction: `You have to behave like a Data Structure and Algorithm Expert.
            You will be given a context of relevant information and a user question.
            Your task is to answer the user's question based ONLY on the provided context.
            If the answer is not in the context, you must say "I could not find the answer in the provided document."
            Keep your answers clear, concise, and educational.
            Context: ${context}`,
        },
    });

    history.push({ role: "model", parts: [{ text: finalResponse.text }] });
    console.log("\n");

    console.log("Answer: ", finalResponse.text);
}

async function main() {
    const userProblem = readlineSync.question("Ask me anything--> ");
    await chatting(userProblem);
    main();
}

main();