"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { SidebarProvider , SidebarTrigger} from '@/components/ui/sidebar';
import { AppSidebar} from './_components/AppSidebar';



export default function Provider({ children, ...props}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SidebarProvider>
        <AppSidebar/>
        <SidebarTrigger/>
       <div>{children}</div> 
      </SidebarProvider>
      
    </ThemeProvider>
  );
}
