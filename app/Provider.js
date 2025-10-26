"use client";
import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { AiSelectedModelContext } from "@/context/AiSelectedModelContext";
import { DefaultModel } from "./shared/AiModelsShared";
import { UserDetailContext } from "@/context/UserDetailContext";

function Provider({ children, ...props }) {
  const { user } = useUser();
  const [aiSelectedModels, setAiSelectedModels] = useState(DefaultModel);
  const [userDetail, setUserDetail] = useState(null);

  // Firestore: fetch or create user
  useEffect(() => {
    const createOrFetchUser = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;

      const userRef = doc(db, "users", user.primaryEmailAddress.emailAddress);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userInfo = userSnap.data();
        setAiSelectedModels(userInfo?.selectdModelPref || DefaultModel);
        setUserDetail(userInfo);
        console.log("Existing user loaded");
      } else {
        const newUser = {
          name: user.fullName,
          email: user.primaryEmailAddress.emailAddress,
          createdAt: new Date(),
          remainingMsg: 5,
          plan: "Free",
          credits: 1000,
        };
        await setDoc(userRef, newUser);
        setUserDetail(newUser);
        console.log("New user created");
      }
    };

    if (user) createOrFetchUser();
  }, [user]);

  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
        <AiSelectedModelContext.Provider value={{ aiSelectedModels, setAiSelectedModels }}>
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
