import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DisplayingScreen } from "@/components/colorflash/screens/DisplayingScreen";

const meta: Meta<typeof DisplayingScreen> = {
  title: "ColorFlash/Screens/DisplayingScreen",
  component: DisplayingScreen,
  parameters: {
    backgrounds: { default: "dark", values: [{ name: "dark", value: "#252525" }] },
    layout: "fullscreen",
  },
};
export default meta;

type Story = StoryObj<typeof DisplayingScreen>;

export const Countdown3: Story = {
  args: {
    target: { r: 220, g: 80, b: 120 },
    countdown: 3,
    roundIndex: 0,
  },
};

export const Countdown1: Story = {
  args: {
    target: { r: 60, g: 180, b: 240 },
    countdown: 1,
    roundIndex: 2,
  },
};

export const LightColor: Story = {
  args: {
    target: { r: 255, g: 230, b: 100 },
    countdown: 2,
    roundIndex: 1,
  },
};
