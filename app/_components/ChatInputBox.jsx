"use client";

import { Button } from "@/components/ui/button";
import React, { useContext, useState, useEffect } from "react";
import { Paperclip, Mic, Send } from "lucide-react";
import AiMultiModels from "./AiMultiModels";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// ✅ Firestore
import { db } from "@/config/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

function ChatInputBox() {
  const [userInput, setUserInput] = useState("");
  const { aiSelectedModels, messages, setMessages } = useContext(AiSelectedModelContext);

  const [chatId, setChatId] = useState("");

  // Create unique chat ID only once
  useEffect(() => {
    setChatId(uuidv4());
  }, []);

  // ============================
  //     SEND MESSAGE FUNCTION
  // ============================
  const handleSend = async () => {
    if (!userInput.trim()) return;

    const userMessage = userInput.trim();
    setUserInput("");

    // Push user message to all models
    setMessages((prev) => {
      const updated = { ...prev };
      Object.keys(aiSelectedModels).forEach((parent) => {
        updated[parent] = [
          ...(updated[parent] || []),
          { role: "user", content: userMessage },
        ];
      });
      return updated;
    });

    // Send to backend for each model
    for (const [parentModel, modelInfo] of Object.entries(aiSelectedModels)) {
      const modelId = modelInfo?.modelId;

      // Add loading bubble
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
          messages: [{ role: "user", content: userMessage }],
        });

        const reply = res.data?.aiResponse || "⚠️ No response";

        // Replace loading with final response
        setMessages((prev) => {
          const old = prev[parentModel];
          const cleaned = [...old];
          cleaned.pop(); // remove loading
          cleaned.push({ role: "assistant", content: reply });
          return { ...prev, [parentModel]: cleaned };
        });
      } catch (err) {
        const details =
          err.response?.data?.details ||
          err.response?.data ||
          err.message;

        setMessages((prev) => {
          const old = prev[parentModel];
          const cleaned = [...old];
          cleaned.pop();
          cleaned.push({
            role: "assistant",
            content: `⚠️ Error: ${String(details).slice(0, 200)}`,
          });
          return { ...prev, [parentModel]: cleaned };
        });
      }
    }
  };

  // ============================
  //      AUTO SAVE MESSAGES
  // ============================
  useEffect(() => {
    if (!chatId || !messages) return;
    saveMessages();
  }, [messages]);

  const saveMessages = async () => {
    const docRef = doc(db, "chatHistory", chatId);

    await setDoc(docRef, {
      chatId: chatId,
      messages: messages,
      createdAt: new Date(),
    });
  };

  // ============================
  //          UI
  // ============================
  return (
    <div className="relative min-h-screen">
      <AiMultiModels />

      {/* Input Box */}
      <div className="fixed bottom-0 left-0 w-full flex justify-center px-4 pb-4 z-50">
        <div className="w-full border rounded-xl shadow-md max-w-2xl p-4 bg-white">
          <input
            type="text"
            placeholder="Ask me anything..."
            className="w-full bg-transparent outline-none"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <div className="mt-3 flex justify-between items-center">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-5 w-5" />
            </Button>

            <div className="flex gap-5">
              <Button variant="ghost" size="icon">
                <Mic />
              </Button>

              <Button
                onClick={handleSend}
                size="icon"
                className="bg-blue-600 text-white"
              >
                <Send />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInputBox;
