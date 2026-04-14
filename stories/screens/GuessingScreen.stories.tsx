import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { GuessingScreen } from "@/components/colorflash/screens/GuessingScreen";
import { DEFAULT_HUE_Y, DEFAULT_LIGHT_Y } from "@/components/colorflash/constants";

const meta: Meta<typeof GuessingScreen> = {
  title: "ColorFlash/Screens/GuessingScreen",
  component: GuessingScreen,
  parameters: {
    backgrounds: { default: "dark", values: [{ name: "dark", value: "#252525" }] },
    layout: "fullscreen",
  },
};
export default meta;

type Story = StoryObj<typeof GuessingScreen>;

export const Default: Story = {
  render: () => {
    const [hueY, setHueY] = useState(DEFAULT_HUE_Y);
    const [lightY, setLightY] = useState(DEFAULT_LIGHT_Y);
    return (
      <div className="h-screen flex flex-col" style={{ background: "#252525" }}>
        <GuessingScreen
          hueY={hueY}
          setHueY={setHueY}
          lightY={lightY}
          setLightY={setLightY}
          roundIndex={0}
          onLockIn={() => alert("Locked in!")}
        />
      </div>
    );
  },
};

export const Round3: Story = {
  render: () => {
    const [hueY, setHueY] = useState(0.7);
    const [lightY, setLightY] = useState(0.3);
    return (
      <div className="h-screen flex flex-col" style={{ background: "#252525" }}>
        <GuessingScreen
          hueY={hueY}
          setHueY={setHueY}
          lightY={lightY}
          setLightY={setLightY}
          roundIndex={2}
          onLockIn={() => alert("Locked in!")}
        />
      </div>
    );
  },
};
