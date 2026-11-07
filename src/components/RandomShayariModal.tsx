"use client";

import React, { useState } from "react";
import {
  X,
  Play,
  Pause,
  Shuffle,
  Copy,
  Check,
  Share2,
  Heart,
  Volume2,
} from "lucide-react";
import { Shayari, SHAYARIS_DATA } from "@/data/shayari";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

interface RandomShayariModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShareStory: (shayari: Shayari) => void;
}

export const RandomShayariModal: React.FC<RandomShayariModalProps> = ({
  isOpen,
  onClose,
  onOpenShareStory,
}) => {
  const { playShayari, activeShayari, isPlaying, toggleFavorite, isFavorite } =
    useAudioPlayer();

  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * SHAYARIS_DATA.length)
  );
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"image" | "text">("image");

  if (!isOpen) return null;

  const shayari = SHAYARIS_DATA[currentIndex];
  const isFav = isFavorite(shayari.id);
  const isThisPlaying = activeShayari?.id === shayari.id && isPlaying;

  const handleNextRandom = () => {
    let nextIdx = Math.floor(Math.random() * SHAYARIS_DATA.length);
    if (nextIdx === currentIndex) {
      nextIdx = (currentIndex + 1) % SHAYARIS_DATA.length;
    }
    setCurrentIndex(nextIdx);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(
      `${shayari.title}\n\n${shayari.text}\n\n— شازیہ (Shazo)`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white border border-[#dec8b2] p-5 sm:p-7 text-[#2d1810] shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#faf6f0] border border-[#dec8b2] text-[#7d6456] hover:text-[#2d1810] hover:bg-[#f5ece0] transition-colors shadow-sm"
          aria-label="बंद करें"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f5ece0] text-[#9c5720] border border-[#dec8b2]">
            {shayari.mood}
          </span>
          <span className="text-xs font-mono text-[#7d6456]">
            सफ़ा #{shayari.page} / 59
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2d1810] mb-3">
          {shayari.title}
        </h3>

        {/* Toggle between Handwritten Image and Typed Text */}
        <div className="flex items-center gap-1.5 p-1 bg-[#ede0d0] rounded-xl border border-[#d8c6b2] mb-4 self-start">
          <button
            onClick={() => setActiveTab("image")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "image"
                ? "bg-[#ede2d4] text-[#2d1810] border border-[#d8c6b2] shadow-sm font-semibold"
                : "text-[#7d6456] hover:text-[#2d1810]"
            }`}
          >
            हस्तलिखित पन्ना
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === "text"
                ? "bg-[#ede2d4] text-[#2d1810] border border-[#d8c6b2] shadow-sm font-semibold"
                : "text-[#7d6456] hover:text-[#2d1810]"
            }`}
          >
            मुद्रित अल्फ़ाज़ (Typed)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[280px] flex items-center justify-center mb-5">
          {activeTab === "image" ? (
            <div className="w-full rounded-2xl overflow-hidden border border-[#dec8b2] shadow-sm bg-[#faf6f0] p-2">
              <img
                src={shayari.image}
                alt={shayari.title}
                className="w-full max-h-[360px] object-contain mx-auto rounded-xl"
                onError={(e) => {
                  if (shayari.fallbackImage) {
                    (e.currentTarget as HTMLImageElement).src = shayari.fallbackImage;
                  }
                }}
              />
            </div>
          ) : (
            <div className="w-full p-6 rounded-2xl bg-[#faf6f0] border border-[#dec8b2] text-center font-hindi leading-relaxed text-sm sm:text-base text-[#2d1810] whitespace-pre-line shadow-inner">
              "{shayari.text}"
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#dec8b2]">
          <div className="flex items-center gap-2">
            {/* Play Button */}
            <button
              onClick={() => playShayari(shayari)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#b86b2b] text-white text-xs font-semibold hover:bg-[#9c5720] active:scale-95 transition-transform shadow-md shadow-[#b86b2b]/25"
            >
              {isThisPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>रोकें</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  <span>सुनें (AI पाठ)</span>
                </>
              )}
            </button>

            {/* Favorite */}
            <button
              onClick={() => toggleFavorite(shayari.id)}
              className={`p-2 rounded-xl border transition-all ${
                isFav
                  ? "bg-rose-50 border-rose-200 text-rose-600"
                  : "bg-white border-[#dec8b2] text-[#7d6456] hover:text-rose-600"
              }`}
              title="पसंदीदा"
            >
              <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
            </button>

            {/* Copy */}
            <button
              onClick={handleCopyText}
              className="p-2 rounded-xl bg-white border border-[#dec8b2] text-[#7d6456] hover:text-[#2d1810] hover:bg-[#f5ece0] transition-colors shadow-sm"
              title="शेर कॉपी करें"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Share Story */}
            <button
              onClick={() => onOpenShareStory(shayari)}
              className="p-2 rounded-xl bg-white border border-[#dec8b2] text-[#7d6456] hover:text-[#2d1810] hover:bg-[#f5ece0] transition-colors shadow-sm"
              title="Instagram Story कार्ड बनाएँ"
            >
              <Share2 className="w-4 h-4 text-[#b86b2b]" />
            </button>
          </div>

          {/* Roll Next Random */}
          <button
            onClick={handleNextRandom}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ede2d4] border border-[#d8c6b2] text-[#2d1810] text-xs font-semibold hover:bg-[#dec8b2] active:scale-95 transition-all ml-auto shadow-sm"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#b86b2b]" />
            <span>एक और रैंडम</span>
          </button>
        </div>
      </div>
    </div>
  );
};
