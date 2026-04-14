import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FinalScreen } from "@/components/colorflash/screens/FinalScreen";

const meta: Meta<typeof FinalScreen> = {
  title: "ColorFlash/Screens/FinalScreen",
  component: FinalScreen,
  parameters: {
    backgrounds: { default: "dark", values: [{ name: "dark", value: "#252525" }] },
    layout: "fullscreen",
  },
  args: {
    onPlayAgain: () => {},
    onShare: () => alert("Shared!"),
  },
};
export default meta;

type Story = StoryObj<typeof FinalScreen>;

export const HighScores: Story = {
  args: {
    rounds: [
      { target: { r: 220, g: 80, b: 120 }, guess: { r: 225, g: 82, b: 118 }, score: 97 },
      { target: { r: 60, g: 180, b: 240 }, guess: { r: 65, g: 175, b: 235 }, score: 91 },
      { target: { r: 180, g: 120, b: 60 }, guess: { r: 170, g: 130, b: 70 }, score: 88 },
      { target: { r: 100, g: 200, b: 150 }, guess: { r: 110, g: 195, b: 145 }, score: 94 },
      { target: { r: 240, g: 180, b: 80 }, guess: { r: 235, g: 178, b: 83 }, score: 96 },
    ],
  },
};

export const MixedScores: Story = {
  args: {
    rounds: [
      { target: { r: 220, g: 80, b: 120 }, guess: { r: 180, g: 120, b: 80 }, score: 55 },
      { target: { r: 60, g: 180, b: 240 }, guess: { r: 65, g: 175, b: 235 }, score: 91 },
      { target: { r: 180, g: 120, b: 60 }, guess: { r: 80, g: 200, b: 160 }, score: 28 },
      { target: { r: 100, g: 200, b: 150 }, guess: { r: 105, g: 198, b: 148 }, score: 98 },
      { target: { r: 240, g: 180, b: 80 }, guess: { r: 200, g: 140, b: 100 }, score: 72 },
    ],
  },
};
