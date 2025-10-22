"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";

export default function AppHeader() {
  const { toggleSidebar } = useSidebar();
  const { theme, setTheme } = useTheme();

  return (
    <div className='p-3 w-full shadow flex justify-between items-center'>
      <SidebarTrigger/>
      <button>Sign In</button>
    </div>
  );
}
