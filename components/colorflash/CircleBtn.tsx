"use client";

import { ArrowRight } from "./ArrowRight";

interface CircleBtnProps {
  onClick: () => void;
  size?: number;
  children?: React.ReactNode;
}

export function CircleBtn({ onClick, size = 56, children }: CircleBtnProps) {
  return (
    <button
      onClick={onClick}
      style={{ width: size, height: size, flexShrink: 0 }}
      className="rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
    >
      {children ?? <ArrowRight />}
    </button>
  );
}
