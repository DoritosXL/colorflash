"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "start" | "displaying" | "guessing" | "result" | "final";

interface RGB { r: number; g: number; b: number }

interface RoundData {
  target: RGB;
  guess: RGB | null;
  score: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_ROUNDS = 5;
const DISPLAY_TIMES = [3, 2.5, 2, 1.5, 0.5];
const PAGE_BG = "#252525";
const CARD_BG = "#1a1a1a";

// ─── Color utilities ──────────────────────────────────────────────────────────

function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

function rgbToHsl(c: RGB) {
  const r = c.r / 255, g = c.g / 255, b = c.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function randomRgb(): RGB {
  const h = Math.random() * 360;
  const s = 65 + Math.random() * 30; // 65–95 — vivid
  const l = 30 + Math.random() * 35; // 30–65 — not too dark/light
  return hslToRgb(h, s, l);
}

function rgbStr(c: RGB) { return `rgb(${c.r},${c.g},${c.b})`; }

function rgbToHex(c: RGB) {
  return "#" + [c.r, c.g, c.b].map(v => v.toString(16).padStart(2, "0")).join("");
}

function brightness(c: RGB) { return (c.r * 299 + c.g * 587 + c.b * 114) / 1000; }

function colorScore(a: RGB, b: RGB) {
  const dist = Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
  return Math.round((1 - dist / Math.sqrt(3 * 255 ** 2)) * 100);
}

function scoreLabel(total: number, max: number) {
  const p = total / max;
  if (p >= 0.95) return "Photographic Memory";
  if (p >= 0.85) return "Color Master";
  if (p >= 0.70) return "Sharp Eye";
  if (p >= 0.55) return "Getting There";
  return "Keep Practicing";
}

function scoreEmoji(s: number) {
  if (s >= 95) return "🟢"; if (s >= 80) return "🟡";
  if (s >= 60) return "🟠"; return "🔴";
}

function scoreBarColor(s: number) {
  if (s >= 80) return "#4ade80"; if (s >= 60) return "#facc15"; return "#f87171";
}

// ─── Arrow SVG (used in circle buttons) ──────────────────────────────────────

function ArrowRight({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 9h11M9.5 4l5 5-5 5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

// ─── Circle button (white fill, dark icon — Dialed.gg style) ─────────────────

function CircleBtn({ onClick, size = 56, children }: {
  onClick: () => void; size?: number; children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{ width: size, height: size, flexShrink: 0 }}
      className="rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
    >
      {children ?? <ArrowRight />}
    </button>
  );
}

// ─── Vertical strip slider ────────────────────────────────────────────────────

function VerticalStrip({ gradient, value, onChange }: {
  gradient: string; value: number; onChange: (v: number) => void;
}) {
  const ref      = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function clamp(clientY: number) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    onChange(Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)));
  }

  useEffect(() => {
    const up = () => { dragging.current = false; };
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => { window.removeEventListener("mouseup", up); window.removeEventListener("touchend", up); };
  }, []);

