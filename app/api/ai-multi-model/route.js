import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { model, msg, parentModel } = await req.json();

    console.log("Loaded API Key:", process.env.KRAVIXSTUDIO_API_KEY);

    const response = await axios.post(
      "https://kravixstudio.com/api/v1/chat",
      {
        message: msg,
        aiModel: model,
        outputType: "text",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + process.env.KRAVIXSTUDIO_API_KEY,
        },
      }
    );

    console.log("✅ API Response:", response.data);

    return NextResponse.json({
      ...response.data,
      model: parentModel,
    });
  } catch (error) {
    console.error("❌ AI API Error:", error.response?.data || error.message);
    return NextResponse.json(
      {
        error: "Failed to connect to AI API",
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
