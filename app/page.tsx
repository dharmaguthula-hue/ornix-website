import { HeroScrollAnimation } from "@/components/hero-scroll-animation";
import { OrnixExtendedSections } from "@/components/ornix-extended-sections";

export default function HomePage() {
  return (
    <main className="relative bg-black text-white">
      <HeroScrollAnimation />
      <OrnixExtendedSections />
    </main>
  );
}
