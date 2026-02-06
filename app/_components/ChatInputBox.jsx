"use client";

import { Button } from "@/components/ui/button";
import React, { useContext, useState } from "react";
import { Paperclip, Mic, Send } from "lucide-react";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import axios from "axios";

export default function ChatInputBox({ chatId }) {
  const [userInput, setUserInput] = useState("");
  const { aiSelectedModels, setMessages } =
    useContext(AiSelectedModelContext);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const text = userInput.trim();
    setUserInput("");

    // UI: user message
    setMessages((prev) => {
      const updated = { ...prev };
      Object.keys(aiSelectedModels).forEach((m) => {
        if (!aiSelectedModels[m]?.enabled) return;
        updated[m] = [...(updated[m] || []), { role: "user", content: text }];
      });
      return updated;
    });

    for (const [parentModel, modelInfo] of Object.entries(aiSelectedModels)) {
      if (!modelInfo?.enabled || !modelInfo?.modelId) continue;

      setMessages((prev) => ({
        ...prev,
        [parentModel]: [
          ...(prev[parentModel] || []),
          { role: "assistant", content: "Thinking...", loading: true },
        ],
      }));

      try {
        const res = await axios.post(
          "/api/ai-multi-model",
          {
            parentModel,
            model: modelInfo.modelId,
            messages: [{ role: "user", content: text }],
          },
          {
            withCredentials: true, // ✅ FIX
          }
        );

        setMessages((prev) => {
          const msgs = [...prev[parentModel]];
          msgs.pop();
          msgs.push({
            role: "assistant",
            content: res.data.aiResponse,
          });
          return { ...prev, [parentModel]: msgs };
        });
      } catch (err) {
        console.error(err);
        setMessages((prev) => {
          const msgs = [...prev[parentModel]];
          msgs.pop();
          msgs.push({
            role: "assistant",
            content: "⚠️ AI request failed",
          });
          return { ...prev, [parentModel]: msgs };
        });
      }
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
      <div className="flex gap-2 border rounded-xl p-3 bg-white dark:bg-neutral-900">
        <input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask anything..."
          className="flex-1 outline-none bg-transparent"
        />
        <Button onClick={handleSend}>
          <Send />
        </Button>
      </div>
    </div>
  );
}
