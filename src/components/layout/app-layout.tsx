"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { BottomDock } from "./bottom-dock";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { TransactionDrawer } from "@/components/forms/transaction-drawer";
import { SidebarProvider, useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const { isExpanded } = useSidebar();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-body)] flex relative overflow-x-hidden selection:bg-[var(--primary)]/30 selection:text-white">
      {/* Signature Aurora floating background blobs & grain */}
      <AuroraBackground />

      {/* Fixed Expandable / Collapsible Glass Sidebar for Desktop */}
      <Sidebar />

      {/* Main Workspace Area (Dynamically arranged according to sidebar expand / shrink) */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-[padding] duration-300 ease-aurora relative z-10",
          isExpanded ? "md:pl-64" : "md:pl-20"
        )}
      >
        <Topbar onOpenAddModal={() => setIsAddDrawerOpen(true)} />

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 md:px-6 lg:px-8 py-6 pb-[calc(112px+env(safe-area-inset-bottom,0px))] md:pb-12 max-w-[1440px] w-full mx-auto focus:outline-none transition-all duration-300"
        >
          {children}
        </main>
      </div>

      {/* Mobile Floating Glass Bottom Dock */}
      <BottomDock onOpenAddModal={() => setIsAddDrawerOpen(true)} />

      {/* Global Add / Edit Transaction Drawer */}
      <TransactionDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
      />
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
