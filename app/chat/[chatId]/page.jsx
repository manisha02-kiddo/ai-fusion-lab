"use client";

import React, { use, useContext, useEffect } from "react";
import AiMultiModels from "@/app/_components/AiMultiModels";
import ChatInputBox from "@/app/_components/ChatInputBox";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { db } from "@/config/FirebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";

export default function ChatPage({ params }) {
  const { chatId } = use(params);
  const { setMessages, setAutoScroll } =
    useContext(AiSelectedModelContext);
  const { user } = useUser();

  /* ✅ CREATE CHAT IMMEDIATELY */
  useEffect(() => {
    if (!chatId || !user?.primaryEmailAddress) return;

    const createChatIfNotExists = async () => {
      const ref = doc(db, "chatHistory", chatId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          chatId,
          userEmail: user.primaryEmailAddress.emailAddress,
          messages: {},
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp(),
        });
      }
    };

    createChatIfNotExists();
  }, [chatId, user]);

  /* ✅ LOAD MESSAGES */
  useEffect(() => {
    if (!chatId) return;

    const loadChat = async () => {
      const ref = doc(db, "chatHistory", chatId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setAutoScroll(false);
        setMessages(snap.data().messages || {});
      } else {
        setMessages({});
      }
    };

    loadChat();
  }, [chatId]);

  if (!chatId) return <div className="p-10">Loading chat…</div>;

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="flex flex-col flex-1 relative bg-white dark:bg-neutral-900 pb-28">
        <AiMultiModels />
        <ChatInputBox chatId={chatId} />
      </div>
    </div>
  );
}
