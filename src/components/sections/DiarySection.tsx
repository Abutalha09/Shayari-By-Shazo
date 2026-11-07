"use client";

import React, { useState, useMemo } from "react";
import { ClothingRailHero, RailGarment } from "@/components/ui/product-rail-gallery";
import { SHAYARIS_DATA, Shayari } from "@/data/shayari";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { ChevronLeft, ChevronRight, BookOpen, Sparkles } from "lucide-react";

interface DiarySectionProps {
  onOpenShareStory: (shayari: Shayari) => void;
}

const PAGE_SIZE = 10;

export const DiarySection: React.FC<DiarySectionProps> = ({ onOpenShareStory }) => {
  const [currentPageSet, setCurrentPageSet] = useState(0);
  const { playShayari, toggleFavorite, isFavorite } = useAudioPlayer();

  const totalSets = Math.ceil(SHAYARIS_DATA.length / PAGE_SIZE);

  const startIdx = currentPageSet * PAGE_SIZE;
  const currentShayaris = useMemo(
    () => SHAYARIS_DATA.slice(startIdx, startIdx + PAGE_SIZE),
    [startIdx]
  );

  const pageRangeLabel = `सफ़ा ${startIdx + 1}–${Math.min(
    startIdx + PAGE_SIZE,
    SHAYARIS_DATA.length
  )} / ${SHAYARIS_DATA.length}`;

  // Map to RailGarment items
  const railItems: RailGarment[] = useMemo(() => {
    return currentShayaris.map((shayari) => {
      // First 2 lines for short description
      const lines = shayari.text.split("\n").filter((l) => l.trim().length > 0);
      const shortExcerpt = lines.slice(0, 3).join("\n");

      return {
        id: `shayari-${shayari.id}`,
        name: shayari.title,
        kind: "page",
        tag: shayari.mood,
        description: shortExcerpt,
        details: [
          `सफ़ा #${shayari.page}`,
          `मूड: ${shayari.mood}`,
          `पसंद: ${shayari.likes}`,
          "क़लम: شازیہ",
        ],
        image: shayari.image,
        backImage: shayari.text, // Typed Hindi text passed as back
        rawItem: shayari,
      };
    });
  }, [currentShayaris]);

  const handlePrevSet = () => {
    if (currentPageSet > 0) setCurrentPageSet((prev) => prev - 1);
  };

  const handleNextSet = () => {
    if (currentPageSet < totalSets - 1) setCurrentPageSet((prev) => prev + 1);
  };

  return (
    <section id="view-diary" className="relative w-full pt-10 pb-16 scroll-mt-24">
      {/* Section Sub-Header & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#b86b2b] uppercase mb-1 font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Digital Notebook · हस्तलिखित डायरी</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d1810]">
            क़लम और काग़ज़ के पन्ने
          </h2>
          <p className="text-xs sm:text-sm text-[#6e5548] mt-1 max-w-xl">
            पन्नों को ड्रैग करें, क्लिक करके लिखावट या मुद्रित रूप (Front/Back) देखें।
          </p>
        </div>

        {/* Page Set Pagination Bar */}
        <div className="flex items-center gap-2 bg-white border border-[#dec8b2] px-3 py-1.5 rounded-2xl shadow-sm">
          <button
            onClick={handlePrevSet}
            disabled={currentPageSet === 0}
            className="p-1.5 rounded-xl text-[#7d6456] hover:text-[#2d1810] disabled:opacity-30 disabled:pointer-events-none hover:bg-[#f5ece0] transition-colors"
            title="पिछले पन्ने"
            aria-label="पिछले पन्ने"
          >
            <ChevronLeft className="w-4 h-4 text-[#b86b2b]" />
          </button>

          <span className="text-xs font-mono font-medium text-[#2d1810] px-2 min-w-[120px] text-center">
            {pageRangeLabel}
          </span>

          <button
            onClick={handleNextSet}
            disabled={currentPageSet === totalSets - 1}
            className="p-1.5 rounded-xl text-[#7d6456] hover:text-[#2d1810] disabled:opacity-30 disabled:pointer-events-none hover:bg-[#f5ece0] transition-colors"
            title="अगले पन्ने"
            aria-label="अगले पन्ने"
          >
            <ChevronRight className="w-4 h-4 text-[#b86b2b]" />
          </button>
        </div>
      </div>

      {/* Pre-built ProductRailGallery Component */}
      <ClothingRailHero
        items={railItems}
        hanger="brass"
        labels={{
          front: "लिखावट",
          back: "मुद्रित टेक्स्ट",
          close: "बंद करें",
          show: "बड़ा करें",
        }}
        currentPageRange={pageRangeLabel}
        hasPrevPageSet={currentPageSet > 0}
        hasNextPageSet={currentPageSet < totalSets - 1}
        onPrevPageSet={handlePrevSet}
        onNextPageSet={handleNextSet}
        onPlayItem={(item) => {
          if (item.rawItem) playShayari(item.rawItem);
        }}
        onShareItem={(item) => {
          if (item.rawItem) onOpenShareStory(item.rawItem);
        }}
        onToggleFav={(item) => {
          if (item.rawItem) toggleFavorite(item.rawItem.id);
        }}
        isFav={(item) => {
          return item.rawItem ? isFavorite(item.rawItem.id) : false;
        }}
      />
    </section>
  );
};

