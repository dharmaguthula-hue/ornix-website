"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// @ts-expect-error - types not available for examples
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// @ts-expect-error - types not available for examples
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";

gsap.registerPlugin(ScrollTrigger);

interface AnimationState {
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  cameraFOV: number;
  cameraTiltY: number;
  modelRotationY: number;
  modelFloatY: number;
  modelScale: number;
  splitAmount: number;
  splitModelScale: number;
  keyLightIntensity: number;
  rimLightIntensity: number;
  centerPointLightIntensity: number;
  particleOpacity: number;
}

interface SceneRefs {
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  modelIdle: THREE.Group | null;
  modelSplit: THREE.Group | null;
  particles: THREE.Points | null;
  keyLight: THREE.SpotLight | null;
  rimLight: THREE.SpotLight | null;
  ambientLight: THREE.Light | null;
  centerPointLight: THREE.PointLight | null;
  rectAreaLight: THREE.RectAreaLight | null;
  canvas: HTMLCanvasElement | null;
  raf: number;
}


function isReducedMotionEnabled() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function createProceduralX() {
  const group = new THREE.Group();

  // Gold emissive material for the X beams
  const material = new THREE.MeshStandardMaterial({
    color: 0x1a1a18,
    metalness: 1.0,
    roughness: 0.15,
    emissive: 0xC9A74E,
    emissiveIntensity: 0.3
  });

  // Create two diagonal beams for the X shape
  const beamGeometry = new THREE.BoxGeometry(0.5, 3.5, 0.5);

  const leftBeam = new THREE.Mesh(beamGeometry, material.clone());
  const rightBeam = new THREE.Mesh(beamGeometry, material.clone());

  leftBeam.rotation.z = Math.PI / 4;
  rightBeam.rotation.z = -Math.PI / 4;

  leftBeam.castShadow = true;
  rightBeam.castShadow = true;

  group.add(leftBeam, rightBeam);
  return group;
}

function createParticleSystem() {
  const particleCount = 300;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 2;
    const radius = 8;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.015,
    color: 0xC9A74E,
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true
  });

  return new THREE.Points(geometry, material);
}

async function loadGLTF(url: string): Promise<THREE.Group | null> {
  interface GLTFScene {
    scene: THREE.Group;
  }

  try {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/draco_wasm_wrapper_v1_4_0/"
    );
    loader.setDRACOLoader(dracoLoader);

    const gltf = await new Promise<GLTFScene>((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });

    const root = gltf.scene;
    root.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.metalness = Math.max(child.material.metalness, 0.75);
          child.material.roughness = Math.min(child.material.roughness, 0.35);
        }
      }
    });

    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3.2 / maxDim;
    root.scale.multiplyScalar(scale);

    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center.multiplyScalar(scale));

    return root;
  } catch (error) {
    console.error(`Failed to load ${url}:`, error);
    return null;
  }
}


