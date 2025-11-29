import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useMediaQuery } from "react-responsive";
import H2a from "../../../assets/img/h2a.jpg";
import H2b from "../../../assets/img/h2b.jpg";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LINES = [
  "We blend smart queues 🪄",
  "with caring hospitality 💚",
  "so hotels can serve smoothly,",
  "and guests can enjoy fully,",
  "reducing wait-time, not warm welcomes,",
  "turning busy weekends into calm experiences.",
];

export default function HeroScene2() {
  const sectionRef = useRef(null);
  const lineRefs = useRef([]);
  lineRefs.current = [];

  // ❗ change this breakpoint as you like
  // show images only when width >= 1024px AND orientation is landscape
  const showImages = useMediaQuery({
    minWidth: 1024,
    orientation: "landscape",
  });

  useGSAP(
    () => {
      lineRefs.current.forEach((lineEl) => {
        if (!lineEl) return;

        gsap.set(lineEl, { backgroundPositionX: "100%" });

        gsap.to(lineEl, {
          backgroundPositionX: 0,
          ease: "none",
          scrollTrigger: {
            trigger: lineEl,
            start: "top 80%",
            end: "bottom 20%",
            scrub: 1,
          },
        });
      });
    },
    { scope: sectionRef }
  );

  const addLineRef = (el) => {
    if (el && !lineRefs.current.includes(el)) {
      lineRefs.current.push(el);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="bg-[#FFF9ED] overflow-visible" // prevent any accidental clipping
    >
      {/* Top image block – hidden on mobile/small vertical screens */}
      {showImages && (
        <div
          className="h-screen w-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${H2a})`,
          }}
        />
      )}

      {/* Text section */}
      <div className="flex items-center justify-center px-4 sm:px-6 py-16 lg:py-20">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#6A4CAB] mb-6 font-bold">
            Why Khaate Khelte ?
          </p>

          <div className="space-y-3 sm:space-y-5 lg:space-y-6">
            {LINES.map((line, idx) => (
              <div
                key={idx}
                ref={addLineRef}
                className="
                  queue-story-line
                  font-bold font-sans
                  mx-auto
                  max-w-[20ch] sm:max-w-[24ch] md:max-w-[28ch] lg:max-w-[32ch]
                  text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] xl:text-5xl
                  leading-snug lg:leading-snug
                  px-2
                "
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom image block – hidden on mobile/small vertical screens */}
      {showImages && (
        <div
          className="h-screen w-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${H2b})`,
          }}
        />
      )}
    </section>
  );
}
