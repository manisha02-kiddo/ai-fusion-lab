"use client";

import { Button } from "@/components/ui/button";
import React, { useContext, useState, useEffect } from "react";
import { Paperclip, Mic, Send } from "lucide-react";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/config/FirebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function ChatInputBox() {
  const [userInput, setUserInput] = useState("");

  const {
    aiSelectedModels,
    messages,
    setMessages,
    setAutoScroll,
  } = useContext(AiSelectedModelContext);

  const { user } = useUser();
  const params = useSearchParams();

  const [chatId, setChatId] = useState("");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Detect existing chat or create new (client-only)
  useEffect(() => {
    const existing = params.get("chatId");
    if (existing) {
      setChatId(existing);
    } else {
      setChatId(uuidv4());
    }
    setInitialLoadComplete(true);
  }, [params]);

  // ============================
  // SEND MESSAGE
  // ============================
  const handleSend = async () => {
    if (!userInput.trim()) return;

    const text = userInput.trim();
    setUserInput("");

    // when sending, enable auto-scroll again
    setAutoScroll(true);

    // add user message to all enabled models
    setMessages((prev) => {
      const updated = { ...prev };
      Object.keys(aiSelectedModels).forEach((m) => {
        updated[m] = [...(updated[m] || []), { role: "user", content: text }];
      });
      return updated;
    });

    for (const [parentModel, modelInfo] of Object.entries(aiSelectedModels)) {
      const modelId = modelInfo.modelId;

      // add "thinking..." bubble
      setMessages((prev) => ({
        ...prev,
        [parentModel]: [
          ...(prev[parentModel] || []),
          { role: "assistant", content: "Thinking...", loading: true },
        ],
      }));

      try {
        const res = await axios.post("/api/ai-multi-model", {
          model: modelId,
          parentModel,
          messages: [{ role: "user", content: text }],
        });

        const reply = res.data?.aiResponse || "⚠️ No response";

        setMessages((prev) => {
          const updated = [...prev[parentModel]];
          updated.pop();
          updated.push({ role: "assistant", content: reply });
          return { ...prev, [parentModel]: updated };
        });
      } catch (err) {
        setMessages((prev) => {
          const updated = [...prev[parentModel]];
          updated.pop();
          updated.push({
            role: "assistant",
            content: "⚠️ Error fetching response",
          });
          return { ...prev, [parentModel]: updated };
        });
      }
    }
  };

  // ============================
  // SAVE TO FIRESTORE
  // ============================
  useEffect(() => {
    if (!initialLoadComplete) return;
    if (!chatId || !messages) return;

    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;

    setDoc(
      doc(db, "chatHistory", chatId),
      {
        chatId,
        userEmail: email,
        messages,
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }, [messages, chatId, initialLoadComplete, user]);

  // ============================
  // UI
  // ============================
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-6 z-50 bg-transparent">
      <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-2xl shadow-md px-4 py-3">
        <div className="w-full flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Paperclip className="text-black dark:text-white" />
          </Button>

          <input
            type="text"
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent text-black dark:text-white outline-none placeholder-gray-500 dark:placeholder-gray-400"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <Button variant="ghost" size="icon">
            <Mic className="text-black dark:text-white" />
          </Button>

          <Button
            onClick={handleSend}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