export function OrnixCinematicScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const refsRef = useRef<SceneRefs>({
    camera: null,
    renderer: null,
    scene: null,
    modelIdle: null,
    modelSplit: null,
    particles: null,
    keyLight: null,
    rimLight: null,
    ambientLight: null,
    centerPointLight: null,
    rectAreaLight: null,
    canvas: null,
    raf: 0
  });
  const stateRef = useRef<AnimationState>({
    cameraX: 0,
    cameraY: 0,
    cameraZ: 6,
    cameraFOV: 60,
    cameraTiltY: 0,
    modelRotationY: 0,
    modelFloatY: 0,
    modelScale: 1,
    splitAmount: 0,
    splitModelScale: 1,
    keyLightIntensity: 1.5,
    rimLightIntensity: 0.8,
    centerPointLightIntensity: 0.6,
    particleOpacity: 0.4
  });
  const parallaxRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const clockRef = useRef(new THREE.Clock());
  const splitLoadedRef = useRef(false);
  const [phase, setPhase] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Initialize Three.js scene with enhanced lighting and particles
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const isReduced = isReducedMotionEnabled();

    if (isMobile || isReduced) {
      return;
    }

    const refs = refsRef.current;
    const container = containerRef.current;
    if (!container) return;

    // Scene setup - pure black background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 8, 22);

    // Renderer setup with high quality settings
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    refs.canvas = canvas;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    refs.renderer = renderer;
    refs.scene = scene;

    // Camera setup - FOV 60 as per spec
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6);
    refs.camera = camera;

    // Enhanced Lighting Setup - Gold theme
    // Ambient light (dark warm tone)
    const ambientLight = new THREE.AmbientLight(0x1a1208, 0.4);
    scene.add(ambientLight);
    refs.ambientLight = ambientLight;

    // Key spotlight (warm gold from top-right)
    const keyLight = new THREE.SpotLight(0xE8C97A, 1.5);
    keyLight.position.set(3, 5, 3);
    keyLight.angle = 0.4;
    keyLight.penumbra = 0.6;
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);
    refs.keyLight = keyLight;

    // Rim light (secondary gold)
    const rimLight = new THREE.SpotLight(0xC9A74E, 0.8);
    rimLight.position.set(-2, -3, 2);
    scene.add(rimLight);
    refs.rimLight = rimLight;

    // Center point light (gold glow at center)
    const centerPointLight = new THREE.PointLight(0xC9A74E, 0.6);
    centerPointLight.position.set(0, 0, 0);
    scene.add(centerPointLight);
    refs.centerPointLight = centerPointLight;

    // Rect area light for rim lighting effect
    const rectAreaLight = new THREE.RectAreaLight(0xC9A74E, 0.5, 4, 4);
    rectAreaLight.position.set(0, 0, -5);
    scene.add(rectAreaLight);
    refs.rectAreaLight = rectAreaLight;

    // Reflective floor plane
    const groundGeom = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a08,
      metalness: 1,
      roughness: 0,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create and add particle system
    const particles = createParticleSystem();
    scene.add(particles);
    refs.particles = particles;

    // Load idle model
    let idleLoaded = false;
    loadGLTF("/models/X_idle.glb").then((model) => {
      if (model) {
        scene.add(model);
        refs.modelIdle = model;
        idleLoaded = true;
      } else {
        const fallback = createProceduralX();
        scene.add(fallback);
        refs.modelIdle = fallback;
        idleLoaded = true;
      }
    });

    // Handle resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    // Mouse parallax
    const handlePointerMove = (e: PointerEvent) => {
      parallaxRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      parallaxRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", handlePointerMove);

    // Animation loop
    const animate = () => {
      refs.raf = requestAnimationFrame(animate);

      if (!idleLoaded) {
        renderer.render(scene, camera);
        return;
      }

      const state = stateRef.current;
      const elapsed = clockRef.current.getElapsedTime();

      // Update parallax with lerp
      const parallax = parallaxRef.current;
      parallax.x += (parallax.targetX - parallax.x) * 0.05;
      parallax.y += (parallax.targetY - parallax.y) * 0.05;

      // Update camera position with smooth interpolation
      camera.position.x += (state.cameraX + parallax.x * 0.8 - camera.position.x) * 0.06;
      camera.position.y += (state.cameraY - camera.position.y) * 0.06;
      camera.position.z += (state.cameraZ - camera.position.z) * 0.08;

      // Update camera FOV smoothly (for fish-eye effect)
      camera.fov += (state.cameraFOV - camera.fov) * 0.03;
      camera.updateProjectionMatrix();

      // Update camera tilt
      if (state.cameraTiltY !== 0) {
        camera.lookAt(0, state.cameraTiltY * 2, 0);
      } else {
        camera.lookAt(0, 0, 0);
      }

      // Update idle model
      if (refs.modelIdle) {
        refs.modelIdle.rotation.y = state.modelRotationY;
        refs.modelIdle.position.y = state.modelFloatY + Math.sin(elapsed * 1.1) * 0.16;
        refs.modelIdle.scale.setScalar(state.modelScale);
        refs.modelIdle.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material;
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.opacity = 1 - Math.min(state.splitAmount, 1);
              mat.transparent = true;
            }
          }
        });
      }

      // Update split model
      if (refs.modelSplit && state.splitAmount > 0) {
        refs.modelSplit.rotation.y = state.modelRotationY * 0.5;
        refs.modelSplit.scale.setScalar(state.splitModelScale);

        refs.modelSplit.children.forEach((child: THREE.Object3D, index: number) => {
          const directions = [
            [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0],
            [0, 0, 1], [0, 0, -1], [1, 1, 1], [-1, -1, -1]
          ];
          const dir = directions[index % 8];
          const direction = new THREE.Vector3(...dir as [number, number, number]).normalize();
          child.position.copy(direction.multiplyScalar(state.splitAmount * 3));
          child.rotation.set(
            state.modelRotationY * 0.5,
            state.modelRotationY * 0.3,
            state.modelRotationY * 0.2
          );
        });

        // Fade split model in Stage 5
        refs.modelSplit.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material;
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.opacity = state.splitAmount > 0.7 ?
                Math.max(0.08, 1 - (state.splitAmount - 0.7) * 3) : 1;
              mat.transparent = true;
            }
          }
        });
      }

      // Rotate particles slowly
      if (refs.particles) {
        refs.particles.rotation.y += 0.0005;
        const material = refs.particles.material as THREE.PointsMaterial;
        if (material) {
          material.opacity = stateRef.current.particleOpacity;
        }
      }

      // Update lights
      if (refs.keyLight) refs.keyLight.intensity = state.keyLightIntensity;
      if (refs.rimLight) refs.rimLight.intensity = state.rimLightIntensity;
      if (refs.centerPointLight) refs.centerPointLight.intensity = state.centerPointLightIntensity;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      cancelAnimationFrame(refs.raf);
      if (refs.canvas?.parentNode) {
        refs.canvas.parentNode.removeChild(refs.canvas);
      }
      renderer.dispose();
      scene.traverse((obj: THREE.Object3D) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m: THREE.Material) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      if (refs.particles) {
        refs.particles.geometry.dispose();
        (refs.particles.material as THREE.Material).dispose();
      }
    };
  }, []);

  // Setup GSAP scroll timeline - 5 stages
  useEffect(() => {
    const state = stateRef.current;
    const refs = refsRef.current;

    if (!refs.renderer || !refs.modelIdle) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=600%",
        scrub: 1,
        pin: true,
        onUpdate: (self) => {
          const progress = self.progress;
          setScrollProgress(progress);

          // Load split model at 30% progress
          if (progress >= 0.3 && !splitLoadedRef.current) {
            splitLoadedRef.current = true;
            loadGLTF("/models/X_split.glb").then((model) => {
              if (model && refs.scene) {
                refs.scene.add(model);
                refs.modelSplit = model;
              }
            });
          }

          // Phase detection for text overlays
          if (progress < 0.1) setPhase(1);
          else if (progress < 0.3) setPhase(2);
          else if (progress < 0.55) setPhase(3);
          else if (progress < 0.75) setPhase(4);
          else setPhase(5);
        }
      }
    });

    // === STAGE 1: HERO ENTRY (0-10%) ===
    timeline.to(
      state,
      {
        cameraZ: 6,
        cameraFOV: 60,
        modelRotationY: 0.003,
        modelScale: 1,
        keyLightIntensity: 1.5,
        centerPointLightIntensity: 0.6,
        rimLightIntensity: 0.8,
        particleOpacity: 0.4
      },
      0
    );

    // === STAGE 2: HIGHLIGHT (10-30%) ===
    timeline.to(
      state,
      {
        cameraZ: 3,
        modelRotationY: Math.PI * 0.2,
        keyLightIntensity: 2.5,
        centerPointLightIntensity: 0.8,
        rimLightIntensity: 1.1,
        particleOpacity: 0.7
      },
      "+=0.1"
    );

    // === STAGE 3: TRANSFORMATION (30-55%) ===
    // Fade out idle model and explode split model
    timeline.to(
      state,
      {
        splitAmount: 1,
        splitModelScale: 0.9,
        cameraTiltY: -0.2,
        keyLightIntensity: 1.8,
        centerPointLightIntensity: 1.2,
        rimLightIntensity: 0.9,
        particleOpacity: 0.9
      },
      "+=0.2"
    );

    // === STAGE 4: CAMERA PASS THROUGH (55-75%) ===
    timeline.to(
      state,
      {
        cameraZ: -2,
        cameraFOV: 90,
        splitModelScale: 0.3,
        cameraTiltY: 0,
        keyLightIntensity: 0.8,
        centerPointLightIntensity: 2,
        rimLightIntensity: 0.4,
        particleOpacity: 0.5
      },
      "+=0.25"
    );

    // === STAGE 5: BACKGROUND MODE (75-100%) ===
    timeline.to(
      state,
      {
        cameraZ: -6,
        cameraFOV: 60,
        modelRotationY: Math.PI * 0.3,
        keyLightIntensity: 0.6,
        centerPointLightIntensity: 0.3,
        rimLightIntensity: 0.2,
        particleOpacity: 0.2
      },
      "+=0.2"
    );

    return () => {
      timeline.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden">
      {/* Canvas container */}
      <div className="absolute inset-0 w-full h-full" />

      {/* Scroll Progress Indicators */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
        {[1, 2, 3, 4, 5].map((stage) => (
          <div
            key={stage}
            className="w-2 h-2 rounded-full mb-6 transition-all duration-300"
            style={{
              backgroundColor: phase === stage ? "#C9A74E" : "rgba(201, 167, 78, 0.3)",
              boxShadow: phase === stage ? "0 0 12px #C9A74E" : "none",
              transform: phase === stage ? "scale(1.5)" : "scale(1)"
            }}
          />
        ))}
      </div>

      {/* HTML Overlays - Absolutely positioned */}
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none">
        {/* Stage 1: Hero Entry */}
        {phase === 1 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-transition">
            <div className="animate-fade-in">
              <h1 className="text-8xl font-bold text-white mb-8 tracking-[0.24em] font-bebas">
                ORNIX
              </h1>
              <p className="text-2xl text-gray-300 mb-16 font-light tracking-[0.08em]">
                Crafted. Divine. Timeless.
              </p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-gray-400 tracking-[0.08em] animate-pulse">
                  SCROLL TO EXPLORE ↓
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stage 2: Highlight / Futuristic */}
        {phase === 2 && (
          <div className="absolute inset-0 flex items-center justify-center text-center opacity-transition">
            <div className="animate-fade-in">
              <h2
                className="text-9xl font-bold text-white tracking-[0.24em] font-bebas"
                style={{
                  textShadow: "0 0 40px rgba(201, 167, 78, 0.4)",
                  letterSpacing: "0.3em"
                }}
              >
                FUTURISTIC
              </h2>
            </div>
          </div>
        )}

        {/* Stage 5: Vision Section */}
        {phase === 5 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-transition px-8">
            <div className="max-w-2xl">
              <p className="text-xs text-gold tracking-[0.12em] mb-4 font-light">
                OUR VISION
              </p>
              <h3 className="text-6xl font-light text-white mb-6 font-cormorant">
                Beyond Imagination. Built with Purpose.
              </h3>
              <p className="text-lg text-gray-400 mb-12 leading-relaxed font-light">
                We blend art, technology and craftsmanship to create timeless experiences.
              </p>
              <button className="px-8 py-3 border border-gold text-gold text-sm tracking-[0.12em] hover:bg-gold hover:text-black transition-all duration-300 font-light">
                DISCOVER MORE
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-transparent to-black/60" />
    </div>
  );
}
