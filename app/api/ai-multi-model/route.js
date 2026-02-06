import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { aj } from "@/config/Arcjet";

export async function POST(req) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized (no userId)" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { model, parentModel, messages } = body;

    // Arcjet (user-based)
    const decision = await aj.protect(req, {
      key: `user:${userId}`,
      requested: 1,
    });

    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Usage limit reached" },
        { status: 429 }
      );
    }

    let aiResponse = "";

    /* GPT (OpenRouter) */
    if (parentModel === "GPT") {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        { model, messages },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      aiResponse = res.data.choices[0].message.content;
    }

    /* DeepSeek (OpenRouter) */
    else if (parentModel === "DeepSeek") {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            { role: "system", content: "Respond in English" },
            ...messages,
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      aiResponse = res.data.choices[0].message.content;
    }

    /* Gemini */
    else if (parentModel === "Gemini") {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: messages[0].content }] }],
        }
      );
      aiResponse =
        res.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    return NextResponse.json({
      success: true,
      aiResponse,
      model: parentModel,
    });
  } catch (err) {
    console.error("AI ERROR:", err);
    return NextResponse.json(
      { error: "AI request failed" },
      { status: 500 }
    );
  }
}
