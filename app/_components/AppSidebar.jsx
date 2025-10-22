"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { SignInButton, useUser} from "@clerk/nextjs"
import { Moon, Sun, User2, Zap } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import UsageCreditProgress from "./UsageCreditProgress"


export function AppSidebar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const {user}=useUser();

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
             <Image
                src="/logo.svg"
                alt="logo"
                width={60}
                height={60}
                className="w-[40px] h-[40px]"
              />
               
              
              <h2 className="font-bold text-xl">AI Fusion</h2>
            </div>

            {/* Theme Toggle Button */}
            <div>
              {mounted && theme === "light" ? (
                <Button variant="ghost" onClick={() => setTheme("dark")}>
                  <Sun />
                </Button>
              ) : mounted ? (
                <Button onClick={() => setTheme("light")}>
                  <Moon />
                </Button>
              ) : null}
            </div>
          </div>

          {/* New Chat Button */}
          
          <SignInButton>
            <Button className="mt-7 w-full" size="lg">
            + New Chat </Button>
            </SignInButton>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="p-3">
            <h2 className="font-bold text-lg">Chat</h2>
            {!user&& <p className="text-sm text-gray-400">
              Sign in to start chatting with multiple AI models
            </p>}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-3 mb-10">
          {!user? <SignInButton mode="modal">
          <Button className="w-full" size="lg">
            Sign In / Sign Up
          </Button></SignInButton>
          :
          <div>
            <UsageCreditProgress />
            <Button className={ 'w-full mb-3' }> <Zap/> Upgrade Plan</Button>
          <Button className="flex w-full " variant={'ghost'}>
            <User2 /> <h2>Settings</h2>
        </Button>
        </div>
          }
        </div>
          
      </SidebarFooter>
    </Sidebar>
  )
}