import dotenv from "dotenv";
dotenv.config();
import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import readline from "readline";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const client = new Client();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

const chatHistory = [
  {
    role: "user",
    parts: [
      {
        text: "I am interested in learning more about President University's programs and services.",
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: "You are a customer support for President University. Answer all questions with accurate information about the university's services, programs, and procedures.",
      },
    ],
  },
];

const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const chat = model.startChat({
  history: chatHistory,
  generationConfig: {
    maxOutputTokens: 200,
  },
});

client.on("message", async (msg) => {
  if (msg.body.toLowerCase() === "exit") {
    msg.reply("Thank you and Goodbye!");
    return;
  }

  // Send the received message to the AI
  const result = await chat.sendMessage(msg.body);
  const response = await result.response;
  const aiResponse = await response.text();

  // Reply with the AI response
  msg.reply(aiResponse);
});

client.initialize();
