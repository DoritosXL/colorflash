"use client";

import { useState, useEffect } from "react";
import { StartScreen } from "@/components/colorflash/screens/StartScreen";
import { DisplayingScreen } from "@/components/colorflash/screens/DisplayingScreen";
import { GuessingScreen } from "@/components/colorflash/screens/GuessingScreen";
import { ResultScreen } from "@/components/colorflash/screens/ResultScreen";
import { FinalScreen } from "@/components/colorflash/screens/FinalScreen";
import { randomRgb, colorScore, scoreEmoji, scoreLabel, hslToRgb } from "@/components/colorflash/utils";
import {
  TOTAL_ROUNDS,
  DISPLAY_TIMES,
  PAGE_BG,
  DEFAULT_HUE_Y,
  DEFAULT_LIGHT_Y,
  PICKER_SAT,
  yToHue,
  yToLight,
} from "@/components/colorflash/constants";
import type { Phase, RoundData } from "@/components/colorflash/types";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("start");
  const [roundIndex, setRoundIndex] = useState(0);
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [timerKey, setTimerKey] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const [hueY, setHueY] = useState(DEFAULT_HUE_Y);
  const [lightY, setLightY] = useState(DEFAULT_LIGHT_Y);

  // Countdown RAF
  useEffect(() => {
    if (phase !== "displaying") return;
    const dur = DISPLAY_TIMES[roundIndex] ?? 3;
    const start = performance.now();
    setCountdown(dur);
    let raf: number;
    function tick(now: number) {
      const rem = Math.max(0, dur - (now - start) / 1000);
      setCountdown(rem);
      if (rem > 0) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, timerKey, roundIndex]);

  // Auto-advance from displaying
  useEffect(() => {
    if (phase !== "displaying") return;
    const dur = DISPLAY_TIMES[roundIndex] ?? 3;
    const id = setTimeout(() => {
      setHueY(DEFAULT_HUE_Y);
      setLightY(DEFAULT_LIGHT_Y);
      setPhase("guessing");
    }, dur * 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timerKey, roundIndex]);

  function startGame() {
    const newRounds: RoundData[] = Array.from({ length: TOTAL_ROUNDS }, () => ({
      target: randomRgb(),
      guess: null,
      score: null,
    }));
    setRounds(newRounds);
    setRoundIndex(0);
    setHueY(DEFAULT_HUE_Y);
    setLightY(DEFAULT_LIGHT_Y);
    setPhase("displaying");
    setTimerKey(k => k + 1);
  }

  function lockIn() {
    if (phase !== "guessing") return;
    const currentRound = rounds[roundIndex];
    if (!currentRound) return;
    const guess = hslToRgb(yToHue(hueY), PICKER_SAT, yToLight(lightY));
    const score = colorScore(currentRound.target, guess);
    setRounds(prev => prev.map((r, i) => i === roundIndex ? { ...r, guess, score } : r));
    setPhase("result");
  }

  function nextRound() {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) { setPhase("final"); return; }
    setRoundIndex(next);
    setHueY(DEFAULT_HUE_Y);
    setLightY(DEFAULT_LIGHT_Y);
    setPhase("displaying");
    setTimerKey(k => k + 1);
  }

  function share() {
    const scores = rounds.map(r => r.score ?? 0);
    const total = scores.reduce((a, b) => a + b, 0);
    const text = `ColorFlash: ${scoreLabel(total, TOTAL_ROUNDS * 100)}\n${scores.map(scoreEmoji).join("")}\n${total}/${TOTAL_ROUNDS * 100}`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else navigator.clipboard?.writeText(text).then(() => alert("Copied!"));
  }

  const currentRound = rounds[roundIndex];

  return (
    <main
      className="h-full flex flex-col sm:items-center sm:justify-center sm:p-4"
      style={{ background: PAGE_BG }}
    >
      {phase === "start" && (
        <StartScreen onStart={startGame} />
      )}

      {phase === "displaying" && currentRound && (
        <DisplayingScreen
          target={currentRound.target}
          countdown={countdown}
          roundIndex={roundIndex}
        />
      )}

      {phase === "guessing" && (
        <GuessingScreen
          hueY={hueY}
          setHueY={setHueY}
          lightY={lightY}
          setLightY={setLightY}
          roundIndex={roundIndex}
          onLockIn={lockIn}
        />
      )}

      {phase === "result" && currentRound?.guess != null && currentRound.score != null && (
        <ResultScreen
          guess={currentRound.guess}
          target={currentRound.target}
          score={currentRound.score}
          roundIndex={roundIndex}
          isLast={roundIndex === TOTAL_ROUNDS - 1}
          onNext={nextRound}
        />
      )}

      {phase === "final" && (
        <FinalScreen
          rounds={rounds}
          onPlayAgain={startGame}
          onShare={share}
        />
      )}
    </main>
  );
}
