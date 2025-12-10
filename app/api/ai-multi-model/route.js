import { NextResponse } from "next/server";
import { aj } from "@/config/Arcjet";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { trackUserUsage } from "@/app/utils/usageAnalytics";

export async function POST(req) {
  try {
    const { userId } = auth();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] || "guest";

    /* ✅ ARCJET PROTECTION */
    const decision = await aj.protect(req, {
      key: userId || ip,
      requested: 1, // ✅ 1 message = 1 token
    });

    if (decision.isDenied()) {
      return NextResponse.json(
        {
          allowed: false,
          error: "Free trial limit reached",
          remainingToken: 0,
        },
        { status: 429 }
      );
    }

    /* ✅ READ BODY */
    const body = await req.json();
    const { model, parentModel, messages } = body;

    let aiResponse = "";

    /* ✅ AI PROVIDERS (UNCHANGED LOGIC STYLE) */

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

      aiResponse =
        res.data?.choices?.[0]?.message?.content || "No response";
    }

    if (parentModel === "Gemini") {
      const GEMINI_KEY = process.env.GEMINI_API_KEY;
      const userText = messages?.[0]?.content || "";

      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${GEMINI_KEY}`,
        {
          contents: [{ parts: [{ text: userText }] }],
        }
      );

      aiResponse =
        res.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply";
    }

    if (parentModel === "DeepSeek") {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content: "Respond ONLY in English.",
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

      aiResponse =
        res.data?.choices?.[0]?.message?.content || "No response";
    }

    /* ✅ USAGE ANALYTICS — THIS FIXES YOUR WARNING */
    if (userId) {
      await trackUserUsage(userId);
    }

    return NextResponse.json({
      allowed: true,
      aiResponse,
      model: parentModel,
    });
  } catch (err) {
    console.error("❌ AI API ERROR:", err);
    return NextResponse.json(
      {
        error: "AI request failed",
      },
      { status: 500 }
    );
  }
}
