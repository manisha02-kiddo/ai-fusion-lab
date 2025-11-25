"use client";

import AiModelList from "../shared/AiModelList";
import Image from "next/image";
import React, { useContext, useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader, Lock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";

// Markdown support
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function AiMultiModels() {
  const { aiSelectedModels, setAiSelectedModels, messages } =
    useContext(AiSelectedModelContext);

  const [aiModelList, setAiModelList] = useState(AiModelList);

  // AUTO-SCROLL refs
  const scrollRefs = useRef({});

  // Auto-scroll whenever messages update
  useEffect(() => {
    Object.keys(scrollRefs.current).forEach((parent) => {
      const box = scrollRefs.current[parent];
      if (box) {
        box.scrollTo({
          top: box.scrollHeight,
          behavior: "smooth",
        });
      }
    });
  }, [messages]);

  // Enable / disable model column
  const onToggleChange = (modelName, value) => {
    setAiModelList((prev) =>
      prev.map((m) => (m.model === modelName ? { ...m, enable: value } : m))
    );
  };

  // Select new model ID
  const onSelectValue = (parentModel, modelId) => {
    const updated = {
      ...aiSelectedModels,
      [parentModel]: { modelId },
    };
    setAiSelectedModels(updated);
  };

  return (
    <div className="flex flex-1 h-[calc(100vh-140px)] border-b">
      {aiModelList.map((model, index) => {
        const parent = model.model;
        const isPremiumUser = false;
        const showLock = model.premium && !isPremiumUser;

        return (
          <div
            key={index}
            className={`flex flex-col border-r h-full transition-all ${
              model.enable ? "flex-1 min-w-[350px]" : "w-[100px]"
            }`}
          >
            {/* Header */}
            <div className="flex w-full h-[60px] items-center justify-between p-4 border-b bg-white">
              <div className="flex items-center gap-4">
                <Image src={model.icon} alt={model.model} width={24} height={24} />

                {model.enable && (
                  <Select
                    value={aiSelectedModels?.[parent]?.modelId}
                    onValueChange={(value) => onSelectValue(parent, value)}
                    disabled={model.premium}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup className="px-3">
                        <SelectLabel className="text-sm text-gray-400">Free</SelectLabel>
                        {model.subModel
                          .filter((m) => !m.premium)
                          .map((sub, i) => (
                            <SelectItem key={i} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>

                      <SelectGroup className="px-3">
                        <SelectLabel className="text-sm text-gray-400">Premium</SelectLabel>
                        {model.subModel
                          .filter((m) => m.premium)
                          .map((sub, i) => (
                            <SelectItem key={i} value={sub.id} disabled>
                              {sub.name} <Lock className="h-4 w-4 inline-block ml-1" />
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Toggle */}
              {model.enable ? (
                <Switch checked={model.enable} onCheckedChange={(v) => onToggleChange(parent, v)} />
              ) : (
                <MessageSquare className="cursor-pointer" onClick={() => onToggleChange(parent, true)} />
              )}
            </div>

            {/* Lock View */}
            {showLock && model.enable && (
              <div className="flex items-center justify-center h-full">
                <Button variant="outline">
                  <Lock className="mr-2" /> Upgrade to Unlock
                </Button>
              </div>
            )}

            {/* Messages */}
            {!showLock && model.enable && (
              <div
                className="flex-1 p-4 overflow-y-auto space-y-3 pb-32"
                ref={(el) => (scrollRefs.current[parent] = el)}
              >
                {(messages?.[parent] || []).map((m, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {m.loading ? (
                      <div className="flex items-center gap-2">
                        <Loader className="animate-spin h-4 w-4" /> Thinking...
                      </div>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default AiMultiModels;
