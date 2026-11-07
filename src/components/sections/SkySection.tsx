"use client";

import React, { useState, useMemo } from "react";
import { Moon, Sparkles, Play, Heart, Share2, Info } from "lucide-react";
import { SHAYARIS_DATA, Shayari } from "@/data/shayari";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

interface SkySectionProps {
  onOpenShareStory: (shayari: Shayari) => void;
  onSelectShayari: (shayari: Shayari) => void;
}

export const SkySection: React.FC<SkySectionProps> = ({
  onOpenShareStory,
  onSelectShayari,
}) => {
  const [selectedMood, setSelectedMood] = useState<string>("All");
  const [hoveredShayari, setHoveredShayari] = useState<Shayari | null>(null);
  const { playShayari, isPlaying, activeShayari } = useAudioPlayer();

  // Generate deterministic coordinates for all 59 shayaris based on their id
  const starNodes = useMemo(() => {
    return SHAYARIS_DATA.map((s, idx) => {
      const seed = (s.id * 9301 + 49297) % 233280;
      const seed2 = (s.id * 49297 + 9301) % 233280;
      const x = 6 + (seed / 233280) * 88;
      const y = 8 + (seed2 / 233280) * 84;

      // Color mapping by mood
      let color = "#f6a94b"; // Golden Chai
      if (s.mood === "Ishq") color = "#f43f5e"; // Rose Red
      else if (s.mood === "Judaai" || s.mood === "Dard") color = "#60a5fa"; // Melancholy Blue
      else if (s.mood === "Chai-wali-raatein") color = "#fbbf24"; // Warm Amber
      else if (s.mood === "Umeed") color = "#34d399"; // Hope Green

      return {
        ...s,
        x,
        y,
        color,
        size: idx % 3 === 0 ? 13 : idx % 2 === 0 ? 10 : 8,
      };
    });
  }, []);

  const filteredStars = useMemo(() => {
    if (selectedMood === "All") return starNodes;
    return starNodes.filter((s) => s.mood === selectedMood);
  }, [starNodes, selectedMood]);

  const moodsList = ["All", "Ishq", "Judaai", "Dard", "Umeed", "Chai-wali-raatein"];

  const handleStarClick = (star: Shayari) => {
    setHoveredShayari(star);
    onSelectShayari(star);
    playShayari(star);
  };

  return (
    <section id="view-sky" className="relative w-full py-16 scroll-mt-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#b86b2b] uppercase mb-1 font-semibold">
              <Moon className="w-3.5 h-3.5" />
              <span>Midnight Sky · रात का आसमाँ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d1810]">
              शायरी के चमकते सितारे
            </h2>
            <p className="text-xs sm:text-sm text-[#6e5548] mt-1">
              हर सितारा एक शेर है। किसी भी सितारे पर क्लिक करें—वह तुरंत बोलेगा और उसका पन्ना खुलेगा।
            </p>
          </div>

          {/* Mood Filters */}
          <div className="flex items-center gap-1.5 flex-wrap bg-white border border-[#dec8b2] p-1.5 rounded-2xl shadow-sm">
            {moodsList.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMood(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedMood === m
                    ? "bg-[#ede2d4] text-[#2d1810] border border-[#d8c6b2] font-semibold shadow-sm"
                    : "text-[#6e5548] hover:text-[#2d1810] hover:bg-[#faf6f0]"
                }`}
              >
                {m === "All" ? "सभी सितारे" : m}
              </button>
            ))}
          </div>
        </div>

        {/* Sky Viewport Box */}
        <div className="relative w-full h-[540px] sm:h-[640px] rounded-3xl bg-gradient-to-b from-[#140e1b] via-[#1a1216] to-[#251510] border border-[#dec8b2] overflow-hidden shadow-2xl">
          {/* Subtle star dust background */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* Ambient Moon & Night Glow */}
          <div className="absolute top-8 right-12 w-28 h-28 rounded-full bg-gradient-to-br from-[#faf6f0]/25 to-transparent blur-md pointer-events-none" />
          <div className="absolute top-10 right-14 w-24 h-24 rounded-full border border-white/20 flex items-center justify-center pointer-events-none opacity-60">
            <div className="w-18 h-18 rounded-full bg-white/10" />
          </div>

          {/* SVG Constellation lines connecting stars */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
            {filteredStars.map((star, i) => {
              const next = filteredStars[(i + 1) % filteredStars.length];
              if (!next || i % 4 === 0) return null;
              return (
                <line
                  key={`line-${star.id}-${next.id}`}
                  x1={`${star.x}%`}
                  y1={`${star.y}%`}
                  x2={`${next.x}%`}
                  y2={`${next.y}%`}
                  stroke={star.color}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              );
            })}
          </svg>

          {/* Stars */}
          {filteredStars.map((star) => {
            const isHovered = hoveredShayari?.id === star.id;
            const isPlayingThis = activeShayari?.id === star.id && isPlaying;

            return (
              <div
                key={star.id}
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 touch-manipulation p-4 -m-4 flex items-center justify-center group"
                onMouseEnter={() => setHoveredShayari(star)}
                onMouseLeave={() => setHoveredShayari(null)}
                onClick={() => handleStarClick(star)}
                title={`सफ़ा ${star.page}: ${star.title}`}
                aria-label={`सफ़ा ${star.page}: ${star.title}`}
              >
                {/* Glow ring */}
                <div
                  className={`absolute rounded-full blur-sm transition-transform duration-300 ${
                    isHovered || isPlayingThis ? "scale-250 opacity-100" : "scale-100 opacity-60"
                  }`}
                  style={{
                    backgroundColor: star.color,
                    width: `${star.size * 2}px`,
                    height: `${star.size * 2}px`,
                  }}
                />

                {/* Star center dot */}
                <div
                  className={`relative rounded-full transition-all duration-300 ${
                    isHovered || isPlayingThis ? "scale-150 ring-2 ring-white" : "group-hover:scale-125"
                  }`}
                  style={{
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    backgroundColor: isHovered || isPlayingThis ? "#ffffff" : star.color,
                    boxShadow: `0 0 12px ${star.color}`,
                  }}
                />

                {/* Pulsing Beacon if playing or hovered */}
                {(isHovered || isPlayingThis) && (
                  <span
                    className="absolute w-8 h-8 rounded-full animate-ping opacity-75"
                    style={{ backgroundColor: star.color }}
                  />
                )}
              </div>
            );
          })}

          {/* Floating Hover Card (Preview on hover/tap) */}
          {hoveredShayari && (
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-md p-4 rounded-2xl bg-white/95 border border-[#dec8b2] backdrop-blur-xl shadow-2xl z-30 transition-all animate-fadeIn text-[#2d1810]">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#f5ece0] text-[#9c5720] border border-[#dec8b2]">
                  {hoveredShayari.mood}
                </span>
                <span className="text-[11px] font-mono text-[#7d6456]">
                  सफ़ा #{hoveredShayari.page}
                </span>
              </div>
              <h4 className="text-sm font-serif font-bold text-[#2d1810] mb-1">
                {hoveredShayari.title}
              </h4>
              <p className="text-xs text-[#6e5548] line-clamp-2 italic mb-3">
                "{hoveredShayari.text.slice(0, 90)}..."
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStarClick(hoveredShayari);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#b86b2b] text-white text-xs font-semibold hover:bg-[#9c5720] active:scale-95 transition-all shadow-sm"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>सुनें व पढ़ें</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenShareStory(hoveredShayari);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#dec8b2] text-[#2d1810] text-xs font-medium hover:bg-[#f5ece0] transition-colors shadow-sm"
                >
                  <Share2 className="w-3 h-3 text-[#b86b2b]" />
                  <span>Story कार्ड</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
