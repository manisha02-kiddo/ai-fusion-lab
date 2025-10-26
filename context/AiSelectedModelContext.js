"use client";

import { createContext, useContext, useEffect, useState } from "react";

// ✅ Export the context itself
export const AiSelectedModelContext = createContext();

export const AiSelectedModelProvider = ({ children }) => {
  const [selectedModel, setSelectedModel] = useState(() => {
    // Load from localStorage if available
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedModel") || "gemini-2.5-flash-lite";
    }
    return "gemini-2.5-flash-lite"; // Default model
  });

  useEffect(() => {
    // Save to localStorage whenever model changes
    if (selectedModel) {
      localStorage.setItem("selectedModel", selectedModel);
    }
  }, [selectedModel]);

  return (
    <AiSelectedModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </AiSelectedModelContext.Provider>
  );
};

// ✅ Custom hook for easy usage
export const useAiSelectedModel = () => {
  const context = useContext(AiSelectedModelContext);
  if (!context) {
    throw new Error(
      "useAiSelectedModel must be used within an AiSelectedModelProvider"
    );
  }
  return context;
};
