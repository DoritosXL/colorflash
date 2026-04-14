import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StartScreen } from "@/components/colorflash/screens/StartScreen";

const meta: Meta<typeof StartScreen> = {
  title: "ColorFlash/Screens/StartScreen",
  component: StartScreen,
  parameters: {
    backgrounds: { default: "dark", values: [{ name: "dark", value: "#252525" }] },
    layout: "fullscreen",
  },
  args: { onStart: () => {} },
};
export default meta;

type Story = StoryObj<typeof StartScreen>;

export const Default: Story = {};
