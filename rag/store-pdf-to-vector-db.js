require("dotenv").config();
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { Pinecone } = require("@pinecone-database/pinecone");
const { PineconeStore } = require("@langchain/pinecone");

async function main() {
    //STEP 1: Load the PDF document
    const PDF_PATH = "./dsa.pdf";

    const pdfLoader = new PDFLoader(PDF_PATH);
    const rawDocs = await pdfLoader.load();

    //     console.log(JSON.stringify(rawDocs, null, 2));
    //     console.log("Total pages:", rawDocs.length);


    //STEP 2: Split the document into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
    // console.log(JSON.stringify(chunkedDocs.slice(0, 2), null, 2));


    //STEP 3: Initializing the Embedding model
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
    });


    //STEP 4: Initializing the vector store (Pinecone)
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
        pineconeIndex,
        maxConcurrency: 5,
    });
}

main().catch(console.error);
