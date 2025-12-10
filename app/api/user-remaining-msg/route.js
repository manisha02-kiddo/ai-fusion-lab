import { NextResponse } from "next/server";
import { aj } from "@/config/Arcjet";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const { userId } = auth();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "guest";

    // ✅ Read remaining tokens from Arcjet
    const decision = await aj.protect(req, {
      key: userId || ip,
      requested: 0, // ✅ IMPORTANT: do NOT deduct
    });

    return NextResponse.json({
      remainingToken: decision.remaining ?? 0,
    });
  } catch (err) {
    console.error("user-remaining-msg error:", err);
    return NextResponse.json({
      remainingToken: 0,
    });
  }
}
