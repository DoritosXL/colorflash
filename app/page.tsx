"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "start" | "displaying" | "guessing" | "result" | "final";

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface RoundData {
  target: RGB;
  guess: RGB | null;
  score: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_ROUNDS = 5;
// Display time per round (seconds): 3 → 0.5
const DISPLAY_TIMES = [3, 2.5, 2, 1.5, 0.5];
// Guess time per round (seconds): 5 → 3
const GUESS_TIMES = [5, 4.5, 4, 3.5, 3];

// ─── Color utilities ──────────────────────────────────────────────────────────

function randomColor(): RGB {
  const h = Math.random() * 360;
  const s = 60 + Math.random() * 40; // 60–100%
  const l = 30 + Math.random() * 40; // 30–70%
  return hslToRgb(h, s, l);
}

function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255),
  };
}

function rgbString(c: RGB) {
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

function colorScore(a: RGB, b: RGB): number {
  const dist = Math.sqrt(
    Math.pow(a.r - b.r, 2) +
      Math.pow(a.g - b.g, 2) +
      Math.pow(a.b - b.b, 2)
  );
  const maxDist = Math.sqrt(3 * 255 * 255);
  return Math.round((1 - dist / maxDist) * 100);
}

function scoreLabel(total: number, max: number) {
  const pct = total / max;
  if (pct >= 0.95) return { label: "Photographic Memory", emoji: "🧠" };
  if (pct >= 0.85) return { label: "Color Master", emoji: "🎨" };
  if (pct >= 0.70) return { label: "Sharp Eye", emoji: "👁️" };
  if (pct >= 0.55) return { label: "Getting There", emoji: "📈" };
  return { label: "Keep Practicing", emoji: "🌈" };
}

function roundScoreEmoji(score: number) {
  if (score >= 95) return "🟢";
  if (score >= 80) return "🟡";
  if (score >= 60) return "🟠";
  return "🔴";
}

// ─── Canvas picker helpers ────────────────────────────────────────────────────

function drawPickerCanvas(canvas: HTMLCanvasElement, hue: number): void {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const { width: w, height: h } = canvas;

  // Left → right: white → full hue color
  const hGrad = ctx.createLinearGradient(0, 0, w, 0);
  hGrad.addColorStop(0, "#ffffff");
  hGrad.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 0, w, h);

  // Top → bottom: transparent → black
  const vGrad = ctx.createLinearGradient(0, 0, 0, h);
  vGrad.addColorStop(0, "rgba(0,0,0,0)");
  vGrad.addColorStop(1, "rgba(0,0,0,1)");
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, w, h);
}

function sampleCanvas(canvas: HTMLCanvasElement, x: number, y: number): RGB {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { r: 128, g: 128, b: 128 };
  const px = ctx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
  return { r: px[0], g: px[1], b: px[2] };
}

// ─── Timer bar ────────────────────────────────────────────────────────────────

interface TimerBarProps {
  duration: number;
  onComplete: () => void;
  color?: string;
}

