"use client";

import { Button } from "@/components/ui/button";
import React, { useContext, useState } from "react";
import { Paperclip, Mic, Send } from "lucide-react";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import axios from "axios";
import { toast } from "sonner";

import { db } from "@/config/FirebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ChatInputBox({ chatId }) {
  const [userInput, setUserInput] = useState("");
  const { aiSelectedModels, setMessages, setAutoScroll, messages } =
    useContext(AiSelectedModelContext);

  const handleSend = async () => {
    if (!userInput.trim() || !chatId) return;

    const text = userInput.trim();

    /* ✅ CHECK DAILY LIMIT FIRST */
    const tokenRes = await axios.post("/api/user-remaining-msg", { token: 1 });

    if (!tokenRes.data?.allowed) {
      toast.error("🚫 Daily free limit reached", {
        description: "Upgrade to continue chatting.",
      });
      return; // ❌ stop completely
    }

    setUserInput("");
    setAutoScroll(true);

    /* ✅ ADD USER MESSAGE (UI) */
    setMessages((prev) => {
      const updated = { ...prev };
      Object.keys(aiSelectedModels).forEach((m) => {
        updated[m] = [...(updated[m] || []), { role: "user", content: text }];
      });
      return updated;
    });

    const chatRef = doc(db, "chatHistory", chatId);
    const snap = await getDoc(chatRef);

    /* ✅ CREATE CHAT DOC IF NOT EXISTS */
    if (!snap.exists()) {
      await setDoc(chatRef, {
        chatId,
        title: text.length > 40 ? text.slice(0, 40) + "…" : text,
        userEmail: "", // optional
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        messages: {},
      });
    }

    /* ✅ SET TITLE ONLY ON FIRST MESSAGE */
    if (snap.exists() && !snap.data().title) {
      await updateDoc(chatRef, {
        title: text.length > 40 ? text.slice(0, 40) + "…" : text,
      });
    }

    /* ✅ AI CALLS */
    for (const [parentModel, modelInfo] of Object.entries(aiSelectedModels)) {
      if (!modelInfo?.enabled || !modelInfo?.modelId) continue;

      setMessages((prev) => ({
        ...prev,
        [parentModel]: [
          ...(prev[parentModel] || []),
          { role: "assistant", content: "Thinking…", loading: true },
        ],
      }));

      try {
        const res = await axios.post("/api/ai-multi-model", {
          model: modelInfo.modelId,
          parentModel,
          messages: [{ role: "user", content: text }],
        });

        setMessages((prev) => {
          const updated = [...(prev[parentModel] || [])];
          if (updated.at(-1)?.loading) updated.pop();
          updated.push({ role: "assistant", content: res.data.aiResponse });
          return { ...prev, [parentModel]: updated };
        });
      } catch {
        setMessages((prev) => {
          const updated = [...(prev[parentModel] || [])];
          if (updated.at(-1)?.loading) updated.pop();
          updated.push({
            role: "assistant",
            content: "⚠️ Error fetching response",
          });
          return { ...prev, [parentModel]: updated };
        });
      }
    }

    /* ✅ SAVE FINAL MESSAGES TO FIRESTORE (🔥 FIX) */
    await updateDoc(chatRef, {
      messages,
      lastUpdated: serverTimestamp(),
    });
  };

  return (
    <div className="fixed bottom-4 z-50 left-1/2 -translate-x-1/2 w-full px-4">
      <div className="mx-auto w-full max-w-3xl bg-white dark:bg-neutral-900 border rounded-2xl shadow-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Paperclip />
          </Button>

          <input
            type="text"
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent outline-none"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <Button variant="ghost" size="icon">
            <Mic />
          </Button>

          <Button onClick={handleSend} className="bg-blue-600 text-white">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
