import connectDB from "@/lib/db";
import ChatMessage from "@/models/chatMessage.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const geminiUrl = process.env.GEMINI_API_URL!;

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { lastMessage, role } = await req.json();
    const prompt = `You are an AI reply suggestion system for a vehicle booking chat app.
         Generate short,smart,human-like  quick reply suggestionns based on:
         -Role(Driver or User)
         -Recent-Message

         Rules:
         -Return exactly 3 suggestions
         -Keep replies short(3-12 words)
         -Match the conversation context and tone
         -Driver replies should sound professional and helpful
         -User replies should sound natural and realistic
         -Avoid repetition
         -Return only valid JSON

         Output format:
         {
         "suggestions":[
         "Reply 1",
         "Reply 2",
         "Reply 3",
         ]
         }

         Input:
         Role: ${role}
         Recent-Message: ${lastMessage}
         `;
    const response = await axios.post(geminiUrl, {
      contents: [
        {
          parts: [
            {
              text: `${prompt}`,
            },
          ],
        },
      ],
    });

    const suggestion = response.data.candidates[0].content.parts[0].text;
    return NextResponse.json(suggestion, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `get ai-suggestion error ${error}` },
      { status: 500 }
    );
  }
}
