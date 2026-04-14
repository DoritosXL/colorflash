import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ColorOrb } from "@/components/colorflash/ColorOrb";

const meta: Meta<typeof ColorOrb> = {
  title: "ColorFlash/ColorOrb",
  component: ColorOrb,
  parameters: {
    backgrounds: { default: "dark", values: [{ name: "dark", value: "#1a1a1a" }] },
    layout: "centered",
  },
};
export default meta;

type Story = StoryObj<typeof ColorOrb>;

export const Default: Story = {};
