"use client";

import { createContext, useContext, useState, useEffect } from "react";

export const AiSelectedModelContext = createContext();

export const AiSelectedModelProvider = ({ children }) => {
  const defaultModels = {
    GPT: { modelId: "openai/gpt-4o-mini" },
    Gemini: { modelId: "models/gemini-2.5-flash" },



    DeepSeek: { modelId: "deepseek/deepseek-r1" },
  };

  const [aiSelectedModels, setAiSelectedModels] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedModelPref");
      if (saved) return JSON.parse(saved);
    }
    return defaultModels;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedModelPref", JSON.stringify(aiSelectedModels));
    }
  }, [aiSelectedModels]);

  const [messages, setMessages] = useState({});

  return (
    <AiSelectedModelContext.Provider
      value={{ aiSelectedModels, setAiSelectedModels, messages, setMessages }}
    >
      {children}
    </AiSelectedModelContext.Provider>
  );
};

export const useAiSelectedModel = () => {
  const ctx = useContext(AiSelectedModelContext);
  if (!ctx) throw new Error("useAiSelectedModel must be inside provider");
  return ctx;
};
