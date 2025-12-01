"use client";

import React, { useEffect, useState, useContext } from "react";
import AiMultiModels from "../../_components/AiMultiModels";
import ChatInputBox from "../../_components/ChatInputBox";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { db } from "@/config/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function ChatPage({ params }) {
  const [chatId, setChatId] = useState(null);
  const { setMessages, setAutoScroll } = useContext(AiSelectedModelContext);

  // unwrap the params (Next 15 style)
  useEffect(() => {
    async function loadParams() {
      const resolved = await params;
      setChatId(resolved.chatId);
    }
    loadParams();
  }, [params]);

  // load messages from Firestore
  useEffect(() => {
    if (!chatId) return;

    async function loadChat() {
      try {
        const docRef = doc(db, "chatHistory", chatId);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();
          if (data.messages) {
            // replace current messages with this chat
            setMessages(data.messages);

            // IMPORTANT: do NOT auto-scroll on first load
            setAutoScroll(false);
          }
        }
      } catch (err) {
        console.error("❌ Error loading chat:", err);
      }
    }

    loadChat();
  }, [chatId, setMessages, setAutoScroll]);

  if (!chatId) return <div className="p-10">Loading chat…</div>;

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="flex flex-col flex-1 relative bg-white dark:bg-neutral-900">
        {/* MODEL COLUMNS */}
        <div className="w-full flex justify-center pt-4 pb-2 border-b dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <AiMultiModels />
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-4" />

        {/* INPUT */}
        <ChatInputBox />
      </div>
    </div>
  );
}
