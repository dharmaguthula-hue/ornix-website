"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

const TOTAL_FRAMES = 40;

export const HeroScrollAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end center"],
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

  useEffect(() => {
    return frameIndex.on("change", (latest) => {
      setCurrentFrame(Math.round(latest));
    });
  }, [frameIndex]);

  const frameNumber = String(currentFrame + 1).padStart(3, "0");

  // Pre-load nearby frames for smoother playback
  const framesToPreload = useMemo(() => {
    const frames = [];
    for (let i = Math.max(0, currentFrame - 2); i <= Math.min(TOTAL_FRAMES - 1, currentFrame + 2); i++) {
      frames.push(i);
    }
    return frames;
  }, [currentFrame]);

  return (
    <div ref={containerRef} className="relative w-full bg-black">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/anim/ezgif-frame-${frameNumber}.jpg`}
            alt={`Frame ${currentFrame + 1}`}
            className="w-full h-full object-cover"
            loading="eager"
          />

          {/* Smooth fade overlay during frame transitions */}
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.05 }}
          />
        </div>
      </div>

      {/* Hidden preload images for smooth scrolling */}
      <div className="hidden">
        {framesToPreload.map((i) => {
          const num = String(i + 1).padStart(3, "0");
          // eslint-disable-next-line @next/next/no-img-element
          return <img key={i} src={`/anim/ezgif-frame-${num}.jpg`} alt="preload" />;
        })}
      </div>

      {/* Scroll trigger area - 5x viewport height for smooth frame progression */}
      <div className="relative h-[500vh]" />
    </div>
  );
};