function TimerBar({ duration, onComplete, color = "#ffffff" }: TimerBarProps) {
  const [width, setWidth] = useState(100);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    setWidth(100);
    startRef.current = null;

    function tick(ts: number) {
      if (doneRef.current) return;
      if (startRef.current === null) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const remaining = Math.max(0, 1 - elapsed / duration);
      setWidth(remaining * 100);
      if (remaining <= 0) {
        doneRef.current = true;
        onComplete();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      doneRef.current = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  return (
    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${width}%`, backgroundColor: color, transition: "none" }}
      />
    </div>
  );
}

// ─── Color picker ─────────────────────────────────────────────────────────────

interface ColorPickerProps {
  hue: number;
  onHueChange: (h: number) => void;
  pickerPos: { x: number; y: number } | null;
  onPickerPosChange: (pos: { x: number; y: number }) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

function ColorPicker({
  hue,
  onHueChange,
  pickerPos,
  onPickerPosChange,
  canvasRef,
}: ColorPickerProps) {
  const isDragging = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawPickerCanvas(canvas, hue);
  }, [hue, canvasRef]);

  const handleCanvasInteraction = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width - 1));
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height - 1));
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      onPickerPosChange({ x: x * scaleX, y: y * scaleY });
    },
    [canvasRef, onPickerPosChange]
  );

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    handleCanvasInteraction(e.clientX, e.clientY);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleCanvasInteraction(e.clientX, e.clientY);
  };
  const onMouseUp = () => {
    isDragging.current = false;
  };
  const onTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchEnd = () => {
    isDragging.current = false;
  };

  // Crosshair position in CSS space
  const canvas = canvasRef.current;
  let crossX = 0,
    crossY = 0;
  if (canvas && pickerPos) {
    const rect = canvas.getBoundingClientRect();
    crossX = (pickerPos.x / canvas.width) * rect.width;
    crossY = (pickerPos.y / canvas.height) * rect.height;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ aspectRatio: "1/1" }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="w-full h-full block"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
        {pickerPos && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: crossX,
              top: crossY,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="w-7 h-7 rounded-full border-4 border-white"
              style={{ boxShadow: "0 0 0 2px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.6)" }}
            />
          </div>
        )}
      </div>

      <input
        type="range"
        className="hue-slider w-full"
        min={0}
        max={360}
        value={hue}
        onChange={(e) => onHueChange(Number(e.target.value))}
      />
    </div>
  );
}

// ─── Main Game ────────────────────────────────────────────────────────────────

export default function Home() {
  const [phase, setPhase] = useState<Phase>("start");
  const [roundIndex, setRoundIndex] = useState(0);
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [currentTarget, setCurrentTarget] = useState<RGB>({ r: 128, g: 128, b: 128 });

  const [hue, setHue] = useState(180);
  const [pickerPos, setPickerPos] = useState<{ x: number; y: number } | null>(null);
  const [currentGuess, setCurrentGuess] = useState<RGB>({ r: 128, g: 128, b: 128 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timerKey, setTimerKey] = useState(0);

  // Sample canvas color whenever picker position or hue changes
  useEffect(() => {
    if (!pickerPos || !canvasRef.current) return;
    const color = sampleCanvas(canvasRef.current, pickerPos.x, pickerPos.y);
    setCurrentGuess(color);
  }, [pickerPos, hue]);

  function startGame() {
    const newRounds: RoundData[] = Array.from({ length: TOTAL_ROUNDS }, () => ({
      target: randomColor(),
      guess: null,
      score: null,
    }));
    setRounds(newRounds);
    setRoundIndex(0);
    setCurrentTarget(newRounds[0].target);
    setPhase("displaying");
    setTimerKey((k) => k + 1);
  }

  function onDisplayComplete() {
    setHue(180);
    setPickerPos({ x: 300, y: 150 });
    setPhase("guessing");
    setTimerKey((k) => k + 1);
  }

  function lockInGuess() {
    if (phase !== "guessing") return;
    const guess = currentGuess;
    const score = colorScore(currentTarget, guess);
    setRounds((prev) =>
      prev.map((r, i) => (i === roundIndex ? { ...r, guess, score } : r))
    );
    setPhase("result");
  }

  function nextRound() {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      setPhase("final");
    } else {
      setRoundIndex(next);
      setCurrentTarget(rounds[next].target);
      setPhase("displaying");
      setTimerKey((k) => k + 1);
    }
  }

  function shareResult() {
    const scores = rounds.map((r) => r.score ?? 0);
    const total = scores.reduce((a, b) => a + b, 0);
    const emojis = scores.map(roundScoreEmoji).join("");
    const { label } = scoreLabel(total, TOTAL_ROUNDS * 100);
    const text = `ColorFlash: ${label}\n${emojis}\nScore: ${total}/${TOTAL_ROUNDS * 100}\n\nTest your color memory! 🎨`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"));
    }
  }

  const currentRound = rounds[roundIndex];
  const displayTime = DISPLAY_TIMES[roundIndex] ?? 3;
  const guessTime = GUESS_TIMES[roundIndex] ?? 5;

  // ─── START ────────────────────────────────────────────────────────────────

  if (phase === "start") {
    return (
      <main
        className="h-full flex flex-col items-center justify-center gap-8 p-6"
        style={{ background: "#0f0f0f" }}
      >
        <div className="text-center">
          <h1 className="text-6xl font-black tracking-tight mb-3">
            Color<span style={{ color: "#a78bfa" }}>Flash</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xs mx-auto leading-relaxed">
            A color flashes on screen. Remember it. Then find the exact shade.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-white/50 text-sm text-center">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-2xl">⚡</span>
            <span>5 rounds — timers get shorter each round</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-2xl">🎨</span>
            <span>Drag the color picker to match what you saw</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="text-2xl">📊</span>
            <span>Score out of {TOTAL_ROUNDS * 100} — share your result</span>
          </div>
        </div>

        <button
          onClick={startGame}
          className="px-12 py-4 rounded-2xl text-xl font-bold text-black cursor-pointer"
          style={{ background: "#a78bfa" }}
        >
          Play
        </button>
      </main>
    );
  }

  // ─── DISPLAYING ───────────────────────────────────────────────────────────

  if (phase === "displaying") {
    return (
      <main
        className="h-full flex flex-col items-center justify-between p-6"
        style={{ background: rgbString(currentTarget) }}
      >
        <div className="w-full pt-2">
          <TimerBar
            key={`display-${timerKey}`}
            duration={displayTime}
            onComplete={onDisplayComplete}
            color="rgba(0,0,0,0.35)"
          />
        </div>

        <div className="text-center">
          <p
            className="text-sm font-semibold uppercase tracking-widest mb-2"
            style={{ color: "rgba(0,0,0,0.4)" }}
          >
            Round {roundIndex + 1} of {TOTAL_ROUNDS}
          </p>
          <p
            className="text-4xl font-black"
            style={{ color: "rgba(0,0,0,0.3)" }}
          >
            Remember this color
          </p>
        </div>

        <p className="text-sm" style={{ color: "rgba(0,0,0,0.35)" }}>
          {displayTime}s to memorize
        </p>
      </main>
    );
  }

  // ─── GUESSING ─────────────────────────────────────────────────────────────

  if (phase === "guessing") {
    return (
      <main className="h-full flex flex-col" style={{ background: "#0f0f0f" }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-white/40 text-sm font-medium">
            Round {roundIndex + 1}/{TOTAL_ROUNDS}
          </span>
          <div
            className="w-8 h-8 rounded-full border-2 border-white/20"
            style={{ background: rgbString(currentGuess) }}
          />
        </div>

        <div className="px-5 pb-3">
          <TimerBar
            key={`guess-${timerKey}`}
            duration={guessTime}
            onComplete={lockInGuess}
            color="#a78bfa"
          />
          <p className="text-white/30 text-xs mt-1 text-right">{guessTime}s</p>
        </div>

        <div className="flex-1 px-5 flex flex-col justify-center gap-4 overflow-hidden">
          <p className="text-white/60 text-sm text-center">
            Find the color you just saw
          </p>
          <ColorPicker
            hue={hue}
            onHueChange={setHue}
            pickerPos={pickerPos}
            onPickerPosChange={setPickerPos}
            canvasRef={canvasRef}
          />
        </div>

        <div className="px-5 pb-6 pt-3">
          <button
            onClick={lockInGuess}
            className="w-full py-4 rounded-2xl font-bold text-lg text-black cursor-pointer"
            style={{ background: "#a78bfa" }}
          >
            Lock In
          </button>
        </div>
      </main>
    );
  }

  // ─── RESULT ───────────────────────────────────────────────────────────────

  if (phase === "result" && currentRound) {
    const guess = currentRound.guess ?? currentGuess;
    const score = currentRound.score ?? 0;
    const isLast = roundIndex === TOTAL_ROUNDS - 1;
    const scoreColor =
      score >= 80 ? "#4ade80" : score >= 60 ? "#facc15" : "#f87171";

    return (
      <main className="h-full flex flex-col" style={{ background: "#0f0f0f" }}>
        {/* Split screen */}
        <div className="flex" style={{ height: "55%" }}>
          <div
            className="flex-1 flex flex-col items-center justify-end pb-6"
            style={{ background: rgbString(guess) }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "rgba(0,0,0,0.5)" }}
            >
              Your guess
            </span>
          </div>
          <div
            className="flex-1 flex flex-col items-center justify-end pb-6"
            style={{ background: rgbString(currentRound.target) }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "rgba(0,0,0,0.5)" }}
            >
              Actual color
            </span>
          </div>
        </div>

        {/* Score panel */}
        <div className="flex-1 p-6 flex flex-col items-center justify-between">
          <div className="text-center">
            <div
              className="text-7xl font-black mb-1"
              style={{ color: scoreColor }}
            >
              {score}
            </div>
            <div className="text-white/40 text-sm">out of 100</div>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2">
            {rounds.map((r, i) => (
              <div
                key={i}
                className="h-2 rounded-full"
                style={{
                  width: i === roundIndex ? "2rem" : "0.75rem",
                  background:
                    i < roundIndex
                      ? (r.score ?? 0) >= 80
                        ? "#4ade80"
                        : (r.score ?? 0) >= 60
                        ? "#facc15"
                        : "#f87171"
                      : i === roundIndex
                      ? "#a78bfa"
                      : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>

          <button
            onClick={nextRound}
            className="w-full py-4 rounded-2xl font-bold text-lg text-black cursor-pointer"
            style={{ background: "#a78bfa" }}
          >
            {isLast ? "See Results" : "Next Round →"}
          </button>
        </div>
      </main>
    );
  }

  // ─── FINAL ────────────────────────────────────────────────────────────────

  if (phase === "final") {
    const scores = rounds.map((r) => r.score ?? 0);
    const total = scores.reduce((a, b) => a + b, 0);
    const max = TOTAL_ROUNDS * 100;
    const { label, emoji } = scoreLabel(total, max);

    return (
      <main
        className="h-full flex flex-col items-center justify-between p-6"
        style={{ background: "#0f0f0f" }}
      >
        <div />

        <div className="flex flex-col items-center gap-6 text-center">
          <div className="text-6xl">{emoji}</div>
          <div>
            <div className="text-white/50 text-sm uppercase tracking-widest mb-2">
              Final Score
            </div>
            <div className="text-8xl font-black mb-1">{total}</div>
            <div className="text-white/40">out of {max}</div>
          </div>
          <div className="text-2xl font-bold" style={{ color: "#a78bfa" }}>
            {label}
          </div>

          {/* Per-round breakdown */}
          <div className="flex flex-col gap-2 w-full max-w-xs">
            {rounds.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-white/40 text-sm w-16 text-left">
                  Round {i + 1}
                </span>
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${r.score ?? 0}%`,
                      background:
                        (r.score ?? 0) >= 80
                          ? "#4ade80"
                          : (r.score ?? 0) >= 60
                          ? "#facc15"
                          : "#f87171",
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 w-16 justify-end">
                  <div
                    className="w-4 h-4 rounded-sm border border-white/20"
                    style={{ background: r.guess ? rgbString(r.guess) : "#333" }}
                  />
                  <span className="text-sm font-bold">{r.score ?? 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={shareResult}
            className="w-full py-4 rounded-2xl font-bold text-lg text-black cursor-pointer"
            style={{ background: "#a78bfa" }}
          >
            Share Result
          </button>
          <button
            onClick={startGame}
            className="w-full py-4 rounded-2xl font-bold text-lg cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
            }}
          >
            Play Again
          </button>
        </div>
      </main>
    );
  }

  return null;
}
