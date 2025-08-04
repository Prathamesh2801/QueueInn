import { useEffect, useRef } from "react";

export default function GradientButton({
  text = "Click me",
  color = "#171717",
  glow = "#22d3ee",
  onClick,
  className = "",
  speed = 1, // ← degrees per frame (default = 1)
}) {
  const btnRef = useRef(null);

  useEffect(() => {
    let angle = 0;
    const el = btnRef.current;
    if (!el) return;

    // Set initial colors
    el.style.setProperty("--c", color);
    el.style.setProperty("--g", glow);

    let animationFrame;

    const rotate = () => {
      angle = (angle + speed) % 360;
      el.style.setProperty("--gradient-angle", `${angle}deg`);
      animationFrame = requestAnimationFrame(rotate);
    };

    rotate();

    // Cleanup on unmount
    return () => cancelAnimationFrame(animationFrame);
  }, [color, glow, speed]);

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      className={`border-gradient w-64 h-20 rounded-full font-inter text-white text-lg ${className}`}
    >
      {text}
    </button>
  );
}
