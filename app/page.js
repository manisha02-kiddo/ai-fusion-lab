"use client";

import React, { useContext, useEffect } from "react";
import AiMultiModels from "./_components/AiMultiModels";
import ChatInputBox from "./_components/ChatInputBox";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";

export default function HomePage() {
  const { setMessages } = useContext(AiSelectedModelContext);

  // Fresh clean chat when opening home page "/"
  useEffect(() => {
    setMessages({});
  }, [setMessages]);

  return (
    <div className="flex w-full h-screen overflow-hidden">
      <div className="flex flex-col flex-1 relative bg-white dark:bg-neutral-900">

        {/* TOP MODEL SELECTORS */}
        <div className="w-full flex justify-center pt-4 pb-2 border-b dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <AiMultiModels />
        </div>

        {/* EMPTY MAIN AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-4" />

        {/* CHAT INPUT BOX */}
        <ChatInputBox />
      </div>
    </div>
  );
}
