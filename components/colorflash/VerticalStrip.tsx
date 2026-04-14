"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface VerticalStripProps {
  gradient: string;
  value: number;
  onChange: (v: number) => void;
  className?: string;
  width?: number;
}

export function VerticalStrip({ gradient, value, onChange, className, width = 44 }: VerticalStripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function clamp(clientY: number) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    onChange(Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)));
  }

  useEffect(() => {
    const up = () => { dragging.current = false; };
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn("relative flex-shrink-0 rounded-2xl cursor-pointer", className)}
      style={{ background: gradient, width, touchAction: "none" }}
      onMouseDown={e => { e.stopPropagation(); dragging.current = true; clamp(e.clientY); }}
      onMouseMove={e => { if (dragging.current) clamp(e.clientY); }}
      onTouchStart={e => { e.stopPropagation(); e.preventDefault(); dragging.current = true; clamp(e.touches[0].clientY); }}
      onTouchMove={e => { e.stopPropagation(); e.preventDefault(); if (dragging.current) clamp(e.touches[0].clientY); }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          top: `${Math.max(4, Math.min(96, value * 100))}%`,
          width: 22,
          height: 22,
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          border: "2.5px solid rgba(255,255,255,0.9)",
          background: "white",
        }}
      />
    </div>
  );
}
