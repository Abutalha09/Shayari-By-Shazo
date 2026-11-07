"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Play,
  Pause,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Volume2,
  Sparkles,
} from "lucide-react";
import { Shayari, SHAYARIS_DATA } from "@/data/shayari";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

interface ShayariDetailModalProps {
  isOpen: boolean;
  shayari: Shayari | null;
  onClose: () => void;
  onOpenShareStory: (shayari: Shayari) => void;
}

export const ShayariDetailModal: React.FC<ShayariDetailModalProps> = ({
  isOpen,
  shayari,
  onClose,
  onOpenShareStory,
}) => {
  const [viewMode, setViewMode] = useState<"handwritten" | "typed">("handwritten");
  const { playShayari, isPlaying, activeShayari, togglePlay, toggleFavorite, isFavorite } =
    useAudioPlayer();

  useEffect(() => {
    setViewMode("handwritten");
  }, [shayari]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !shayari) return;
      if (e.key === "Escape") onClose();
      if (e.key === "t" || e.key === "T") {
        setViewMode((prev) => (prev === "handwritten" ? "typed" : "handwritten"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, shayari, onClose]);

  if (!isOpen || !shayari) return null;

  const isCurrentActive = activeShayari?.id === shayari.id;
  const isCurrentPlaying = isCurrentActive && isPlaying;
  const isFav = isFavorite(shayari.id);

  const currentIndex = SHAYARIS_DATA.findIndex((s) => s.id === shayari.id);
  const prevShayari =
    currentIndex > 0 ? SHAYARIS_DATA[currentIndex - 1] : SHAYARIS_DATA[SHAYARIS_DATA.length - 1];
  const nextShayari =
    currentIndex < SHAYARIS_DATA.length - 1 ? SHAYARIS_DATA[currentIndex + 1] : SHAYARIS_DATA[0];

  const handlePlayToggle = () => {
    if (isCurrentActive) {
      togglePlay();
    } else {
      playShayari(shayari);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={shayari.title}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white border border-[#dec8b2] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-[#2d1810]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 rounded-full bg-white/90 text-[#7d6456] hover:text-[#2d1810] hover:bg-white transition-colors border border-[#dec8b2] shadow-sm"
          title="बंद करें (Esc)"
          aria-label="बंद करें"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Handwritten Notebook Sheet & Flip Switch */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col items-center justify-center bg-[#faf6f0] border-b md:border-b-0 md:border-r border-[#dec8b2]">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[3/4] rounded-2xl overflow-hidden select-none bg-[#fbf7ee] text-[#1c120c] shadow-xl border border-[#d8c39e] flex flex-col">
            {/* Top Spiral Rings */}
            <div className="flex justify-between items-center px-3 py-1.5 border-b border-[#e6d5b8] bg-[#f4ebd9]/90">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-[#3e2415]/75 shadow-inner border border-amber-200/40"
                />
              ))}
            </div>

            {/* Notebook Content */}
            <div className="flex-1 relative p-3 sm:p-4 overflow-hidden flex items-center justify-center">
              {viewMode === "handwritten" ? (
                <img
                  src={shayari.image}
                  alt={shayari.title}
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    if (shayari.fallbackImage) {
                      (e.currentTarget as HTMLImageElement).src = shayari.fallbackImage;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full p-3 sm:p-4 rounded-xl bg-white/80 border border-[#dec8b2] overflow-y-auto font-hindi text-sm sm:text-base leading-relaxed text-[#2d1810] whitespace-pre-line font-medium shadow-inner">
                  {shayari.text}
                  <div className="mt-4 pt-3 border-t border-[#e6dacd] flex items-center justify-between text-xs text-[#7d6456]">
                    <span>सफ़ा #{shayari.page}</span>
                    <span className="font-serif">✍️ شازیہ</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Toggle View Pills */}
          <div className="mt-4 flex items-center gap-1.5 p-1 rounded-full bg-[#ede0d0] border border-[#d8c6b2]">
            <button
              onClick={() => setViewMode("handwritten")}
              className={`px-4 py-1.5 rounded-full text-xs font-hindi font-medium transition-all ${
                viewMode === "handwritten"
                  ? "bg-[#ede2d4] text-[#2d1810] border border-[#d8c6b2] shadow-sm font-semibold"
                  : "text-[#7d6456] hover:text-[#2d1810]"
              }`}
            >
              ✍️ लिखावट
            </button>
            <button
              onClick={() => setViewMode("typed")}
              className={`px-4 py-1.5 rounded-full text-xs font-hindi font-medium transition-all ${
                viewMode === "typed"
                  ? "bg-[#ede2d4] text-[#2d1810] border border-[#d8c6b2] shadow-sm font-semibold"
                  : "text-[#7d6456] hover:text-[#2d1810]"
              }`}
            >
              📖 मुद्रित टेक्स्ट
            </button>
          </div>
        </div>

        {/* Right Side: Metadata, Recital CTA, Actions & Pager */}
        <div className="w-full md:w-[380px] p-5 sm:p-7 flex flex-col justify-between overflow-y-auto bg-white">
          <div>
            {/* Header badges */}
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f5ece0] text-[#9c5720] border border-[#dec8b2] font-hindi">
                {shayari.mood}
              </span>
              <span className="text-xs text-[#7d6456] font-mono">सफ़ा #{shayari.page}</span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2d1810] mb-3 leading-snug">
              {shayari.title}
            </h3>

            {/* Excerpt */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#faf6f0] border border-[#dec8b2] mb-6 shadow-sm">
              <p className="font-hindi text-xs sm:text-sm text-[#5a4235] line-clamp-4 leading-relaxed italic">
                "{shayari.text.slice(0, 150)}..."
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-3 pt-3 border-t border-[#dec8b2]">
            {/* Big Audio Play Button */}
            <button
              onClick={handlePlayToggle}
              className={`w-full flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl font-semibold font-hindi text-sm shadow-md transition-all active:scale-[0.98] ${
                isCurrentPlaying
                  ? "bg-[#7b431a] text-white shadow-[#7b431a]/30"
                  : "bg-[#b86b2b] hover:bg-[#9c5720] text-white shadow-[#b86b2b]/25"
              }`}
            >
              {isCurrentPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>ऑडियो रोकें (Pause)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>शेर सुनें (AI पाठ / रिकॉर्डिंग)</span>
                </>
              )}
            </button>

            {/* Secondary Actions: Share & Favorite */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenShareStory(shayari)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#f5ece0] text-[#6e5548] border border-[#dec8b2] text-xs font-hindi transition-colors shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5 text-[#b86b2b]" />
                <span>Story बनाएँ</span>
              </button>

              <button
                onClick={() => toggleFavorite(shayari.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-hindi transition-colors shadow-sm ${
                  isFav
                    ? "bg-rose-50 border-rose-200 text-rose-600 font-medium"
                    : "bg-white hover:bg-[#f5ece0] text-[#6e5548] border-[#dec8b2]"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
                <span>{isFav ? "पसंदीदा" : "पसंद करें"}</span>
              </button>
            </div>

            {/* Prev / Next Pagination */}
            <div className="flex items-center justify-between pt-3 border-t border-[#e6dacd] text-xs text-[#7d6456]">
              <button
                onClick={() => playShayari(prevShayari)}
                className="flex items-center gap-1 hover:text-[#b86b2b] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>सफ़ा #{prevShayari.page}</span>
              </button>

              <span className="font-mono text-[11px] text-[#9c5720]">
                {shayari.page} / {SHAYARIS_DATA.length}
              </span>

              <button
                onClick={() => playShayari(nextShayari)}
                className="flex items-center gap-1 hover:text-[#b86b2b] transition-colors"
              >
                <span>सफ़ा #{nextShayari.page}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

