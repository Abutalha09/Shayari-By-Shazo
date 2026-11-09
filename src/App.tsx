"use client";

import React, { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { FloatingPlayer } from "@/components/FloatingPlayer";
import { AboutModal } from "@/components/AboutModal";
import { ShareStoryModal } from "@/components/ShareStoryModal";
import { RandomShayariModal } from "@/components/RandomShayariModal";
import { ShayariDetailModal } from "@/components/ShayariDetailModal";
import { DiarySection } from "@/components/sections/DiarySection";
import { MoodsOrbitSection } from "@/components/sections/MoodsOrbitSection";
import { NaatSection } from "@/components/sections/NaatSection";
import { SkySection } from "@/components/sections/SkySection";
import { TapriWallSection } from "@/components/sections/TapriWallSection";
import { AudioPlayerProvider, useAudioPlayer } from "@/context/AudioPlayerContext";
import { Shayari } from "@/data/shayari";
import { Feather, Heart, ArrowUp, Sparkles, Volume2, Play, Pause } from "lucide-react";

const MainContent: React.FC = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isRandomOpen, setIsRandomOpen] = useState(false);
  const [shareStoryShayari, setShareStoryShayari] = useState<Shayari | null>(null);
  const [detailShayari, setDetailShayari] = useState<Shayari | null>(null);
  const [activeSection, setActiveSection] = useState("view-diary");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { playShayari, isPlaying, activeShayari, toggleFavorite, isFavorite } =
    useAudioPlayer();

  // Scroll spy to highlight active tab in header
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const sections = ["view-diary", "view-moods", "view-naat", "view-sky", "view-wall"];
      const scrollPos = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-[#f7f2ea] text-[#2d1810] selection:bg-[#b86b2b]/20 selection:text-[#2d1810] pb-32">
      {/* Subtle Grain Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025] z-50 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Sticky Header */}
      <SiteHeader
        activeSection={activeSection}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenRandom={() => setIsRandomOpen(true)}
      />

      {/* Hero Intro Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#dec8b2] text-xs font-medium text-[#b86b2b] shadow-sm mb-4">
          <Feather className="w-3.5 h-3.5" />
          <span>हाथ से लिखी शायरियों की डिजिटल डायरी</span>
          <span className="text-[#dec8b2]">·</span>
          <span>59 तहरीरें</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-[#2d1810] tracking-tight mb-3">
          रात, चाय और क़लम के शेर
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-[#6e5548] max-w-2xl mx-auto font-sans leading-relaxed">
          شازیہ (Shazo) के हाथों से लिखी डायरी के पन्ने, हाईवे (NH 48) का सन्नाटा और आवाज़ का अहसास।
        </p>
      </div>

      {/* Main Sections */}
      <main className="space-y-16">
        {/* Section 1: Diary (Product Rail Gallery) */}
        <DiarySection onOpenShareStory={(s) => setShareStoryShayari(s)} />

        {/* Section 2: 5 Moods (Dish Orbit Carousel) */}
        <MoodsOrbitSection />

        {/* Section 3: Shazo's Favourite Naat-o-Kalaam */}
        <NaatSection />

        {/* Section 4: Midnight Sky (Stars Constellation) */}
        <SkySection
          onOpenShareStory={(s) => setShareStoryShayari(s)}
          onSelectShayari={(s) => setDetailShayari(s)}
        />

        {/* Section 4: Chai Tapri Wall */}
        <TapriWallSection
          onSelectShayari={(s) => setDetailShayari(s)}
          onOpenShareStory={(s) => setShareStoryShayari(s)}
          onOpenAbout={() => setIsAboutOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-[#e6dacd] py-12 bg-[#faf5ee] text-center text-xs text-[#6e5548] space-y-2.5">
        <p className="font-serif text-[#2d1810] text-base font-bold">
          शायरी BY <span className="text-[#b86b2b]">شازیہ (Shazo)</span>
        </p>
        <p className="text-xs text-[#7d6456]">NH 48 · कानपुर–मुंबई · ऑल राइट्स रिज़र्व्ड</p>
        <p className="text-[11px] text-[#7d6456]/80 pt-1">
          पोर्टफोलियो:{" "}
          <a
            href="https://abutalha09.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#b86b2b] hover:underline font-medium"
          >
            abutalha09.vercel.app
          </a>
        </p>
      </footer>

      {/* Floating Bottom Music Player */}
      <FloatingPlayer />

      {/* Scroll to Top Floating Pill */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-5 z-30 p-3 rounded-full bg-white border border-[#dec8b2] text-[#b86b2b] hover:bg-[#b86b2b] hover:text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          title="ऊपर जाएँ"
          aria-label="ऊपर जाएँ"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Modals */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <RandomShayariModal
        isOpen={isRandomOpen}
        onClose={() => setIsRandomOpen(false)}
        onOpenShareStory={(s) => setShareStoryShayari(s)}
      />

      {shareStoryShayari && (
        <ShareStoryModal
          isOpen={true}
          shayari={shareStoryShayari}
          onClose={() => setShareStoryShayari(null)}
        />
      )}

      {detailShayari && (
        <ShayariDetailModal
          isOpen={true}
          shayari={detailShayari}
          onClose={() => setDetailShayari(null)}
          onOpenShareStory={(s) => setShareStoryShayari(s)}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AudioPlayerProvider>
      <MainContent />
    </AudioPlayerProvider>
  );
}

export default App;
