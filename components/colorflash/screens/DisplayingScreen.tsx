"use client";

import { GameCard } from "../GameCard";
import { rgbStr, brightness } from "../utils";
import { TOTAL_ROUNDS } from "../constants";
import type { RGB } from "../types";

interface DisplayingScreenProps {
  target: RGB;
  countdown: number;
  roundIndex: number;
}

export function DisplayingScreen({ target, countdown, roundIndex }: DisplayingScreenProps) {
  const bright = brightness(target);
  const textCol = bright > 140 ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.5)";

  return (
    <GameCard style={{ background: rgbStr(target) }}>
      <div className="flex flex-1 flex-col justify-between p-6">
        {/* Round label */}
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: textCol }}
          >
            Round
          </span>
          <p
            className="text-sm font-bold mt-0.5"
            style={{ color: textCol }}
          >
            {roundIndex + 1} / {TOTAL_ROUNDS}
          </p>
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-end gap-2">
          <div
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "7rem",
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {Math.ceil(countdown)}
          </div>
          <p
            className="text-sm font-medium"
            style={{ color: textCol }}
          >
            seconds to remember
          </p>
        </div>

        <div />
      </div>
    </GameCard>
  );
}
