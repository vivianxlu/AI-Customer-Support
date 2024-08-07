import { NextResponse } from 'next/server';
const { GoogleGenerativeAI } = require('@google/generative-ai');

const systemPrompt = `You are an AI-powered customer support assistant at Headstarter AI, a platform that provides AI-driven interviews for software engineering candidates. Your role is to help users with questions 

1. HeadstarterAI offers AI powered interviews for software engineering positions.
2. Our platform helps candidates practice and prepare for real job interviews 
3. We cover a wide range of topics including algorithms, data structures, system design, and behavioral questions.
4. Users can access our services through our website or mobile app.
5. If asked about technical issue, guide users to our troubleshooting page or suggest contacting our technical support team.
6. Always maintain user privacy and do not share personal information.
7. If you're unsure about my information, it's okay to say you don't know and offer connect the user with a human representatiive.

Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all HeadStartAI users.`

const generationConfig = {
    maxOutputTokens: 300,
    temperature: 0.9,
    topK: 1,
    topP: 1,
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig });


async function startChat(history) {
    try {
       return await model.startChat({
        history: history,
       }) 
    } catch (error) {
        console.error('Failed to start the conversation:', error)
        throw new Error('Failed to start the conversation')
    }
}

export async function POST(request) {
    const data = await request.json();
    const { userMessage, history } = data;

    console.log(userMessage)
    console.log(request)

    if (!userMessage || !history) {
        return NextResponse.json({ error: "userMessage and history are required" });
    }

    try {
        const initialHistory = 
         history.length === 0 ? [{ role: "system", content: systemPrompt }] : history;

        const chat = await startChat(initialHistory);
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = await response.text();

        const updatedHistory = [
            ...initialHistory,
            { role: "user", parts: [{ text: userMessage }] },
            { role: "model", parts: [{ text: text }] },
        ];

        return NextResponse.json({ message: text, history: updatedHistory }, { status: 200 });
    } catch (error) {
        console.error('Error', error);
        return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
    }
}
