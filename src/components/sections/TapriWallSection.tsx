"use client";

import React, { useState, useMemo } from "react";
import { Coffee, Play, Heart, Share2, Sparkles, Pin } from "lucide-react";
import { SHAYARIS_DATA, Shayari } from "@/data/shayari";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

interface TapriWallSectionProps {
  onSelectShayari: (shayari: Shayari) => void;
  onOpenShareStory: (shayari: Shayari) => void;
  onOpenAbout: () => void;
}

export const TapriWallSection: React.FC<TapriWallSectionProps> = ({
  onSelectShayari,
  onOpenShareStory,
  onOpenAbout,
}) => {
  const [activeMood, setActiveMood] = useState<string>("All");
  const { playShayari, isFavorite, toggleFavorite } = useAudioPlayer();

  const moodsList = ["All", "Ishq", "Judaai", "Dard", "Umeed", "Chai-wali-raatein"];

  const filteredShayaris = useMemo(() => {
    if (activeMood === "All") return SHAYARIS_DATA;
    return SHAYARIS_DATA.filter((s) => s.mood === activeMood);
  }, [activeMood]);

  // Subtle rotations for pinned notes
  const rotations = ["-rotate-1", "rotate-1", "-rotate-2", "rotate-2", "rotate-0"];

  return (
    <section id="view-wall" className="relative w-full py-16 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#b86b2b] uppercase mb-1 font-semibold">
              <Coffee className="w-3.5 h-3.5" />
              <span>Chai Tapri Wall · चाय की टपरी</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d1810]">
              दीवार पर टंगे काग़ज़ के टुकड़े
            </h2>
            <p className="text-xs sm:text-sm text-[#6e5548] mt-1">
              ढाबे की पुरानी लकड़ी की दीवार पर पिन किए हुए शेर और ख़याल।
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap bg-white border border-[#dec8b2] p-1.5 rounded-2xl shadow-sm">
            {moodsList.map((m) => (
              <button
                key={m}
                onClick={() => setActiveMood(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeMood === m
                    ? "bg-[#ede2d4] text-[#2d1810] border border-[#d8c6b2] font-semibold shadow-sm"
                    : "text-[#6e5548] hover:text-[#2d1810] hover:bg-[#faf6f0]"
                }`}
              >
                {m === "All" ? "सभी शेर" : m}
              </button>
            ))}
          </div>
        </div>

        {/* Pinned Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredShayaris.slice(0, 24).map((shayari, idx) => {
            const rotClass = rotations[idx % rotations.length];
            const isFav = isFavorite(shayari.id);

            return (
              <div
                key={shayari.id}
                onClick={() => onSelectShayari(shayari)}
                className={`group relative rounded-2xl bg-[#fdfbf7] text-[#2d1810] p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer transform ${rotClass} border border-[#dec8b2] hover:z-20`}
                style={{
                  boxShadow:
                    "0 10px 25px -5px rgba(78, 52, 46, 0.08), 0 4px 10px -2px rgba(78, 52, 46, 0.04)",
                }}
              >
                {/* Brass Push Pin */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#e5a759] via-[#b86b2b] to-[#7b431a] shadow-md border border-white/60" />
                </div>

                {/* Note Header */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#7d6456] border-b border-[#e6dacd] pb-2 mb-2">
                  <span className="font-semibold text-[#2d1810]">सफ़ा #{shayari.page}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#f5ece0] text-[#9c5720] font-sans text-[10px] font-semibold border border-[#dec8b2]">
                    {shayari.mood}
                  </span>
                </div>

                {/* Handwritten Image Thumbnail */}
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#faf6f0] mb-3 border border-[#dec8b2]">
                  <img
                    src={shayari.image}
                    alt={shayari.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      if (shayari.fallbackImage) {
                        (e.currentTarget as HTMLImageElement).src = shayari.fallbackImage;
                      }
                    }}
                  />
                </div>

                {/* Title & Excerpt */}
                <h4 className="font-serif font-bold text-sm text-[#2d1810] truncate mb-1">
                  {shayari.title}
                </h4>
                <p className="font-hindi text-xs text-[#6e5548] line-clamp-2 italic leading-relaxed mb-3">
                  "{shayari.text.slice(0, 75)}..."
                </p>

                {/* Card Bottom Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#e6dacd]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playShayari(shayari);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#b86b2b] text-white text-[11px] font-medium hover:bg-[#9c5720] transition-colors shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                    <span>सुनें</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(shayari.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isFav
                          ? "text-rose-600 bg-rose-50"
                          : "text-[#7d6456] hover:text-rose-600"
                      }`}
                      title="पसंदीदा"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenShareStory(shayari);
                      }}
                      className="p-1.5 rounded-lg text-[#7d6456] hover:text-[#b86b2b] transition-colors"
                      title="Story कार्ड बनाएँ"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Meet the Poet Banner */}
        <div className="mt-16 rounded-3xl bg-white border border-[#dec8b2] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-[#b86b2b] font-semibold">
              About the Poet · NH 48
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2d1810]">
              شازیہ (Shazo)
            </h3>
            <p className="text-xs sm:text-sm text-[#6e5548] max-w-xl leading-relaxed">
              लखनऊ–दिल्ली के हाईवे से शुरू हुआ ये सफ़र डायरी के 59 पन्नों तक पहुँचा है।
              हस्तलिखित नज़्में, चाय की चुस्कियां और आवाज़ का जादू।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAbout}
              className="px-5 py-2.5 rounded-xl bg-[#b86b2b] text-white text-xs font-semibold hover:bg-[#9c5720] transition-all shadow-md shadow-[#b86b2b]/25 active:scale-95"
            >
              शायर से मिलें
            </button>
            <a
              href="https://abutalha09.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-white border border-[#dec8b2] text-[#2d1810] text-xs font-semibold hover:bg-[#faf6f0] transition-all shadow-sm"
            >
              पोर्टफोलियो
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
