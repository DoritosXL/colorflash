export type Phase = "start" | "displaying" | "guessing" | "result" | "final";

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RoundData {
  target: RGB;
  guess: RGB | null;
  score: number | null;
}
