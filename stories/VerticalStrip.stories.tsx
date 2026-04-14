import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { VerticalStrip } from "@/components/colorflash/VerticalStrip";

const HUE_GRADIENT =
  "linear-gradient(to bottom," +
  "hsl(0,100%,50%),hsl(60,100%,50%),hsl(120,100%,50%)," +
  "hsl(180,100%,50%),hsl(240,100%,50%),hsl(300,100%,50%),hsl(360,100%,50%))";

const LIGHT_GRADIENT = "linear-gradient(to bottom,#ffffff,hsl(200,100%,50%),#000000)";

const meta: Meta<typeof VerticalStrip> = {
  title: "ColorFlash/VerticalStrip",
  component: VerticalStrip,
  parameters: {
    backgrounds: { default: "dark", values: [{ name: "dark", value: "#1a1a1a" }] },
    layout: "centered",
  },
};
export default meta;

type Story = StoryObj<typeof VerticalStrip>;

export const HueStrip: Story = {
  render: () => {
    const [value, setValue] = useState(0.5);
    return (
      <div style={{ height: 300 }}>
        <VerticalStrip gradient={HUE_GRADIENT} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const LightnessStrip: Story = {
  render: () => {
    const [value, setValue] = useState(0.45);
    return (
      <div style={{ height: 300 }}>
        <VerticalStrip gradient={LIGHT_GRADIENT} value={value} onChange={setValue} />
      </div>
    );
  },
};
