"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Play,
  Pause,
  Music,
  Heart,
  Share2,
  Download,
  Search,
  Volume2,
  Check,
} from "lucide-react";
import { NAATS_DATA, Naat } from "@/data/naats";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

interface NaatSectionProps {
  onOpenShareStory?: (item: any) => void;
}

export const NaatSection: React.FC<NaatSectionProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { playNaat, isPlaying, activeNaat, currentTrackType, togglePlay } = useAudioPlayer();

  const categories = [
    "All",
    "नात-ए-रसूल ﷺ",
    "शौक-ए-मदीना",
    "मनक़बत",
    "दुरूद-ओ-सलाम",
    "हज व ज़ियारत",
  ];

  const filteredNaats = useMemo(() => {
    return NAATS_DATA.filter((naat) => {
      const matchCat =
        selectedCategory === "All" || naat.category === selectedCategory;
      const matchQuery =
        searchQuery.trim() === "" ||
        naat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        naat.englishTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        naat.khawan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        naat.titleUrdu.includes(searchQuery);
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handlePlayNaat = (naat: Naat) => {
    if (activeNaat?.id === naat.id && currentTrackType === "naat") {
      togglePlay();
    } else {
      playNaat(naat);
    }
  };

  const handleShareNaat = (naat: Naat) => {
    const text = `🌙 *${naat.title}* (${naat.englishTitle})\nخوان: ${naat.khawan}\n\n"${naat.sher}"\n\nشازیہ की पसंदीदा नातें सुनें: ${window.location.origin}#view-naat`;
    if (navigator.share) {
      navigator.share({
        title: naat.title,
        text,
        url: `${window.location.origin}#view-naat`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedId(naat.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section
      id="view-naat"
      className="relative w-full py-16 scroll-mt-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Sacred Header Banner */}
        <div className="relative rounded-3xl p-6 sm:p-10 mb-10 overflow-hidden bg-gradient-to-br from-[#0c1f16] via-[#132c20] to-[#1c120a] border border-[#23533c]/60 shadow-2xl text-white">
          {/* Subtle Islamic Geometry Ambient Overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, #d4af37 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />

          {/* Spiritual Crescent / Star Dust Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              {/* Kicker Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-serif tracking-wider uppercase mb-3 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>رُوحانی سُکون · شازیہ की पसंदीदा नातें</span>
              </div>

              {/* Bismillah Calligraphy */}
              <p className="font-urdu text-lg sm:text-2xl text-amber-300/90 tracking-wide mb-1 font-serif">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>

              {/* Section Main Title */}
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-[#faf5ee] tracking-tight mb-2">
                नात-ए-पाक ﷺ व मनक़बत
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-[#c7d5cd] max-w-2xl leading-relaxed">
                दिल को सुकून और रूह को पाकीज़गी बख्शने वाले रूहानी कलाम—जुनैद जमशेद, माहेर ज़ैन, ओवैस रज़ा क़ादरी और हाफ़िज़ ताहिर क़ादरी की दिलकश आवाज़ों में।
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex md:flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md self-start md:self-auto">
              <div className="text-center">
                <span className="block text-2xl sm:text-3xl font-serif font-bold text-amber-300">
                  {NAATS_DATA.length}
                </span>
                <span className="text-[11px] text-emerald-200/80 uppercase tracking-widest font-sans">
                  पसंदीदा कलाम
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 bg-white border border-[#dec8b2] p-1.5 rounded-2xl shadow-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-[#059669] text-white shadow-sm font-semibold"
                    : "text-[#6e5548] hover:text-[#2d1810] hover:bg-[#faf6f0]"
                }`}
              >
                {cat === "All" ? "सभी कलाम" : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px] sm:min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d6456]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नात या नातख़्वाँ खोजें..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-[#dec8b2] text-xs sm:text-sm text-[#2d1810] placeholder-[#7d6456] focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/20 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Naat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNaats.map((naat) => {
            const isThisPlaying =
              activeNaat?.id === naat.id && currentTrackType === "naat" && isPlaying;

            return (
              <div
                key={naat.id}
                className={`group relative rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                  isThisPlaying
                    ? "bg-[#f4faf6] border-[#059669] shadow-lg shadow-emerald-900/10 ring-2 ring-[#059669]/20"
                    : "bg-[#ffffff] border-[#dec8b2] hover:border-[#059669]/50 hover:shadow-md"
                }`}
              >
                <div>
                  {/* Top Bar: Category badge & Duration */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                      {naat.category}
                    </span>
                    <span className="text-[11px] font-mono text-[#7d6456]">
                      {naat.duration}
                    </span>
                  </div>

                  {/* Urdu Calligraphy Subtitle */}
                  <div className="font-urdu text-sm sm:text-base text-emerald-900/80 mb-1 leading-relaxed">
                    {naat.titleUrdu}
                  </div>

                  {/* Main Title */}
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#2d1810] mb-1 group-hover:text-[#059669] transition-colors leading-snug">
                    {naat.title}
                  </h3>

                  {/* Khawan / Artist credit */}
                  <div className="flex items-center gap-1.5 text-xs text-[#6e5548] mb-3 font-medium">
                    <Volume2 className="w-3.5 h-3.5 text-[#059669]" />
                    <span>{naat.khawan}</span>
                  </div>

                  {/* Couplet / Sher Box */}
                  <div className="p-3 rounded-xl bg-[#faf6f0] border border-[#e6dacd] mb-4 shadow-inner">
                    <p className="font-hindi text-xs sm:text-[13px] leading-relaxed text-[#4a3525] italic whitespace-pre-line">
                      "{naat.sher}"
                    </p>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-3 border-t border-[#f0e6da] flex items-center justify-between gap-2">
                  {/* Play Button */}
                  <button
                    onClick={() => handlePlayNaat(naat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-sm ${
                      isThisPlaying
                        ? "bg-[#047857] text-white hover:bg-[#065f46]"
                        : "bg-[#059669] text-white hover:bg-[#047857]"
                    }`}
                  >
                    {isThisPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" />
                        <span>रुकें</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        <span>नात सुनें</span>
                      </>
                    )}
                  </button>

                  {/* Animated Waveform if playing */}
                  {isThisPlaying && (
                    <div className="flex items-center gap-1 px-2 py-1">
                      <span className="w-1 h-3.5 bg-[#059669] rounded-full animate-pulse" />
                      <span
                        className="w-1 h-5 bg-[#059669] rounded-full animate-pulse"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1 h-2.5 bg-[#059669] rounded-full animate-pulse"
                        style={{ animationDelay: "300ms" }}
                      />
                      <span
                        className="w-1 h-4 bg-[#059669] rounded-full animate-pulse"
                        style={{ animationDelay: "450ms" }}
                      />
                    </div>
                  )}

                  {/* Secondary Actions */}
                  <div className="flex items-center gap-1">
                    {/* Share Button */}
                    <button
                      onClick={() => handleShareNaat(naat)}
                      className="p-2 rounded-xl text-[#7d6456] hover:text-[#059669] hover:bg-[#f5ece0] transition-colors"
                      title="शेयर करें / लिंक कॉपी करें"
                      aria-label="शेयर करें"
                    >
                      {copiedId === naat.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>

                    {/* Download Button */}
                    <a
                      href={encodeURI(naat.audio)}
                      download
                      className="p-2 rounded-xl text-[#7d6456] hover:text-[#059669] hover:bg-[#f5ece0] transition-colors"
                      title="नात डाउनलोड करें"
                      aria-label="नात डाउनलोड करें"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredNaats.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#dec8b2] p-8">
            <Music className="w-8 h-8 text-[#b86b2b] mx-auto mb-2 opacity-60" />
            <p className="text-sm text-[#6e5548]">
              कोई नात नहीं मिली। कृपया खोज शब्द बदलें।
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
