import type { RGB } from "./types";

export function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

export function rgbToHsl(c: RGB) {
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

export function randomRgb(): RGB {
  const h = Math.random() * 360;
  const s = 65 + Math.random() * 30;
  const l = 30 + Math.random() * 35;
  return hslToRgb(h, s, l);
}

export function rgbStr(c: RGB) {
  return `rgb(${c.r},${c.g},${c.b})`;
}

export function rgbToHex(c: RGB) {
  return "#" + [c.r, c.g, c.b].map(v => v.toString(16).padStart(2, "0")).join("");
}

export function brightness(c: RGB) {
  return (c.r * 299 + c.g * 587 + c.b * 114) / 1000;
}

export function colorScore(a: RGB, b: RGB) {
  const dist = Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
  return Math.round((1 - dist / Math.sqrt(3 * 255 ** 2)) * 100);
}

export function scoreLabel(total: number, max: number) {
  const p = total / max;
  if (p >= 0.95) return "Photographic Memory";
  if (p >= 0.85) return "Color Master";
  if (p >= 0.70) return "Sharp Eye";
  if (p >= 0.55) return "Getting There";
  return "Keep Practicing";
}

export function scoreEmoji(s: number) {
  if (s >= 95) return "🟢";
  if (s >= 80) return "🟡";
  if (s >= 60) return "🟠";
  return "🔴";
}

export function scoreBarColor(s: number) {
  if (s >= 80) return "#4ade80";
  if (s >= 60) return "#facc15";
  return "#f87171";
}
