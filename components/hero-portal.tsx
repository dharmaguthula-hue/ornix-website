"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function ProductPortalCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0.2, 4);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const key = new THREE.PointLight(0xffe4a1, 1.6, 30);
    key.position.set(3, 3, 4);
    scene.add(key);

    const rim = new THREE.PointLight(0x5da9ff, 0.8, 20);
    rim.position.set(-2, 1, -1);
    scene.add(rim);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.12, 24, 120),
      new THREE.MeshStandardMaterial({ color: 0xc9a74e, metalness: 0.85, roughness: 0.2 })
    );
    ring.rotation.x = Math.PI * 0.2;
    scene.add(ring);

    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 0.24, 40),
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.45, roughness: 0.35, emissive: 0x332211, emissiveIntensity: 0.25 })
    );
    plate.rotation.x = Math.PI * 0.5;
    scene.add(plate);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(1.05, 1.35, 64),
      new THREE.MeshBasicMaterial({ color: 0xffdd99, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    halo.position.z = -0.08;
    scene.add(halo);

    let raf = 0;
    const clock = new THREE.Clock();
    const render = () => {
      const t = clock.getElapsedTime();
      ring.rotation.z = t * 0.25;
      plate.rotation.z = -t * 0.22;
      halo.rotation.z = t * 0.3;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    const onResize = () => {
      const { clientWidth, clientHeight } = canvas;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ring.geometry.dispose();
      plate.geometry.dispose();
      halo.geometry.dispose();
      (ring.material as THREE.Material).dispose();
      (plate.material as THREE.Material).dispose();
      (halo.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${active ? "opacity-100" : "opacity-0"}`}
    />
  );
}

export function HeroPortal() {
  const [isActive, setIsActive] = useState(false);
  const { scrollYProgress } = useScroll();
  const zoom = useTransform(scrollYProgress, [0, 0.25], [1, 1.12]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-ornixBlack text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(201,167,78,0.18),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(65,120,200,0.2),transparent_45%)]" />
      <motion.div style={{ scale: zoom }} className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 text-xs uppercase tracking-[0.7em] text-ornixGold/90"
        >
          Crafted. Divine. Timeless.
        </motion.div>
        <motion.h1 className="font-heading text-6xl font-semibold tracking-[0.28em] md:text-8xl" onHoverStart={() => setIsActive(true)} onHoverEnd={() => setIsActive(false)}>
          ORNI
          <span
            onMouseEnter={() => setIsActive(true)}
            onMouseLeave={() => setIsActive(false)}
            className={`relative inline-flex h-[0.95em] w-[0.8em] items-center justify-center align-middle transition-all duration-700 ${isActive ? "scale-105 text-transparent" : "text-white"}`}
          >
            <span className={`absolute inset-0 border transition-all duration-700 ${isActive ? "border-ornixGold shadow-gold" : "border-white/25"}`} />
            <span className="absolute inset-[10%] overflow-hidden">
              <ProductPortalCanvas active={isActive} />
            </span>
            <span className={`relative text-white/90 transition-opacity duration-500 ${isActive ? "opacity-0" : "opacity-100"}`}>X</span>
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-8 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base"
        >
          A premium cinematic showcase for collectible idols, personalized moon nameplates, and bespoke creations designed to make every entrance legendary.
        </motion.p>
      </motion.div>
    </section>
  );
}
