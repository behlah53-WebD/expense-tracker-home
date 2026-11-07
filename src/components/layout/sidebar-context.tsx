"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isExpanded: boolean;
  toggleSidebar: () => void;
  setIsExpanded: (expanded: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isExpanded: true,
  toggleSidebar: () => {},
  setIsExpanded: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Default to expanded as requested
  const [isExpanded, setIsExpanded] = useState(true);

  // Load user preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("Expense Tracker_sidebar_expanded");
      if (saved !== null) {
        setIsExpanded(saved === "true");
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(prev => {
      const next = !prev;
      try {
        localStorage.setItem("Expense Tracker_sidebar_expanded", String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  return (
    <SidebarContext.Provider
      value={{ isExpanded, toggleSidebar, setIsExpanded }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
