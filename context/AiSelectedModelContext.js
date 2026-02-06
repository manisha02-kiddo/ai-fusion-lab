"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export const AiSelectedModelContext = createContext();

export const AiSelectedModelProvider = ({ children }) => {
  const defaultModels = {
    GPT: { modelId: "openai/gpt-4o-mini" },
    Gemini: { modelId: "models/gemini-2.5-flash" },
    DeepSeek: { modelId: "deepseek/deepseek-r1" },
  };

  const [aiSelectedModels, setAiSelectedModels] = useState(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("selectedModelPref");
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Unable to read selectedModelPref", e);
    }
    return defaultModels;
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined")
        localStorage.setItem("selectedModelPref", JSON.stringify(aiSelectedModels));
    } catch (e) {
      /* ignore */
    }
  }, [aiSelectedModels]);

  // messages shape: { GPT: [{role, content, loading?}, ...], Gemini: [...] }
  const [messages, setMessages] = useState({});

  // control auto-scrolling behaviour in AiMultiModels:
  // - true -> scroll to bottom when messages change (normal)
  // - false -> scroll to top once (used when loading previous chat)
  const [autoScroll, setAutoScroll] = useState(true);

  return (
    <AiSelectedModelContext.Provider
      value={{
        aiSelectedModels,
        setAiSelectedModels,
        messages,
        setMessages,
        autoScroll,
        setAutoScroll,
      }}
    >
      {children}
    </AiSelectedModelContext.Provider>
  );
};

export const useAiSelectedModel = () => {
  const ctx = useContext(AiSelectedModelContext);
  if (!ctx) throw new Error("useAiSelectedModel must be used inside provider");
  return ctx;
};