  return (
    <div
      ref={ref}
      className="relative flex-shrink-0 rounded-2xl cursor-pointer"
      style={{ background: gradient, width: 44, touchAction: "none" }}
      onMouseDown={e  => { dragging.current = true; clamp(e.clientY); }}
      onMouseMove={e  => { if (dragging.current) clamp(e.clientY); }}
      onTouchStart={e => { e.preventDefault(); dragging.current = true; clamp(e.touches[0].clientY); }}
      onTouchMove={e  => { e.preventDefault(); if (dragging.current) clamp(e.touches[0].clientY); }}
    >
      {/* Dot */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white pointer-events-none"
        style={{
          top: `${Math.max(4, Math.min(96, value * 100))}%`,
          width: 22, height: 22,
          boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          border: "2.5px solid rgba(255,255,255,0.9)",
          background: "white",
        }}
      />
    </div>
  );
}

// ─── Animated orb (home page) ─────────────────────────────────────────────────

function ColorOrb() {
  const [color, setColor]     = useState<RGB>(() => hslToRgb(280, 80, 55));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = () => {
      setVisible(false);
      setTimeout(() => { setColor(randomRgb()); setVisible(true); }, 600);
    };
    const id = setInterval(cycle, 2600);
    return () => clearInterval(id);
  }, []);

  const hi = { r: Math.min(color.r + 50, 255), g: Math.min(color.g + 50, 255), b: Math.min(color.b + 50, 255) };

  return (
    <div className="relative" style={{ width: 160, height: 160 }}>
      <div className="absolute rounded-full" style={{
        inset: 0, borderRadius: "50%",
        background: rgbStr(color),
        opacity: visible ? 0.25 : 0, filter: "blur(44px)",
        transform: visible ? "scale(1.6)" : "scale(1)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }} />
      <div className="rounded-full" style={{
        width: 150, height: 150, margin: "5px",
        background: `radial-gradient(circle at 36% 34%, ${rgbStr(hi)} 0%, ${rgbStr(color)} 65%)`,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.88)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
        boxShadow: `0 20px 60px ${rgbStr(color)}55`,
      }} />
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      className="w-full flex flex-col flex-1 sm:flex-none overflow-hidden sm:rounded-3xl sm:max-w-[440px]"
      style={{ background: CARD_BG, ...style }}
    >
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

// Picker default: mid-hue, mid-lightness
const DEFAULT_HUE_Y  = 0.5;  // hue = 180°
const DEFAULT_LIGHT_Y = 0.45; // lightness ≈ 52%

function yToHue(y: number)  { return y * 360; }
function yToLight(y: number) { return (1 - y) * 80 + 10; } // 10–90%
const PICKER_SAT = 90;

export default function Home() {
  const [phase, setPhase]               = useState<Phase>("start");
  const [roundIndex, setRoundIndex]     = useState(0);
  const [rounds, setRounds]             = useState<RoundData[]>([]);
  const [currentTarget, setCurrentTarget] = useState<RGB>({ r: 128, g: 128, b: 128 });
  const [timerKey, setTimerKey]         = useState(0);
  const [countdown, setCountdown]       = useState(3);

  // Picker state — two independent vertical strips
  const [hueY, setHueY]     = useState(DEFAULT_HUE_Y);
  const [lightY, setLightY] = useState(DEFAULT_LIGHT_Y);

  const currentGuess = hslToRgb(yToHue(hueY), PICKER_SAT, yToLight(lightY));

  // Countdown RAF for display phase
  useEffect(() => {
    if (phase !== "displaying") return;
    const dur  = DISPLAY_TIMES[roundIndex] ?? 3;
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

  function startGame() {
    const newRounds: RoundData[] = Array.from({ length: TOTAL_ROUNDS }, () => ({
      target: randomRgb(), guess: null, score: null,
    }));
    setRounds(newRounds);
    setRoundIndex(0);
    setCurrentTarget(newRounds[0].target);
    setHueY(DEFAULT_HUE_Y);
    setLightY(DEFAULT_LIGHT_Y);
    setPhase("displaying");
    setTimerKey(k => k + 1);
  }

  function onDisplayComplete() {
    setHueY(DEFAULT_HUE_Y);
    setLightY(DEFAULT_LIGHT_Y);
    setPhase("guessing");
  }

  // Auto-advance from displaying after DISPLAY_TIMES[roundIndex]
  useEffect(() => {
    if (phase !== "displaying") return;
    const dur = DISPLAY_TIMES[roundIndex] ?? 3;
    const id = setTimeout(onDisplayComplete, dur * 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timerKey, roundIndex]);

  function lockIn() {
    if (phase !== "guessing") return;
    const score = colorScore(currentTarget, currentGuess);
    setRounds(prev => prev.map((r, i) => i === roundIndex ? { ...r, guess: currentGuess, score } : r));
    setPhase("result");
  }

  function nextRound() {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) { setPhase("final"); return; }
    setRoundIndex(next);
    setCurrentTarget(rounds[next].target);
    setHueY(DEFAULT_HUE_Y);
    setLightY(DEFAULT_LIGHT_Y);
    setPhase("displaying");
    setTimerKey(k => k + 1);
  }

  function share() {
    const scores = rounds.map(r => r.score ?? 0);
    const total  = scores.reduce((a, b) => a + b, 0);
    const text = `ColorFlash: ${scoreLabel(total, TOTAL_ROUNDS * 100)}\n${scores.map(scoreEmoji).join("")}\n${total}/${TOTAL_ROUNDS * 100}`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else navigator.clipboard?.writeText(text).then(() => alert("Copied!"));
  }

  const currentRound = rounds[roundIndex];

  // Hue gradient (full spectrum, vertical)
  const hueGrad = "linear-gradient(to bottom," +
    "hsl(0,100%,50%),hsl(30,100%,50%),hsl(60,100%,50%),hsl(90,100%,50%)," +
    "hsl(120,100%,50%),hsl(150,100%,50%),hsl(180,100%,50%),hsl(210,100%,50%)," +
    "hsl(240,100%,50%),hsl(270,100%,50%),hsl(300,100%,50%),hsl(330,100%,50%),hsl(360,100%,50%))";

  // Lightness gradient for current hue: white → vivid → black
  const curHue  = yToHue(hueY);
  const lightGrad = `linear-gradient(to bottom,#ffffff,hsl(${curHue},100%,50%),#000000)`;

  // ── START ────────────────────────────────────────────────────────────────

  if (phase === "start") {
    return (
      <main className="h-full flex flex-col sm:items-center sm:justify-center sm:p-4" style={{ background: PAGE_BG }}>
        <Card>
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-12">
            <ColorOrb />

            <div className="text-center">
              <h1
                className="text-white leading-none tracking-tight lowercase"
                style={{ fontSize: "4.5rem", fontWeight: 900, letterSpacing: "-0.02em" }}
              >
                color<br />flash
              </h1>
            </div>

            <CircleBtn onClick={startGame} size={60}>
              <ArrowRight size={20} />
            </CircleBtn>
          </div>
        </Card>
      </main>
    );
  }

  // ── DISPLAYING ───────────────────────────────────────────────────────────

  if (phase === "displaying") {
    const bright   = brightness(currentTarget);
    const textCol  = bright > 140 ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.5)";

    return (
      <main className="h-full flex flex-col sm:items-center sm:justify-center sm:p-4" style={{ background: PAGE_BG }}>
        <Card style={{ background: rgbStr(currentTarget) }}>
          <div className="flex flex-1 flex-col justify-between p-6">
            {/* Top */}
            <span style={{ color: textCol, fontSize: "0.75rem", fontWeight: 500 }}>
              {roundIndex + 1}/{TOTAL_ROUNDS}
            </span>

            {/* Countdown */}
            <div className="flex flex-col items-end">
              <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "7rem", fontWeight: 900, lineHeight: 1 }}>
                {Math.ceil(countdown)}
              </div>
              <p style={{ color: textCol, fontSize: "0.8rem", fontWeight: 500, marginTop: 4 }}>
                seconds to remember
              </p>
            </div>

            {/* Bottom spacer */}
            <div />
          </div>
        </Card>
      </main>
    );
  }

  // ── GUESSING ─────────────────────────────────────────────────────────────

  if (phase === "guessing") {
    const guessRgb = currentGuess;
    const hex = rgbToHex(guessRgb).toUpperCase();
    const { h, s, l } = rgbToHsl(guessRgb);
    const previewBright = brightness(guessRgb);
    const labelCol = previewBright > 140 ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.45)";

    return (
      <main className="h-full flex flex-col sm:items-center sm:justify-center sm:p-4" style={{ background: PAGE_BG }}>
        <Card>
          <div className="flex flex-1 gap-3 p-4">
            {/* Hue strip */}
            <VerticalStrip gradient={hueGrad} value={hueY} onChange={setHueY} />

            {/* Lightness strip */}
            <VerticalStrip gradient={lightGrad} value={lightY} onChange={setLightY} />

            {/* Color preview — fills remainder */}
            <div
              className="relative flex-1 flex flex-col justify-between p-5"
              style={{ background: rgbStr(guessRgb) }}
            >
              {/* Top info */}
              <div className="flex justify-between items-start">
                <div>
                  <p style={{ color: labelCol, fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                    {roundIndex + 1}/{TOTAL_ROUNDS}
                  </p>
                  <p className="font-mono mt-1" style={{ color: labelCol, fontSize: "0.9rem", fontWeight: 700 }}>
                    {hex}
                  </p>
                  <p className="font-mono" style={{ color: labelCol, fontSize: "0.6rem", marginTop: 2 }}>
                    H{h} S{s} L{l}
                  </p>
                </div>
              </div>

              {/* Lock In */}
              <div className="flex justify-end">
                <CircleBtn onClick={lockIn} />
              </div>
            </div>
          </div>
        </Card>
      </main>
    );
  }

  // ── RESULT ───────────────────────────────────────────────────────────────

  if (phase === "result" && currentRound) {
    const guess      = currentRound.guess!;
    const score      = currentRound.score ?? 0;
    const isLast     = roundIndex === TOTAL_ROUNDS - 1;
    const guessHsl   = rgbToHsl(guess);
    const targetHsl  = rgbToHsl(currentRound.target);
    const gBright    = brightness(guess);
    const tBright    = brightness(currentRound.target);
    const gLabel     = gBright > 140 ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.45)";
    const tLabel     = tBright > 140 ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.45)";

    const messages = ["Close, but not quite.", "Your eyes need a workout.", "Almost dialed in.", "Impressive!", "Basically perfect."];
    const msgIdx   = Math.min(4, Math.floor(score / 20));
    const msg      = messages[msgIdx];

    return (
      <main className="h-full flex flex-col sm:items-center sm:justify-center sm:p-4" style={{ background: PAGE_BG }}>
        <Card>
          {/* Your guess — top half */}
          <div className="relative flex flex-1 flex-col justify-between p-5" style={{ background: rgbStr(guess) }}>
            <div className="flex justify-between items-start">
              <div>
                <p style={{ color: gLabel, fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Your selection
                </p>
                <p style={{ color: gLabel, fontSize: "0.75rem", fontWeight: 600, marginTop: 2 }}>
                  H{guessHsl.h} S{guessHsl.s} L{guessHsl.l}
                </p>
              </div>

              {/* Score */}
              <div className="text-right">
                <div style={{ color: "rgba(255,255,255,0.95)", fontSize: "3.5rem", fontWeight: 900, lineHeight: 1 }}>
                  {score}
                </div>
                <p style={{ color: gLabel, fontSize: "0.7rem", fontWeight: 500 }}>{msg}</p>
              </div>
            </div>
            <div />
          </div>

          {/* Original — bottom half */}
          <div className="relative flex flex-1 flex-col justify-between p-5" style={{ background: rgbStr(currentRound.target) }}>
            <div>
              <p style={{ color: tLabel, fontSize: "0.6rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Original
              </p>
              <p style={{ color: tLabel, fontSize: "0.75rem", fontWeight: 600, marginTop: 2 }}>
                H{targetHsl.h} S{targetHsl.s} L{targetHsl.l}
              </p>
            </div>

            {/* Next round */}
            <div className="flex justify-end">
              <CircleBtn onClick={nextRound}>
                {isLast
                  ? <span style={{ fontSize: "0.6rem", fontWeight: 700 }}>END</span>
                  : <ArrowRight />}
              </CircleBtn>
            </div>
          </div>
        </Card>
      </main>
    );
  }

  // ── FINAL ────────────────────────────────────────────────────────────────

  if (phase === "final") {
    const scores = rounds.map(r => r.score ?? 0);
    const total  = scores.reduce((a, b) => a + b, 0);
    const max    = TOTAL_ROUNDS * 100;

    return (
      <main className="h-full flex flex-col sm:items-center sm:justify-center sm:p-4" style={{ background: PAGE_BG }}>
        <Card>
          <div className="flex flex-1 flex-col gap-6 p-7">
            {/* Header */}
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Final Score</p>
              <div className="flex items-baseline gap-3">
                <span style={{ fontSize: "5rem", fontWeight: 900, lineHeight: 1, color: "white" }}>{total}</span>
                <span className="text-white/30 text-lg">/ {max}</span>
              </div>
              <p className="text-white/50 text-sm font-medium mt-1">{scoreLabel(total, max)}</p>
            </div>

            {/* Per-round breakdown */}
            <div className="flex flex-col gap-3">
              {rounds.map((r, i) => {
                const s = r.score ?? 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-white/25 text-xs w-12 shrink-0">Round {i + 1}</span>
                    <div className="flex-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full" style={{ width: `${s}%`, background: scoreBarColor(s) }} />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.guess && (
                        <div className="w-3.5 h-3.5 rounded-sm border border-white/10" style={{ background: rgbStr(r.guess) }} />
                      )}
                      <span className="text-white text-xs font-bold w-8 text-right">{s}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={startGame}
                className="text-white/35 text-sm font-medium hover:text-white/60 transition-colors cursor-pointer"
              >
                Play again
              </button>
              <CircleBtn onClick={share}>
                {/* Share icon */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="14" cy="3" r="1.5"/>
                  <circle cx="14" cy="15" r="1.5"/>
                  <circle cx="4" cy="9" r="1.5"/>
                  <path d="M5.5 8.1l7-4.2M5.5 9.9l7 4.2"/>
                </svg>
              </CircleBtn>
            </div>
          </div>
        </Card>
      </main>
    );
  }

  return null;
}
