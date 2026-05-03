"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMemo, useState } from "react";
import { featuredProducts, processSteps, productImages } from "@/lib/data";

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <p className="mb-4 text-xs uppercase tracking-[0.4em] text-ornixGold">{eyebrow}</p>
      <h2 className="font-heading text-3xl font-medium text-white md:text-5xl">{title}</h2>
      <p className="mt-4 text-sm leading-relaxed text-white/70 md:text-base">{description}</p>
    </div>
  );
}

export function FeaturedShowcase() {
  const [activeProduct, setActiveProduct] = useState<(typeof featuredProducts)[number] | null>(null);

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-28">
      <SectionTitle eyebrow="Featured Product Showcase" title="Products that command attention" description="Cinematic cards with depth, glow, and immersive zoom detail." />
      <div className="grid gap-8 md:grid-cols-3">
        {featuredProducts.map((item, idx) => (
          <motion.button
            key={item.name}
            whileHover={{ y: -8, rotateX: 4, rotateY: -4, boxShadow: "0 18px 40px rgba(201,167,78,0.24)" }}
            transition={{ duration: 0.4 }}
            onClick={() => setActiveProduct(item)}
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-3 text-left backdrop-blur-sm"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" priority={idx === 0} />
            </div>
            <h3 className="mt-4 font-heading text-xl text-white">{item.name}</h3>
            <p className="mt-2 text-sm text-white/65">{item.description}</p>
          </motion.button>
        ))}
      </div>

      {activeProduct && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5" onClick={() => setActiveProduct(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#121212]" onClick={(e) => e.stopPropagation()}>
            <div className="grid md:grid-cols-2">
              <div className="relative min-h-[420px]">
                <Image src={activeProduct.image} alt={activeProduct.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>
              <div className="flex flex-col justify-center p-8">
                <p className="text-xs uppercase tracking-[0.35em] text-ornixGold">Zoomed View</p>
                <h3 className="mt-4 font-heading text-4xl text-white">{activeProduct.name}</h3>
                <p className="mt-4 text-white/70">{activeProduct.description}</p>
                <button className="mt-8 w-fit rounded-full border border-ornixGold/70 px-6 py-3 text-sm text-ornixGold">Enquire Now</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}

export function CraftedLayers() {
  const layers = useMemo(() => ["Surface Finish", "Core Structure", "Lighting Core", "Base Balance"], []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <SectionTitle eyebrow="Crafted In Layers" title="Built like a cinematic object" description="Each component fades in as if an exploded assembly is unfolding in front of you." />
      <div className="relative mx-auto max-w-xl space-y-6">
        {layers.map((layer, index) => (
          <motion.div key={layer} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ delay: index * 0.15, duration: 0.8 }} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-soft">
            <p className="text-xs uppercase tracking-[0.3em] text-ornixGold/90">Layer {index + 1}</p>
            <h4 className="mt-2 font-heading text-2xl text-white">{layer}</h4>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function CustomizationSection() {
  const [name, setName] = useState("ORNIX");

  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <SectionTitle eyebrow="Customization" title="Personalize your signature glow" description="Type a name and preview a premium engraved moon nameplate in real time." />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <label className="mb-3 block text-xs uppercase tracking-[0.3em] text-ornixGold">Enter Name</label>
          <input value={name} onChange={(e) => setName(e.target.value.toUpperCase())} maxLength={16} className="w-full rounded-xl border border-white/20 bg-[#151515] px-4 py-3 text-white outline-none focus:border-ornixGold" placeholder="Type your name" />
          <p className="mt-3 text-sm text-white/60">Live preview updates instantly for consultation-ready mockups.</p>
        </div>
        <div className="rounded-3xl border border-ornixGold/40 bg-gradient-to-br from-[#1b1b1b] to-[#101010] p-8 shadow-gold">
          <p className="text-xs uppercase tracking-[0.3em] text-ornixGold/80">Moon LED Preview</p>
          <div className="mt-6 rounded-full border border-ornixGold/60 px-8 py-10 text-center shadow-[0_0_40px_rgba(201,167,78,0.35)]">
            <p className="font-heading text-4xl text-[#f3dfad] md:text-5xl">{name || "ORNIX"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProcessTimeline() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <SectionTitle eyebrow="Process Reel" title="From concept to collectible" description="A premium timeline revealing every stage in the ORNIX process." />
      <div className="grid gap-6 md:grid-cols-4">
        {processSteps.map((step, index) => (
          <motion.div key={step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ delay: index * 0.12, duration: 0.55 }} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-ornixGold">0{index + 1}</p>
            <h4 className="mt-4 font-heading text-2xl text-white">{step}</h4>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function GallerySection() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <SectionTitle eyebrow="Gallery" title="Instagram-style cinematic wall" description="Masonry-inspired visual feed with premium hover light sweep." />
      <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
        {productImages.map((src) => (
          <motion.button key={src} whileHover={{ y: -5 }} onClick={() => setActive(src)} className="group relative mb-4 block w-full overflow-hidden rounded-2xl border border-white/10">
            <Image src={src} alt="ORNIX gallery object" width={900} height={1200} className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
          </motion.button>
        ))}
      </div>

      {active && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setActive(null)}>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="relative h-[86vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={active} alt="Fullscreen ORNIX gallery view" fill className="rounded-2xl object-contain" sizes="100vw" />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}

export function FinalCta() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <section className="relative px-6 py-36">
      <motion.div style={{ y }} className="mx-auto max-w-5xl rounded-[2rem] border border-ornixGold/40 bg-gradient-to-b from-[#1b1b1b] to-[#0f0f0f] p-12 text-center shadow-gold">
        <h2 className="font-heading text-4xl text-white md:text-6xl">Make Your Entrance Legendary</h2>
        <p className="mx-auto mt-5 max-w-2xl text-white/70">Tell us your vision. ORNIX crafts signature collectibles designed to become the centerpiece of your space.</p>
        <button className="mt-9 rounded-full bg-ornixGold px-8 py-4 text-sm font-semibold text-[#121212] shadow-[0_0_35px_rgba(201,167,78,0.45)] transition hover:scale-105">Start Your Custom Build</button>
      </motion.div>
    </section>
  );
}
