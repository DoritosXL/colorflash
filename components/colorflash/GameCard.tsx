import { CARD_BG } from "./constants";

interface GameCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function GameCard({ children, style }: GameCardProps) {
  return (
    <div
      className="w-full flex flex-col flex-1 sm:flex-none overflow-hidden sm:rounded-3xl sm:max-w-[440px]"
      style={{ background: CARD_BG, ...style }}
    >
      {children}
    </div>
  );
}
