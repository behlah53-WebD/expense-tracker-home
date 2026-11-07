"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlight?: boolean;
  spotlightColor?: string;
  hoverLift?: boolean;
}

function GlassCardBase({
  children,
  className,
  spotlight = true,
  spotlightColor = "rgba(124, 92, 255, 0.14)",
  hoverLift = true,
  ...props
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!spotlight || !cardRef.current || !spotlightRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotlightRef.current.style.background = `radial-gradient(circle 240px at ${x}px ${y}px, ${spotlightColor}, transparent 80%)`;
    },
    [spotlight, spotlightColor]
  );

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "glass-card p-4 md:p-5 lg:p-6 rounded-card relative group transition-all duration-250 ease-aurora",
        hoverLift && "glass-card-hover",
        className
      )}
      {...props}
    >
      {/* Cursor Follow Spotlight Glow - direct DOM styling, 0 React re-renders */}
      {spotlight && (
        <div
          ref={spotlightRef}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 z-0 transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Card Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

export const GlassCard = React.memo(GlassCardBase);
