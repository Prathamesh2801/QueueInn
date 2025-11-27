// src/components/QueueStoryScene.jsx
import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import H2a from '../../../assets/img/h2a.jpg'
import H2b from '../../../assets/img/h2b.jpg'

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

  useGSAP(
    () => {
      lineRefs.current.forEach((lineEl) => {
        if (!lineEl) return;

        // starting position (muted side visible)
        gsap.set(lineEl, { backgroundPositionX: "100%" });

        gsap.to(lineEl, {
          backgroundPositionX: 0,
          ease: "none",
          scrollTrigger: {
            trigger: lineEl,
            start: "top 80%",    // when line's top hits 80% of viewport
            end: "bottom 20%",   // when bottom hits 20% of viewport
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
    <section ref={sectionRef} className="bg-[#FFF9ED]">
      {/* Top image block like your reference */}
      <div
        className="h-screen w-full bg-cover bg-center"
        style={{
          backgroundImage:
            `url(${H2a})`, // replace with your hero/queue image
        }}
      />

      {/* Text section */}
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#6A4CAB] mb-6 font-medium">
            Why Khaate Khelte
          </p>

          <div className="space-y-3 sm:space-y-4">
            {LINES.map((line, idx) => (
              <div
                key={idx}
                ref={addLineRef}
                className="
                  queue-story-line 
                  font-bold font-sans
                  mx-auto
                  max-w-[22ch] sm:max-w-[26ch] md:max-w-none
                  text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                  leading-snug md:leading-tight
                "
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom image block like your reference */}
      <div
        className="h-screen w-full bg-cover bg-center"
        style={{
          backgroundImage:
            `url(${H2b})`, // another image or same
        }}
      />
    </section>
  );
}
