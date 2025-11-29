import { useEffect, useRef, useCallback } from "react";

export const ScrollStackItem = ({ children, itemClassName = "" }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

const ScrollStack = ({
  children,
  className = "",
  itemGap = 24,
  baseTop = 140,           // desktop base top
  mobileBaseTop = 120,     // mobile base top
  offsetPerCard = 40,      // extra top per card (desktop)
  mobileOffsetPerCard = 24 // extra top per card (mobile)
}) => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const ticking = useRef(false);

  const updateScales = useCallback(() => {
    if (!cardsRef.current.length) return;

    const windowHeight = window.innerHeight;

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const cardTop = rect.top;
      const cardHeight = rect.height;

      // Calculate when card should start scaling
      const scaleStart = windowHeight * 0.2;
      const scaleEnd = -cardHeight;

      let progress = 0;
      if (cardTop < scaleStart && cardTop > scaleEnd) {
        progress = (scaleStart - cardTop) / (scaleStart - scaleEnd);
      } else if (cardTop <= scaleEnd) {
        progress = 1;
      }

      // Scale down as cards stack (each card slightly smaller)
      const minScale = 0.88 - index * 0.02;
      const scale = 1 - progress * (1 - minScale);

      const currentScale = parseFloat(card.dataset.currentScale || "1");
      if (Math.abs(scale - currentScale) > 0.001) {
        card.style.transform = `scale(${scale})`;
        card.dataset.currentScale = scale.toString();
      }
    });

    ticking.current = false;
  }, []);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      window.requestAnimationFrame(updateScales);
      ticking.current = true;
    }
  }, [updateScales]);

  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll(".scroll-stack-card");
    if (!cards) return;

    cardsRef.current = Array.from(cards);

    const isMobile = window.innerWidth <= 640;
    const topBase = isMobile ? mobileBaseTop : baseTop;
    const offset = isMobile ? mobileOffsetPerCard : offsetPerCard;

    // Set up initial styles
    cardsRef.current.forEach((card, index) => {
      card.style.transformOrigin = "top center";
      card.style.willChange = "transform";
      card.dataset.currentScale = "1";

      // ✅ Per-card sticky top (layered effect)
      card.style.top = `${topBase + index * offset}px`;
      // ensure consistent vertical spacing
      card.style.marginBottom = `${itemGap}px`;
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScales(); // Initial calculation

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cardsRef.current = [];
    };
  }, [handleScroll, updateScales, baseTop, mobileBaseTop, offsetPerCard, mobileOffsetPerCard, itemGap]);

  return (
    <div
      ref={containerRef}
      className={`scroll-stack-container ${className}`.trim()}
    >
      <style>
        {`
          .scroll-stack-container {
            position: relative;
            width: 100%;
          }

          .scroll-stack-card {
            position: sticky;
            /* top is set per-card in JS for layered effect */
            transition: transform 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          .scroll-stack-spacer {
            height: 60vh;
            pointer-events: none;
          }

          @media (max-width: 768px) {
            .scroll-stack-spacer {
              height: 40vh;
            }
          }
        `}
      </style>

      {children}
      <div className="scroll-stack-spacer" />
    </div>
  );
};

export default ScrollStack;
