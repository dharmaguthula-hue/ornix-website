"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type SceneState = {
  split: number;
  glow: number;
  cameraZ: number;
  rotateY: number;
  rotateX: number;
  streaks: number;
};

const CATEGORIES = ["Idols", "Jewellery", "Collectibles", "Custom Creations"];

function isReducedMotionEnabled() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function OrnixExperience() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const streakRef = useRef<HTMLDivElement | null>(null);

  const categoryCards = useMemo(
    () =>
      CATEGORIES.map((title) => (
        <article key={title} className="ornix-card group">
          <div className="ornix-card-inner">
            <p className="ornix-card-kicker">ORNIX Category</p>
            <h3>{title}</h3>
          </div>
        </article>
      )),
    []
  );

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const isMobile = window.innerWidth < 768;
    const reduced = isReducedMotionEnabled();
    if (isMobile || reduced) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const keyLight = new THREE.SpotLight(0xbde1ff, 3.5, 35, Math.PI * 0.16, 0.5);
    keyLight.position.set(0.4, 2.8, 6.5);
    scene.add(keyLight);

    const fill = new THREE.PointLight(0x2c5cff, 1.4, 20);
    fill.position.set(-3, -1, 3);
    scene.add(fill);

    const rim = new THREE.PointLight(0x88ccff, 1, 16);
    rim.position.set(2, 1.5, -2);
    scene.add(rim);

    const xRoot = new THREE.Group();
    scene.add(xRoot);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x9ca9bd,
      metalness: 0.95,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.2,
      emissive: 0x2c5cff,
      emissiveIntensity: 1
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x5ca2ff,
      transparent: true,
      opacity: 0.2
    });

    const barGeometry = new THREE.BoxGeometry(0.55, 3.8, 0.55);
    const leftArm = new THREE.Mesh(barGeometry, material);
    const rightArm = new THREE.Mesh(barGeometry, material.clone());
    leftArm.rotation.z = Math.PI / 4;
    rightArm.rotation.z = -Math.PI / 4;
    xRoot.add(leftArm, rightArm);

    const leftGlow = new THREE.Mesh(barGeometry, glowMaterial);
    const rightGlow = new THREE.Mesh(barGeometry, glowMaterial.clone());
    leftGlow.scale.set(1.15, 1.05, 1.15);
    rightGlow.scale.set(1.15, 1.05, 1.15);
    leftGlow.rotation.copy(leftArm.rotation);
    rightGlow.rotation.copy(rightArm.rotation);
    xRoot.add(leftGlow, rightGlow);

    const state: SceneState = {
      split: 0,
      glow: 1,
      cameraZ: 6,
      rotateY: 0,
      rotateX: 0,
      streaks: 0
    };

    const resize = () => {
      const width = section.clientWidth;
      const height = section.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      pointer.x = x;
      pointer.y = y;
    };
    window.addEventListener("pointermove", onPointerMove);

    const clock = new THREE.Clock();
    let raf = 0;
    const render = () => {
      const t = clock.getElapsedTime();
      const pulse = 0.8 + Math.sin(t * 1.8) * 0.18;
      const floatY = Math.sin(t * 1.1) * 0.16;

      // Idle animation keeps the object alive while scroll is inactive.
      xRoot.position.y = floatY;
      xRoot.rotation.x = state.rotateX + pointer.y * 0.12;
      xRoot.rotation.y = state.rotateY + pointer.x * 0.2;

      leftArm.position.x = -state.split;
      rightArm.position.x = state.split;
      leftGlow.position.x = -state.split;
      rightGlow.position.x = state.split;

      (leftArm.material as THREE.MeshPhysicalMaterial).emissiveIntensity = state.glow * pulse;
      (rightArm.material as THREE.MeshPhysicalMaterial).emissiveIntensity = state.glow * pulse;
      leftGlow.material.opacity = 0.12 + state.glow * 0.16;
      rightGlow.material.opacity = 0.12 + state.glow * 0.16;

      camera.position.z = state.cameraZ;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    const cards = cardsRef.current;
    const streaks = streakRef.current;

    // Main scroll timeline: rotate, zoom, split the X, then reveal cards.
    const timeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=220%",
        scrub: 1,
        pin: true,
        onUpdate: () => {
          // Unused scroll tracking code removed
        }
      }
    });

    timeline
      .to(state, { rotateY: Math.PI * 0.35, rotateX: Math.PI * 0.16, duration: 1 }, 0)
      .to(state, { glow: 1.8, duration: 1 }, 0.12)
      .to(state, { cameraZ: 3.4, duration: 1.2 }, 0.2)
      .to(state, { split: 1.05, duration: 1.1 }, 0.95)
      .to(state, { streaks: 1, duration: 0.65 }, 0.95);

    if (cards) {
      timeline.fromTo(
        cards.children,
        {
          opacity: 0,
          y: 55,
          scale: 0.88,
          rotateX: 20
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          stagger: 0.08,
          duration: 0.7
        },
        1.45
      );
    }

    const streakTween =
      streaks &&
      gsap.to(streaks, {
        opacity: 1,
        duration: 0.4,
        paused: true
      });

    const syncStreaks = () => {
      if (!streaks || !streakTween) return;
      streakTween.progress(Math.min(state.streaks, 1));
      streaks.style.transform = `translate3d(0, ${state.streaks * -26}px, 0)`;
    };

    gsap.ticker.add(syncStreaks);

    return () => {
      gsap.ticker.remove(syncStreaks);
      timeline.kill();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

      barGeometry.dispose();
      material.dispose();
      (rightArm.material as THREE.Material).dispose();
      glowMaterial.dispose();
      (rightGlow.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section ref={sectionRef} className="ornix-hero">
      <canvas ref={canvasRef} className="ornix-canvas" />

      <div className="ornix-cinematic-vignette" />

      <div className="ornix-content">
        <p className="ornix-eyebrow">Luxury Objects. Futuristic Presence.</p>
        <h1 className="ornix-title">
          ORNI<span>X</span>
        </h1>
        <p className="ornix-subtitle">A premium 3D showcase where ORNIX opens into curated worlds of craftsmanship.</p>
      </div>

      <div ref={streakRef} className="ornix-streaks" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <div ref={cardsRef} className="ornix-cards">
        {categoryCards}
      </div>
    </section>
  );
}
