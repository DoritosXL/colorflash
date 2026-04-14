"use client";

import { GameCard } from "../GameCard";
import { CircleBtn } from "../CircleBtn";
import { rgbStr, scoreLabel, scoreEmoji, scoreBarColor } from "../utils";
import { TOTAL_ROUNDS } from "../constants";
import type { RoundData } from "../types";

interface FinalScreenProps {
  rounds: RoundData[];
  onPlayAgain: () => void;
  onShare: () => void;
}

export function FinalScreen({ rounds, onPlayAgain, onShare }: FinalScreenProps) {
  const scores = rounds.map(r => r.score ?? 0);
  const total = scores.reduce((a, b) => a + b, 0);
  const max = TOTAL_ROUNDS * 100;

  return (
    <GameCard>
      <div className="flex flex-1 flex-col gap-8 p-7">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <p className="text-white/30 text-xs font-semibold uppercase tracking-widest">
            Final Score
          </p>
          <div className="flex items-baseline gap-3">
            <span style={{ fontSize: "5rem", fontWeight: 900, lineHeight: 1, color: "white" }}>
              {total}
            </span>
            <span className="text-white/30 text-lg">/ {max}</span>
          </div>
          <p className="text-white/50 text-sm font-medium">
            {scoreLabel(total, max)}
          </p>
        </div>

        {/* Per-round breakdown */}
        <div className="flex flex-col gap-3">
          <p className="text-white/25 text-xs font-semibold uppercase tracking-widest mb-1">
            Breakdown
          </p>
          {rounds.map((r, i) => {
            const s = r.score ?? 0;
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-white/25 text-xs w-14 shrink-0 font-medium">
                  Round {i + 1}
                </span>
                <div
                  className="flex-1 h-1.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s}%`, background: scoreBarColor(s) }}
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.guess && (
                    <div
                      className="w-3.5 h-3.5 rounded-sm border border-white/10"
                      style={{ background: rgbStr(r.guess) }}
                    />
                  )}
                  <span className="text-white text-xs font-bold w-8 text-right">{s}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <button
            onClick={onPlayAgain}
            className="text-white/35 text-sm font-medium hover:text-white/60 transition-colors cursor-pointer"
          >
            Play again
          </button>
          <CircleBtn onClick={onShare}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="14" cy="3" r="1.5" />
              <circle cx="14" cy="15" r="1.5" />
              <circle cx="4" cy="9" r="1.5" />
              <path d="M5.5 8.1l7-4.2M5.5 9.9l7 4.2" />
            </svg>
          </CircleBtn>
        </div>
      </div>
    </GameCard>
  );
}
