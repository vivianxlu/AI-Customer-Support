import { NextResponse } from 'next/server'
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs  = require('fs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash'})


async function startChat(history) {
    return model.startChat({
        history: history,
        generationConfig: {
            maxOutputTokens: 100,
        }
    })
}

export async function POST(request) {
    const data = await request.json()
    const { userMessage, history } = data

    if (!userMessage || !history) {
        return NextResponse.json({ error: "userMessage and history are required"})
    }

    try {
        const chat = await startChat(history)
        const result = await chat.sendMessage(userMessage)
        const response = await result.response
        const text = await response.text()

        const updatedHistory = [
            ...history,
            { role: "user", parts: [{ text: userMessage }] },
            { role: "model", parts: [{ text: text }] },
        ]

        return NextResponse.json({ message: text, history: updatedHistory }, { status: 200 })
    } catch (error) {
        console.error('Error', error)
        return NextResponse.json({ error: 'Failed to geneerate' }, { status: 500 });
    }
}


