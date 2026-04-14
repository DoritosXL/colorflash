import { cn } from "@/lib/utils";
import { CARD_BG } from "./constants";

interface GameCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function GameCard({ children, style, className }: GameCardProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col flex-1 sm:flex-none overflow-hidden sm:rounded-3xl sm:max-w-[440px]",
        className
      )}
      style={{ background: CARD_BG, ...style }}
    >
      {children}
    </div>
  );
}
