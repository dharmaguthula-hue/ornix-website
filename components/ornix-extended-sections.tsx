"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const pillars = [
  {
    title: "Idols",
    text: "Statement pieces engineered with museum-grade finishing, cinematic silhouette, and precision detailing."
  },
  {
    title: "Jewellery",
    text: "Sculpted forms and refined surfaces designed to feel timeless, modern, and unmistakably premium."
  },
  {
    title: "Collectibles",
    text: "Limited-run artifacts with serialized identity, crafted to become legacy objects in your space."
  },
  {
    title: "Custom Creations",
    text: "One-of-one commissions with your narrative embedded into geometry, material, and light."
  }
];

const milestones = [
  "Concept architecture and visual language",
  "Material prototyping and precision refinement",
  "Light-response calibration and texture finishing",
  "Presentation-grade delivery and white-glove handoff"
];

export function OrnixExtendedSections() {
  const extendedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = extendedRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      () => {
        // Intersection observer for extended sections
      },
      { threshold: [0, 0.1, 0.35, 0.6, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={extendedRef} className="ornix-extended">
      <section className="ornix-panel ornix-panel-intro">
        <motion.p initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.6 }} className="ornix-section-kicker">
          The ORNIX Signature
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="ornix-section-title"
        >
          Luxury as engineered storytelling.
        </motion.h2>
        <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.8, delay: 0.18 }} className="ornix-section-text">
          Every ORNIX object is designed to hold attention from first glance to close inspection. Form, light, and surface work together as one cinematic composition.
        </motion.p>
      </section>

      <section className="ornix-panel">
        <div className="ornix-grid-2">
          <motion.div initial={{ opacity: 0, x: -22 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: 0.75 }} className="ornix-glass-block">
            <p className="ornix-section-kicker">Materials & Finish</p>
            <h3>Designed for depth, not noise.</h3>
            <p>
              Layered materials, controlled reflections, and restrained glow create a powerful aesthetic that feels modern without looking temporary.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 22 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: 0.75, delay: 0.1 }} className="ornix-light-well">
            <span />
            <span />
            <span />
          </motion.div>
        </div>
      </section>

      <section className="ornix-panel">
        <p className="ornix-section-kicker">Product Universes</p>
        <h3 className="ornix-section-title-sm">Curated categories with unique character.</h3>
        <div className="ornix-pillars">
          {pillars.map((pillar, index) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 24, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.65, delay: index * 0.08 }}
              className="ornix-pillar-card"
            >
              <p className="ornix-pillars-index">0{index + 1}</p>
              <h4>{pillar.title}</h4>
              <p>{pillar.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="ornix-panel">
        <div className="ornix-process">
          <div>
            <p className="ornix-section-kicker">Craft Process</p>
            <h3 className="ornix-section-title-sm">From vision to heirloom-grade object.</h3>
          </div>
          <div className="ornix-milestones">
            {milestones.map((item, index) => (
              <motion.div key={item} initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.55, delay: index * 0.08 }} className="ornix-milestone">
                <span>0{index + 1}</span>
                <p>{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="ornix-panel ornix-final-cta">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.7 }} className="ornix-cta-shell">
          <p className="ornix-section-kicker">Private Commission</p>
          <h3>Build your signature ORNIX piece.</h3>
          <p>Collaborate with our design team to shape a custom creation defined by your identity and space.</p>
          <button type="button">Begin Consultation</button>
        </motion.div>
      </section>
    </div>
  );
}
