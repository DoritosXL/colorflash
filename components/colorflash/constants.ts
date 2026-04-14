export const TOTAL_ROUNDS = 5;
export const DISPLAY_TIMES = [3, 2.5, 2, 1.5, 0.5];
export const PAGE_BG = "#252525";
export const CARD_BG = "#1a1a1a";

export const DEFAULT_HUE_Y = 0.5;
export const DEFAULT_LIGHT_Y = 0.45;
export const PICKER_SAT = 90;

export function yToHue(y: number) { return y * 360; }
export function yToLight(y: number) { return (1 - y) * 80 + 10; }
