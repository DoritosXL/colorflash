"use client";

import { ColorOrb } from "../ColorOrb";
import { CircleBtn } from "../CircleBtn";
import { ArrowRight } from "../ArrowRight";
import { GameCard } from "../GameCard";

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <GameCard>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8 py-12">
        <ColorOrb />

        <div className="text-center">
          <h1
            className="text-white leading-none tracking-tight lowercase"
            style={{ fontSize: "4.5rem", fontWeight: 900, letterSpacing: "-0.02em" }}
          >
            color<br />flash
          </h1>
          <p className="text-white/40 text-sm font-medium mt-4">
            Can you remember the exact shade?
          </p>
        </div>

        <CircleBtn onClick={onStart} size={60}>
          <ArrowRight size={20} />
        </CircleBtn>
      </div>
    </GameCard>
  );
}
