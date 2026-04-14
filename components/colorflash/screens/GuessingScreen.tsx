"use client";

import { GameCard } from "../GameCard";
import { VerticalStrip } from "../VerticalStrip";
import { CircleBtn } from "../CircleBtn";
import { rgbStr, rgbToHex, rgbToHsl, brightness, hslToRgb } from "../utils";
import { TOTAL_ROUNDS, PICKER_SAT, yToHue, yToLight } from "../constants";

interface GuessingScreenProps {
  hueY: number;
  setHueY: (v: number) => void;
  lightY: number;
  setLightY: (v: number) => void;
  roundIndex: number;
  onLockIn: () => void;
}

const HUE_GRADIENT =
  "linear-gradient(to bottom," +
  "hsl(0,100%,50%),hsl(30,100%,50%),hsl(60,100%,50%),hsl(90,100%,50%)," +
  "hsl(120,100%,50%),hsl(150,100%,50%),hsl(180,100%,50%),hsl(210,100%,50%)," +
  "hsl(240,100%,50%),hsl(270,100%,50%),hsl(300,100%,50%),hsl(330,100%,50%),hsl(360,100%,50%))";

export function GuessingScreen({
  hueY,
  setHueY,
  lightY,
  setLightY,
  roundIndex,
  onLockIn,
}: GuessingScreenProps) {
  const curHue = yToHue(hueY);
  const lightGrad = `linear-gradient(to bottom,#ffffff,hsl(${curHue},100%,50%),#000000)`;
  const guessRgb = hslToRgb(curHue, PICKER_SAT, yToLight(lightY));
  const hex = rgbToHex(guessRgb).toUpperCase();
  const { h, s, l } = rgbToHsl(guessRgb);
  const previewBright = brightness(guessRgb);
  const labelCol = previewBright > 140 ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.45)";

  return (
    <GameCard>
      <div className="flex flex-1 gap-3 p-4">
        <VerticalStrip gradient={HUE_GRADIENT} value={hueY} onChange={setHueY} />
        <VerticalStrip gradient={lightGrad} value={lightY} onChange={setLightY} />

        {/* Color preview */}
        <div
          className="relative flex-1 flex flex-col justify-between p-5 rounded-2xl"
          style={{ background: rgbStr(guessRgb) }}
        >
          {/* Top info */}
          <div className="flex flex-col gap-1">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: labelCol }}
            >
              Round {roundIndex + 1} / {TOTAL_ROUNDS}
            </span>
            <p
              className="font-mono text-base font-bold"
              style={{ color: labelCol }}
            >
              {hex}
            </p>
            <p
              className="font-mono text-xs"
              style={{ color: labelCol }}
            >
              H{h} S{s} L{l}
            </p>
          </div>

          {/* Lock In */}
          <div className="flex justify-end">
            <CircleBtn onClick={onLockIn} />
          </div>
        </div>
      </div>
    </GameCard>
  );
}
