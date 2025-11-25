"use client";
import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import { useUser } from "@clerk/nextjs";

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"; // ✅ added updateDoc
import { db } from "@/config/FirebaseConfig";

import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { DefaultModel } from "./shared/AiModelsShared";
import { UserDetailContext } from "@/context/UserDetailContext";

function Provider({ children, ...props }) {
  const { user } = useUser();

  const [aiSelectedModels, setAiSelectedModels] = useState(DefaultModel);
  const [userDetail, setUserDetail] = useState(null);
  const [messages, setMessages] = useState({}); // ✅ safe default

  // -----------------------------
  // 1️⃣ UPDATE MODEL PREF IN FIREBASE
  // -----------------------------
  useEffect(() => {
    if (!user || !user.primaryEmailAddress) return; // ⛔ prevent crash
    if (!aiSelectedModels) return;

    updateAiModelSelectionPref();
  }, [aiSelectedModels, user]);

  const updateAiModelSelectionPref = async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return;

      const docRef = doc(db, "users", email);

      await updateDoc(docRef, {
        selectedModelPref: aiSelectedModels,
      });

      console.log("🔥 Saved model preference to Firestore");
    } catch (error) {
      console.error("❌ Error updating model pref:", error);
    }
  };

  // -----------------------------
  // 2️⃣ CREATE OR FETCH USER
  // -----------------------------
  useEffect(() => {
    const createOrFetchUser = async () => {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return;

      const userRef = doc(db, "users", email);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const info = userSnap.data();

        // load saved model if exists
        setAiSelectedModels(info?.selectedModelPref ?? DefaultModel);

        setUserDetail(info);
        console.log("✅ Existing user loaded");
      } else {
        const newUser = {
          name: user.fullName,
          email: email,
          createdAt: new Date(),
          remainingMsg: 5,
          plan: "Free",
          credits: 1000,
          selectedModelPref: DefaultModel, // 🆕 default save
        };

        await setDoc(userRef, newUser);
        setUserDetail(newUser);

        console.log("🆕 New user created");
      }
    };

    if (user) createOrFetchUser();
  }, [user]);

  // -----------------------------
  // RETURN PROVIDERS
  // -----------------------------
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
          value={{ aiSelectedModels, setAiSelectedModels, messages, setMessages }}
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
