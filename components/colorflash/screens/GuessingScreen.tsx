"use client";

import { useRef } from "react";
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

const STRIP_WIDTH = 30;

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
  const areaRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number; hue: number; light: number } | null>(null);

  const curHue = yToHue(hueY);
  const lightGrad = `linear-gradient(to bottom,#ffffff,hsl(${curHue},100%,50%),#000000)`;
  const guessRgb = hslToRgb(curHue, PICKER_SAT, yToLight(lightY));
  const hex = rgbToHex(guessRgb).toUpperCase();
  const { h, s, l } = rgbToHsl(guessRgb);
  const bright = brightness(guessRgb);
  const labelCol = bright > 140 ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.55)";

  function inStripZone(clientX: number): boolean {
    const rect = areaRef.current?.getBoundingClientRect();
    if (!rect) return false;
    const x = clientX - rect.left;
    return x < STRIP_WIDTH || x > rect.width - STRIP_WIDTH;
  }

  function startGesture(clientX: number, clientY: number) {
    if (inStripZone(clientX)) return;
    gesture.current = { x: clientX, y: clientY, hue: hueY, light: lightY };
  }

  function moveGesture(clientX: number, clientY: number) {
    if (!gesture.current || !areaRef.current) return;
    const { width, height } = areaRef.current.getBoundingClientRect();
    const dx = clientX - gesture.current.x;
    const dy = clientY - gesture.current.y;
    setHueY(Math.max(0, Math.min(1, gesture.current.hue + dx / width)));
    setLightY(Math.max(0, Math.min(1, gesture.current.light + dy / height)));
  }

  function endGesture() {
    gesture.current = null;
  }

  return (
    <GameCard className="sm:max-w-[560px]">
      <div
        ref={areaRef}
        className="relative flex flex-1 sm:min-h-[520px]"
        style={{ background: rgbStr(guessRgb), touchAction: "none", cursor: "crosshair" }}
        onMouseDown={e => startGesture(e.clientX, e.clientY)}
        onMouseMove={e => { if (gesture.current) moveGesture(e.clientX, e.clientY); }}
        onMouseUp={endGesture}
        onMouseLeave={endGesture}
        onTouchStart={e => { e.preventDefault(); startGesture(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchMove={e => { e.preventDefault(); moveGesture(e.touches[0].clientX, e.touches[0].clientY); }}
        onTouchEnd={endGesture}
      >
        {/* Hue strip — left edge */}
        <div className="absolute inset-y-0 left-0 z-10" style={{ width: STRIP_WIDTH }}>
          <VerticalStrip
            gradient={HUE_GRADIENT}
            value={hueY}
            onChange={setHueY}
            className="h-full rounded-none"
            width={STRIP_WIDTH}
          />
        </div>

        {/* Lightness strip — right edge */}
        <div className="absolute inset-y-0 right-0 z-10" style={{ width: STRIP_WIDTH }}>
          <VerticalStrip
            gradient={lightGrad}
            value={lightY}
            onChange={setLightY}
            className="h-full rounded-none"
            width={STRIP_WIDTH}
          />
        </div>

        {/* Color info — overlaps both strips */}
        <div className="absolute top-0 inset-x-0 z-20 p-5 pointer-events-none">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: labelCol }}
          >
            Round {roundIndex + 1} / {TOTAL_ROUNDS}
          </span>
          <p className="font-mono text-lg font-bold mt-1" style={{ color: labelCol }}>
            {hex}
          </p>
          <p className="font-mono text-xs mt-0.5" style={{ color: labelCol }}>
            H{h} S{s} L{l}
          </p>
        </div>

        {/* Lock in */}
        <div className="absolute bottom-5 right-8 z-20">
          <CircleBtn onClick={onLockIn} />
        </div>
      </div>
    </GameCard>
  );
}
