"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeftIcon } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/* -------------------------------------------------------------- */
/* CONSTANTS */
/* -------------------------------------------------------------- */

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";

/* -------------------------------------------------------------- */
/* CONTEXT */
/* -------------------------------------------------------------- */

const SidebarContext = React.createContext(null);

function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside provider");
  return ctx;
}

/* -------------------------------------------------------------- */
/* PROVIDER */
/* -------------------------------------------------------------- */

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);

  const open = openProp ?? _open;

  const setOpen = (v) => {
    const next = typeof v === "function" ? v(open) : v;
    if (setOpenProp) setOpenProp(next);
    else _setOpen(next);

    document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  };

  const toggleSidebar = () => {
    return isMobile ? setOpenMobile((v) => !v) : setOpen((v) => !v);
  };

  React.useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const state = open ? "expanded" : "collapsed";

  return (
    <SidebarContext.Provider
      value={{
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }}
    >
      <div
        data-slot="sidebar-wrapper"
        className={cn(
          "group/sidebar-wrapper flex h-screen w-screen overflow-hidden",
          className
        )}
        style={{
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

/* -------------------------------------------------------------- */
/* SIDEBAR */
/* -------------------------------------------------------------- */

function Sidebar({
  side = "left",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}) {
  const { isMobile, openMobile, setOpenMobile, state } = useSidebar();

  if (isMobile) {
    return (
      <div className="fixed inset-y-0 left-0 z-20">
        {openMobile && (
          <div
            className="bg-sidebar text-sidebar-foreground h-screen w-[18rem] shadow-xl p-0"
            {...props}
          >
            <div className="h-full flex flex-col">{children}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      data-slot="sidebar"
      data-state={state}
      data-side={side}
      className={cn("peer hidden md:block text-sidebar-foreground", className)}
    >
      <div
        data-slot="sidebar-gap"
        className={cn(
          "transition-all duration-200 ease-linear bg-transparent",
          "w-(--sidebar-width)",
          state === "collapsed" && collapsible === "offcanvas" && "w-0"
        )}
      />

      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 h-screen hidden md:flex transition-all duration-200 ease-linear",
          `w-(--sidebar-width)`,
          side === "left"
            ? state === "collapsed" && collapsible === "offcanvas"
              ? "left-[-16rem]"
              : "left-0"
            : state === "collapsed" && collapsible === "offcanvas"
            ? "right-[-16rem]"
            : "right-0"
        )}
      >
        <div
          data-slot="sidebar-inner"
          className="bg-sidebar border-r border-sidebar-border h-full w-full flex flex-col"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- */
/* BUTTONS + HEADERS */
/* -------------------------------------------------------------- */

function SidebarTrigger({ className, onClick, ...props }) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        onClick?.(e);
        toggleSidebar();
      }}
      className={cn("size-7", className)}
      {...props}
    >
      <PanelLeftIcon />
    </Button>
  );
}

function SidebarRail({ className, ...props }) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      className={cn(
        "absolute inset-y-0 w-4 -translate-x-1/2 hidden sm:flex",
        className
      )}
      onClick={toggleSidebar}
      {...props}
    />
  );
}

/* -------------------------------------------------------------- */
/* SIMPLE COMPONENTS (NO WARNINGS) */
/* -------------------------------------------------------------- */

function SidebarHeader(props) {
  return <div className="p-2" {...props} />;
}

function SidebarFooter(props) {
  return <div className="p-2" {...props} />;
}

function SidebarContent(props) {
  return <div className="flex flex-col gap-2 overflow-auto min-h-0" {...props} />;
}

function SidebarGroup(props) {
  return <div className="p-2 flex flex-col" {...props} />;
}

function SidebarGroupLabel({ className, ...props }) {
  return (
    <div className={cn("text-xs font-medium px-2", className)} {...props} />
  );
}

function SidebarGroupAction(props) {
  return <button className="absolute right-3 top-3" {...props} />;
}

function SidebarGroupContent(props) {
  return <div {...props} />;
}

/* -------------------------------------------------------------- */
/* MENU */
/* -------------------------------------------------------------- */

function SidebarMenu(props) {
  return <ul className="flex flex-col gap-1" {...props} />;
}

function SidebarMenuItem(props) {
  return <li {...props} />;
}

function SidebarMenuButton({ asChild = false, isActive, className, ...props }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent",
        isActive && "bg-sidebar-accent",
        className
      )}
      {...props}
    />
  );
}

function SidebarMenuAction(props) {
  return <button className="absolute right-2 top-2" {...props} />;
}

function SidebarMenuBadge(props) {
  return <span className="absolute right-2 top-2 text-xs" {...props} />;
}

function SidebarMenuSub(props) {
  return <ul className="ml-4 border-l pl-2 flex flex-col gap-1" {...props} />;
}

function SidebarMenuSubItem(props) {
  return <li {...props} />;
}

function SidebarMenuSubButton({ asChild = false, isActive, className, ...props }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent text-sm",
        isActive && "bg-sidebar-accent",
        className
      )}
      {...props}
    />
  );
}

/* -------------------------------------------------------------- */
/* SKELETON */
/* -------------------------------------------------------------- */

function SidebarMenuSkeleton({ className, showIcon = false, ...props }) {
  const width = React.useMemo(
    () => `${Math.floor(Math.random() * 40) + 50}%`,
    []
  );

  return (
    <div className={cn("flex items-center gap-2 h-8 px-2", className)} {...props}>
      {showIcon && <Skeleton className="size-4 rounded-md" />}
      <Skeleton className="h-4" style={{ maxWidth: width, width }} />
    </div>
  );
}
function SidebarInset({ className, ...props }) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn("flex-1 flex flex-col", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------- */
/* EXPORTS */
/* -------------------------------------------------------------- */

export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarRail,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,   // ✅ Now defined correctly
  useSidebar,
};
