"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { HeroPortal } from "@/components/hero-portal";
import {
  CraftedLayers,
  CustomizationSection,
  FeaturedShowcase,
  FinalCta,
  GallerySection,
  ProcessTimeline
} from "@/components/sections";

export default function HomePage() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smoothX = useSpring(mx, { stiffness: 70, damping: 20 });
  const smoothY = useSpring(my, { stiffness: 70, damping: 20 });
  const glow = useMotionTemplate`radial-gradient(540px circle at ${smoothX}px ${smoothY}px, rgba(201,167,78,0.16), transparent 70%)`;
  const [highGlow, setHighGlow] = useState(false);
  const [ambientOn, setAmbientOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mx, my]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (ambientOn) {
      void audio.play().catch(() => undefined);
      return;
    }
    audio.pause();
  }, [ambientOn]);

  return (
    <main className="relative min-h-screen bg-ornixBlack text-white">
      <motion.div style={{ background: glow, opacity: highGlow ? 0.95 : 0.6 }} className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300" />
      <div className="fixed right-4 top-4 z-50 flex gap-2">
        <button onClick={() => setHighGlow((v) => !v)} className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/75 backdrop-blur">
          {highGlow ? "Glow: High" : "Glow: Soft"}
        </button>
        <button onClick={() => setAmbientOn((v) => !v)} className="rounded-full border border-white/20 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/75 backdrop-blur">
          {ambientOn ? "Ambient: On" : "Ambient: Off"}
        </button>
      </div>

      <audio ref={audioRef} src="/ambient.mp3" loop preload="none" />

      <div className="relative z-10">
        <HeroPortal />
        <FeaturedShowcase />
        <CraftedLayers />
        <CustomizationSection />
        <ProcessTimeline />
        <GallerySection />
        <FinalCta />
      </div>
    </main>
  );
}
