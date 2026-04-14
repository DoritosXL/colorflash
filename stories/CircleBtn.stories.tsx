import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CircleBtn } from "@/components/colorflash/CircleBtn";
import { ArrowRight } from "@/components/colorflash/ArrowRight";

const meta: Meta<typeof CircleBtn> = {
  title: "ColorFlash/CircleBtn",
  component: CircleBtn,
  parameters: {
    backgrounds: { default: "dark", values: [{ name: "dark", value: "#252525" }] },
    layout: "centered",
  },
  args: { onClick: () => {} },
};
export default meta;

type Story = StoryObj<typeof CircleBtn>;

export const Default: Story = {
  args: { size: 56 },
};

export const WithArrow: Story = {
  args: {
    size: 60,
    children: <ArrowRight size={20} />,
  },
};

export const Small: Story = {
  args: { size: 40 },
};
