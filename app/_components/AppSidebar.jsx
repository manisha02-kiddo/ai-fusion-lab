"use client";

import React, { useEffect, useState, useRef, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { useUser } from "@clerk/nextjs";
import { Moon, Sun, User2, Zap, X } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

import { db } from "@/config/FirebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import moment from "moment";
import { useRouter, usePathname } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { user } = useUser();
  const [chatHistory, setChatHistory] = useState([]);

  const router = useRouter();
  const pathname = usePathname();

  const { setMessages, setAutoScroll } = useContext(AiSelectedModelContext);

  const listRef = useRef(null);

  // ----------------------------------------
  // 1) REAL-TIME CHAT HISTORY (no refresh)
  // ----------------------------------------
  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const email = user.primaryEmailAddress.emailAddress;

    const q = query(
      collection(db, "chatHistory"),
      where("userEmail", "==", email)
    );

    const unsub = onSnapshot(q, (snap) => {
      const raw = [];
      snap.forEach((docItem) => raw.push(docItem.data()));

      // 6) PREVENT DUPLICATES: keep first by last user message
      const seen = new Set();
      const unique = [];

      raw.forEach((chat) => {
        const all = Object.values(chat.messages || {}).flat();
        const userMsgs = all.filter((m) => m.role === "user");
        const lastText =
          userMsgs[userMsgs.length - 1]?.content?.trim().toLowerCase() || "";

        const key = lastText || chat.chatId;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(chat);
        }
      });

      // Sort by lastUpdated desc
      unique.sort(
        (a, b) =>
          (b.lastUpdated?.seconds || 0) - (a.lastUpdated?.seconds || 0)
      );

      setChatHistory(unique);
    });

    return () => unsub();
  }, [user]);

  // ----------------------------------------
  // HELPERS
  // ----------------------------------------
  const getSummary = (chat) => {
    const all = Object.values(chat.messages || {}).flat();
    const userMsgs = all.filter((m) => m.role === "user");
    const last = userMsgs[userMsgs.length - 1]?.content || "No messages";

    const trimmed = last.length > 35 ? last.slice(0, 35) + "..." : last;

    const date =
      chat.lastUpdated?.toDate?.() ||
      chat.createdAt?.toDate?.() ||
      new Date();

    return { title: trimmed, date: moment(date).fromNow() };
  };

  // Currently active chatId (from URL)
  const activeChatId = pathname?.startsWith("/chat/")
    ? pathname.split("/").pop()
    : null;

  // 2) AUTO-SCROLL SIDEBAR TO ACTIVE CHAT
  useEffect(() => {
    if (!activeChatId) return;

    const el =
      typeof document !== "undefined"
        ? document.getElementById(`chat-item-${activeChatId}`)
        : null;

    if (el && listRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeChatId, chatHistory]);

  useEffect(() => setMounted(true), []);

  // ----------------------------------------
  // 3) NEW CHAT BEHAVIOUR
  // ----------------------------------------
  const handleNewChat = () => {
    const newId = uuidv4();

    // fresh context
    setMessages({});
    setAutoScroll(true);

    router.push(`/chat/${newId}`);
  };

  // 5) DELETE CHAT
  const handleDeleteChat = async (e, chatId) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await deleteDoc(doc(db, "chatHistory", chatId));
    } catch (err) {
      console.error("❌ Error deleting chat:", err);
    }
  };

  return (
    <Sidebar>
      {/* HEADER */}
      <SidebarHeader>
        <div className="p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="logo" width={40} height={40} />
              <h2 className="font-bold text-xl">AI Fusion</h2>
            </div>

            <div>
              {mounted && theme === "light" ? (
                <Button variant="ghost" size="icon" onClick={() => setTheme("dark")}>
                  <Sun />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setTheme("light")}>
                  <Moon />
                </Button>
              )}
            </div>
          </div>

          <Button className="mt-7 w-full" size="lg" onClick={handleNewChat}>
            + New Chat
          </Button>
        </div>
      </SidebarHeader>

      {/* CHAT LIST */}
      <SidebarContent>
        <SidebarGroup>
          <div className="p-3" ref={listRef}>
            <h2 className="font-bold text-lg mb-2">Chat</h2>

            {chatHistory.map((chat) => {
              const { title, date } = getSummary(chat);
              const isActive = chat.chatId === activeChatId;

              return (
                <button
                  key={chat.chatId}
                  id={`chat-item-${chat.chatId}`}
                  onClick={() => router.push(`/chat/${chat.chatId}`)}
                  className={`w-full text-left px-3 py-2 rounded-md mb-1 flex items-start justify-between gap-2 
                    hover:bg-gray-200 dark:hover:bg-neutral-800
                    ${
                      isActive
                        ? "bg-gray-200 dark:bg-neutral-700"
                        : "bg-transparent"
                    }`}
                >
                  <div className="flex-1">
                    <p className="font-medium truncate">{title}</p>
                    <p className="text-xs text-gray-500">{date}</p>
                  </div>

                  {/* delete icon */}
                  <X
                    className="w-3 h-3 text-gray-400 hover:text-red-500 mt-1"
                    onClick={(e) => handleDeleteChat(e, chat.chatId)}
                  />
                </button>
              );
            })}
          </div>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <div className="p-3 mb-10">
          <Button className="w-full mb-3">
            <Zap /> Upgrade Plan
          </Button>

          <Button className="flex w-full" variant="ghost">
            <User2 /> <span className="ml-2">Settings</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
