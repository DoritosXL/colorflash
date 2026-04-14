"use client";

import { useState, useEffect } from "react";
import { hslToRgb, randomRgb, rgbStr } from "./utils";

export function ColorOrb() {
  const [color, setColor] = useState(() => hslToRgb(280, 80, 55));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const cycle = () => {
      setVisible(false);
      setTimeout(() => { setColor(randomRgb()); setVisible(true); }, 600);
    };
    const id = setInterval(cycle, 2600);
    return () => clearInterval(id);
  }, []);

  const hi = {
    r: Math.min(color.r + 50, 255),
    g: Math.min(color.g + 50, 255),
    b: Math.min(color.b + 50, 255),
  };

  return (
    <div className="relative" style={{ width: 160, height: 160 }}>
      <div
        className="absolute rounded-full"
        style={{
          inset: 0,
          borderRadius: "50%",
          background: rgbStr(color),
          opacity: visible ? 0.25 : 0,
          filter: "blur(44px)",
          transform: visible ? "scale(1.6)" : "scale(1)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      />
      <div
        className="rounded-full"
        style={{
          width: 150,
          height: 150,
          margin: "5px",
          background: `radial-gradient(circle at 36% 34%, ${rgbStr(hi)} 0%, ${rgbStr(color)} 65%)`,
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.88)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
          boxShadow: `0 20px 60px ${rgbStr(color)}55`,
        }}
      />
    </div>
  );
}
