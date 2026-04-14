"use client";

import { GameCard } from "../GameCard";
import { CircleBtn } from "../CircleBtn";
import { ArrowRight } from "../ArrowRight";
import { rgbStr, brightness, rgbToHsl } from "../utils";
import { TOTAL_ROUNDS } from "../constants";
import type { RGB } from "../types";

const MESSAGES = [
  "Keep practicing.",
  "Your eyes need a workout.",
  "Almost dialed in.",
  "Impressive!",
  "Basically perfect.",
];

interface ResultScreenProps {
  guess: RGB;
  target: RGB;
  score: number;
  roundIndex: number;
  isLast: boolean;
  onNext: () => void;
}

export function ResultScreen({ guess, target, score, roundIndex, isLast, onNext }: ResultScreenProps) {
  const guessHsl = rgbToHsl(guess);
  const targetHsl = rgbToHsl(target);
  const gBright = brightness(guess);
  const tBright = brightness(target);
  const gLabel = gBright > 140 ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.45)";
  const tLabel = tBright > 140 ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.45)";
  const msg = MESSAGES[Math.min(4, Math.floor(score / 20))];

  return (
    <GameCard>
      {/* Your selection */}
      <div
        className="relative flex flex-1 flex-col justify-between p-6"
        style={{ background: rgbStr(guess) }}
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: gLabel }}
            >
              Your selection
            </span>
            <p className="text-sm font-semibold" style={{ color: gLabel }}>
              H{guessHsl.h} S{guessHsl.s} L{guessHsl.l}
            </p>
          </div>

          <div className="text-right">
            <div
              style={{
                color: "rgba(255,255,255,0.95)",
                fontSize: "3.5rem",
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {score}
            </div>
            <p className="text-xs font-medium mt-1" style={{ color: gLabel }}>
              {msg}
            </p>
          </div>
        </div>
        <div />
      </div>

      {/* Original */}
      <div
        className="relative flex flex-1 flex-col justify-between p-6"
        style={{ background: rgbStr(target) }}
      >
        <div className="flex flex-col gap-1">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: tLabel }}
          >
            Original
          </span>
          <p className="text-sm font-semibold" style={{ color: tLabel }}>
            H{targetHsl.h} S{targetHsl.s} L{targetHsl.l}
          </p>
          <p className="text-xs" style={{ color: tLabel }}>
            Round {roundIndex + 1} of {TOTAL_ROUNDS}
          </p>
        </div>

        <div className="flex justify-end">
          <CircleBtn onClick={onNext}>
            {isLast
              ? <span style={{ fontSize: "0.6rem", fontWeight: 700 }}>END</span>
              : <ArrowRight />}
          </CircleBtn>
        </div>
      </div>
    </GameCard>
  );
}
