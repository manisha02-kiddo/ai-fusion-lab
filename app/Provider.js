"use client";

import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";

import { useUser } from "@clerk/nextjs";

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";

import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { DefaultModel } from "./shared/AiModelsShared";
import { UserDetailContext } from "@/context/UserDetailContext";

function Provider({ children, ...props }) {
  const { user } = useUser();

  const [aiSelectedModels, setAiSelectedModels] = useState(DefaultModel);
  const [messages, setMessages] = useState({});
  const [userDetail, setUserDetail] = useState(null);

  // 👇 NEW: controls auto-scroll behaviour in AiMultiModels
  const [autoScroll, setAutoScroll] = useState(true);

  // --------------------------------------------------------------------
  //  1) CREATE USER IN FIRESTORE FIRST (OR LOAD EXISTING USER)
  // --------------------------------------------------------------------
  useEffect(() => {
    const createOrFetchUser = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const email = user.primaryEmailAddress.emailAddress;
      const userRef = doc(db, "users", email);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();

        setUserDetail(data);

        // Load saved selected models if available
        setAiSelectedModels(data?.selectedModelPref ?? DefaultModel);

        console.log("✅ Existing user loaded from Firestore");
      } else {
        const newUser = {
          name: user.fullName,
          email,
          createdAt: new Date(),
          plan: "Free",
          remainingMsg: 5,
          credits: 1000,
          selectedModelPref: DefaultModel,
        };

        await setDoc(userRef, newUser);

        setUserDetail(newUser);
        console.log("🆕 New user created in Firestore");
      }
    };

    if (user) createOrFetchUser();
  }, [user]);

  // --------------------------------------------------------------------
  //  2) UPDATE MODEL PREFERENCE IN FIRESTORE (ONLY AFTER USER EXISTS)
  // --------------------------------------------------------------------
  useEffect(() => {
    const saveModelPref = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;
      if (!userDetail) return; // ensure user exists first

      try {
        const email = user.primaryEmailAddress.emailAddress;
        const userRef = doc(db, "users", email);

        await updateDoc(userRef, {
          selectedModelPref: aiSelectedModels,
        });

        console.log("🔥 Model preference saved");
      } catch (error) {
        console.error("❌ Error saving model pref:", error);
      }
    };

    saveModelPref();
  }, [aiSelectedModels, userDetail]);

  // --------------------------------------------------------------------
  //  RENDER PROVIDERS
  // --------------------------------------------------------------------
  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
        <AiSelectedModelContext.Provider
          value={{
            aiSelectedModels,
            setAiSelectedModels,
            messages,
            setMessages,
            autoScroll,
            setAutoScroll, // 👈 expose to children
          }}
        >
          <SidebarProvider>
            <AppSidebar />
            <div className="w-full">
              <AppHeader />
              {children}
            </div>
          </SidebarProvider>
        </AiSelectedModelContext.Provider>
      </UserDetailContext.Provider>
    </NextThemesProvider>
  );
}

export default Provider;
