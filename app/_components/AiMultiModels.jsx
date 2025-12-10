"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
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
import {
  Loader,
  Lock,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AiModelList from "../shared/AiModelList";

const COLUMN_WIDTH = 420;
const GAP = 24;
const STEP = COLUMN_WIDTH + GAP;

export default function AiMultiModels() {
  const { aiSelectedModels, setAiSelectedModels, messages, autoScroll } =
    useContext(AiSelectedModelContext);

  const scrollRefs = useRef({});
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);

  const maxIndex = Math.max(0, AiModelList.length - 1);

  /* ✅ hydration safe */
  useEffect(() => setMounted(true), []);

  /* ✅ auto scroll messages */
  useEffect(() => {
    if (!autoScroll) return;
    Object.values(scrollRefs.current).forEach(
      (el) => el && el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    );
  }, [messages, autoScroll]);

  const isPremiumModel = (model) =>
    model.subModel.every((m) => m.premium);

  const toggleModel = (parent, value) => {
    setAiSelectedModels((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], enabled: value },
    }));
  };

  if (!mounted) {
    return (
      <div className="h-[40vh] flex items-center justify-center text-gray-400">
        Loading models…
      </div>
    );
  }

  return (
    /* ✅ FIXED HEIGHT → enables vertical scroll */
    <div className="relative w-full h-[calc(100vh-180px)] overflow-hidden">
      
      {/* ✅ HORIZONTAL VIEWPORT */}
      <div className="h-full overflow-hidden">
        <div
          className="flex gap-6 px-4 h-full min-w-max transition-transform duration-300"
          style={{ transform: `translateX(-${index * STEP}px)` }}
        >
          {AiModelList.map((model) => {
            const parent = model.model;
            const enabled = aiSelectedModels?.[parent]?.enabled ?? false;
            const isPremium = isPremiumModel(model);

            return (
              <div
                key={parent}
                className={`
                  flex flex-col h-full
                  border rounded-xl
                  bg-white dark:bg-neutral-900 dark:border-neutral-800
                  flex-shrink-0
                  ${enabled ? "w-[420px]" : "w-[120px]"}
                `}
              >
                {/* HEADER (fixed) */}
                <div className="flex items-center justify-between p-4 border-b shrink-0">
                  <div className="flex items-center gap-3">
                    <Image src={model.icon} alt={parent} width={22} height={22} />
                    {enabled && !isPremium && (
                      <Select value={aiSelectedModels?.[parent]?.modelId}>
                        <SelectTrigger className="w-36">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Free</SelectLabel>
                            {model.subModel
                              .filter((m) => !m.premium)
                              .map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Premium</SelectLabel>
                            {model.subModel
                              .filter((m) => m.premium)
                              .map((s) => (
                                <SelectItem key={s.id} value={s.id} disabled>
                                  🔒 {s.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {enabled ? (
                    <Switch
                      checked
                      onCheckedChange={(v) => toggleModel(parent, v)}
                    />
                  ) : (
                    <MessageSquare
                      className="cursor-pointer text-gray-500 hover:text-black"
                      onClick={() => toggleModel(parent, true)}
                    />
                  )}
                </div>

                {/* BODY */}
                {enabled && (
                  <>
                    {isPremium ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                        <Lock className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="font-semibold">Upgrade to unlock</p>
                        <p className="text-sm text-gray-500 mb-4">
                          This model is available on premium plans.
                        </p>
                        <Button>Upgrade Plan</Button>
                      </div>
                    ) : (
                      /* ✅ THIS NOW SCROLLS */
                      <div
                        ref={(el) => (scrollRefs.current[parent] = el)}
                        className="
                          flex-1 overflow-y-auto
                          overscroll-contain
                          px-4 py-3 space-y-4
                        "
                      >
                        {(messages?.[parent] || []).map((m, i) => (
                          <div
                            key={i}
                            className={`rounded-xl px-4 py-3 text-sm max-w-[90%] ${
                              m.role === "user"
                                ? "ml-auto bg-blue-600 text-white"
                                : "bg-gray-100 dark:bg-neutral-800"
                            }`}
                          >
                            {m.loading ? (
                              <Loader className="animate-spin w-4 h-4" />
                            ) : (
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {m.content}
                              </ReactMarkdown>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ HORIZONTAL SCROLL ARROWS */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex gap-4 z-40">
        <Button
          size="icon"
          variant="outline"
          disabled={index === 0}
          onClick={() => setIndex((p) => Math.max(p - 1, 0))}
        >
          <ChevronLeft />
        </Button>
        <Button
          size="icon"
          variant="outline"
          disabled={index === maxIndex}
          onClick={() => setIndex((p) => Math.min(p + 1, maxIndex))}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
