"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import { AiSelectedModelProvider } from "@/context/AiSelectedModelContext";
import { UserDetailContext } from "@/context/UserDetailContext";

/* ✅ ADD THIS */
import { Toaster } from "@/components/ui/sonner";

export default function Provider({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <UserDetailContext.Provider value={{}}>
        <AiSelectedModelProvider>
          <SidebarProvider>
            {/* ✅ TOASTER MUST BE AT ROOT LEVEL */}
            <Toaster richColors position="bottom-right" />

            <div className="flex h-screen w-full overflow-hidden">
              {/* Sidebar */}
              <AppSidebar />

              {/* Main Area */}
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Header */}
                <div className="shrink-0">
                  <AppHeader />
                </div>

                {/* Page content */}
                <div className="relative flex-1 overflow-hidden">
                  {children}
                </div>
              </div>
            </div>
          </SidebarProvider>
        </AiSelectedModelProvider>
      </UserDetailContext.Provider>
    </NextThemesProvider>
  );
}
