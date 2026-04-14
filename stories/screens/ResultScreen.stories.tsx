import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ResultScreen } from "@/components/colorflash/screens/ResultScreen";

const meta: Meta<typeof ResultScreen> = {
  title: "ColorFlash/Screens/ResultScreen",
  component: ResultScreen,
  parameters: {
    backgrounds: { default: "dark", values: [{ name: "dark", value: "#252525" }] },
    layout: "fullscreen",
  },
  args: { onNext: () => {} },
};
export default meta;

type Story = StoryObj<typeof ResultScreen>;

export const HighScore: Story = {
  args: {
    guess: { r: 220, g: 85, b: 125 },
    target: { r: 225, g: 80, b: 120 },
    score: 97,
    roundIndex: 0,
    isLast: false,
  },
};

export const LowScore: Story = {
  args: {
    guess: { r: 60, g: 180, b: 100 },
    target: { r: 220, g: 80, b: 150 },
    score: 32,
    roundIndex: 1,
    isLast: false,
  },
};

export const LastRound: Story = {
  args: {
    guess: { r: 100, g: 160, b: 220 },
    target: { r: 90, g: 150, b: 210 },
    score: 85,
    roundIndex: 4,
    isLast: true,
  },
};
