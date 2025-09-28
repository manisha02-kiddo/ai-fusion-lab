"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"

export function AppSidebar() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Sidebar className={isDark ? "bg-[#181820] text-white" : "bg-white text-[#181820] border-r border-gray-200"}>
      <SidebarHeader />
      <div className="flex items-center gap-3 px-4 py-6">
        <img src={'/logo.svg'} alt="logo" width={40} height={40} className="w-[40px] h-[40px]" />
        <h2 className={isDark ? "font-bold text-xl text-white" : "font-bold text-xl text-[#181820]"}>
          AI Fusion
        </h2>
        <button onClick={toggleTheme} className="ml-auto">
          {isDark ? <Sun className="text-yellow-300" /> : <Moon className="text-blue-600" />}
        </button>
      </div>
      <button className={isDark 
        ? "w-[90%] ml-auto mr-auto my-5 py-2 rounded bg-[#25232e] hover:bg-[#34324c] transition text-white"
        : "w-[90%] ml-auto mr-auto my-5 py-2 rounded bg-gray-100 hover:bg-gray-200 transition text-[#181820]"
      }>+ New Chat</button>
      <SidebarContent>
        <SidebarGroup>
            <div className={'p-3'}>
                <h2 className="font-bold text-lg">Chat</h2>
            <p className="text-sm text-gray-400"  >Sign in to Start Chatting With Multiple Ai Model </p>
            </div>
            
        </SidebarGroup>
        
        
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-10 p-5 mb-4">
           <button className={isDark 
        ? "w-[110%] ml-auto mr-auto my-5 py-2 rounded bg-[#25232e] hover:bg-[#34324c] transition text-white"
        : "w-[110%] ml-auto mr-auto my-5 py-2 rounded bg-gray-100 hover:bg-gray-200 transition text-[#181820]"
      }>Sign-In/Sign-Up</button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
