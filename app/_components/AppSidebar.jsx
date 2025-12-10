"use client";
import { useRef } from "react"

import { useEffect, useState, useContext } from "react";
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
import axios from "axios";

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
import UsageCreditProgress from "./UsageCreditProgress";

export function AppSidebar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const { user } = useUser();
  const [chatHistory, setChatHistory] = useState([]);
  const [freeMsgCount, setFreeMsgCount] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const { setMessages } = useContext(AiSelectedModelContext);
  

  /* ✅ LOAD CHAT HISTORY */
  useEffect(() => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    const email = user.primaryEmailAddress.emailAddress;
    const q = query(
      collection(db, "chatHistory"),
      where("userEmail", "==", email)
    );

    const unsub = onSnapshot(q, (snap) => {
      const chats = [];
      snap.forEach((docItem) => chats.push(docItem.data()));

      chats.sort(
        (a, b) =>
          (b.lastUpdated?.seconds || 0) -
          (a.lastUpdated?.seconds || 0)
      );

      setChatHistory(chats);
    });

    return () => unsub();
  }, [user]);

  /* ✅ LOAD REMAINING TOKENS (Arcjet synced) */
  useEffect(() => {
    if (!user) return;

    const fetchTokens = async () => {
      try {
        const res = await axios.post("/api/user-remaining-msg");
        setFreeMsgCount(res?.data?.remainingToken ?? 0);
      } catch (err) {
        console.error("Error fetching tokens:", err);
      }
    };

    fetchTokens();

    // refresh every 30s so sidebar stays accurate
    const id = setInterval(fetchTokens, 30000);
    return () => clearInterval(id);
  }, [user]);

  const activeChatId = pathname?.startsWith("/chat/")
    ? pathname.split("/").pop()
    : null;

  /* ✅ Scroll active chat into view */
  useEffect(() => {
    if (!activeChatId) return;
    const el = document.getElementById(`chat-item-${activeChatId}`);
    if (el && listRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeChatId, chatHistory]);

  useEffect(() => setMounted(true), []);

  const handleNewChat = () => {
    const newId = uuidv4();
    setMessages({});
    router.push(`/chat/${newId}`);
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, "chatHistory", chatId));
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  /* ✅ ChatGPT-style title */
  const getSummary = (chat) => {
    const title = chat.title || "New Chat";
    const date =
      chat.lastUpdated?.toDate?.() ||
      chat.createdAt?.toDate?.() ||
      new Date();

    return {
      title,
      date: moment(date).fromNow(),
    };
  };
  const listRef = useRef(null)


  return (
    <Sidebar className="flex flex-col min-h-screen">
      <SidebarHeader>
        <div className="p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="logo" width={40} height={40} />
              <h2 className="font-bold text-xl">AI Fusion</h2>
            </div>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <Sun /> : <Moon />}
              </Button>
            )}
          </div>

          <Button className="mt-7 w-full" size="lg" onClick={handleNewChat}>
            + New Chat
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
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
                  className={`w-full text-left px-3 py-2 rounded-md mb-1 flex justify-between gap-2
                    hover:bg-gray-200 dark:hover:bg-neutral-800
                    ${isActive ? "bg-gray-200 dark:bg-neutral-700" : ""}
                  `}
                >
                  <div className="flex-1">
                    <p className="font-medium truncate">{title}</p>
                    <p className="text-xs text-gray-500">{date}</p>
                  </div>
                  <X
                    className="w-4 h-4 text-gray-400 hover:text-red-500"
                    onClick={(e) => handleDeleteChat(e, chat.chatId)}
                  />
                </button>
              );
            })}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto">
        <div className="p-3 mb-6">
          <UsageCreditProgress remainingToken={freeMsgCount} />

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
