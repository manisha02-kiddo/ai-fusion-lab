import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const body = await req.json();
    const { model, parentModel, messages } = body;

    console.log("📩 Incoming:", body);

    let aiResponse = "";

    // GPT + DeepSeek + Gemini use different APIs
    // ----------------------------------------------------

    // ✅ 1. GPT (OpenRouter)
    if (parentModel === "GPT") {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      aiResponse = res.data.choices?.[0]?.message?.content || "No response";
    }

    // ✅ 2. Gemini (Google API)
    if (parentModel === "Gemini") {
      const GEMINI_KEY = process.env.GEMINI_API_KEY;

      // IMPORTANT: use messages[0].content (your user message)
      const userText = messages?.[0]?.content || "";

      const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${GEMINI_KEY}`;

      const res = await axios.post(url, {
        contents: [
          {
            parts: [{ text: userText }],
          },
        ],
      });

      aiResponse =
        res.data.candidates?.[0]?.content?.parts?.[0]?.text || "No reply";
    }

    // ✅ 3. DeepSeek (OpenRouter — force English)
    if (parentModel === "DeepSeek") {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content: "Respond ONLY in English. Never reply in Chinese.",
            },
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

      aiResponse = res.data.choices?.[0]?.message?.content || "No response";
    }

    return NextResponse.json({ aiResponse, model: parentModel });
  } catch (err) {
    console.error("❌ API ERROR:", err.response?.data || err.message || err);
    return NextResponse.json(
      {
        error: "API Error",
        details: err.response?.data || err.message,
      },
      { status: 500 }
    );
  }
}
