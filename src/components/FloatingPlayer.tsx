"use client";

import React from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Volume2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Mic,
  RotateCcw,
} from "lucide-react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export const FloatingPlayer: React.FC = () => {
  const {
    activeShayari,
    activeNaat,
    currentTrackType,
    isPlaying,
    currentTime,
    duration,
    isSpeechMode,
    isMini,
    autoPlayNext,
    favorites,
    togglePlay,
    nextShayari,
    prevShayari,
    toggleMini,
    toggleAutoPlayNext,
    toggleFavorite,
    isFavorite,
    seek,
  } = useAudioPlayer();

  if (!activeShayari && !activeNaat) {
    return null;
  }

  const isNaat = currentTrackType === "naat" && !!activeNaat;
  const isFav = activeShayari ? isFavorite(activeShayari.id) : false;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const displayTitle = isNaat ? activeNaat.title : `सफ़ा ${activeShayari?.page}: ${activeShayari?.title}`;
  const displayBadge = isNaat ? activeNaat.category : activeShayari?.mood;

  return (
    <aside
      aria-label="ऑडियो प्लेयर"
      className="fixed bottom-4 left-0 right-0 z-40 flex flex-col items-center pointer-events-none px-3"
    >
      {/* Mini Mode Pill */}
      {isMini ? (
        <div className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/95 border border-[#d8c6b2] backdrop-blur-xl shadow-xl shadow-[#4e342e]/15 hover:border-[#b86b2b] transition-all">
          <button
            onClick={() => {
              if (isMini && !isPlaying) {
                toggleMini();
              }
              togglePlay();
            }}
            className={`w-8 h-8 rounded-full text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md ${
              isNaat ? "bg-[#059669] hover:bg-[#047857]" : "bg-[#b86b2b]"
            }`}
            aria-label={isPlaying ? "रोकें" : "सुनें"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <div
            onClick={toggleMini}
            className="cursor-pointer flex items-center gap-2 text-xs"
          >
            <span className="font-semibold text-[#2d1810] truncate max-w-[140px] sm:max-w-[220px]">
              {isNaat ? `🌙 ${activeNaat.title}` : displayTitle}
            </span>
            <span className={`text-[10px] font-mono ${isNaat ? "text-emerald-700 font-semibold" : "text-[#b86b2b]"}`}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            onClick={toggleMini}
            className="p-1 text-[#7d6456] hover:text-[#2d1810] transition-colors"
            title="खोलें (Expand)"
            aria-label="प्लेयर को बड़ा करें"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Expanded Full Bar */
        <div className="pointer-events-auto w-full max-w-2xl flex flex-col items-center">
          {/* Main Player Card */}
          <div className="w-full rounded-2xl bg-white/95 border border-[#e6dacd] backdrop-blur-2xl p-3.5 sm:p-4 shadow-2xl shadow-[#4e342e]/15">
            {/* Top row: Track Details & Badges */}
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3 min-w-0">
                {/* Rotating Vinyl / Image disc / Emerald Mosque crescent */}
                <div
                  className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 shadow-sm flex-shrink-0 flex items-center justify-center ${
                    isNaat
                      ? "border-emerald-600/50 bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-200"
                      : "border-[#b86b2b]/40 bg-[#f7f2ea]"
                  } ${isPlaying ? "animate-spin" : ""}`}
                  style={{ animationDuration: "10s" }}
                >
                  {isNaat ? (
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  ) : (
                    activeShayari && (
                      <img
                        src={activeShayari.image}
                        alt={activeShayari.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (activeShayari.fallbackImage) {
                            (e.currentTarget as HTMLImageElement).src = activeShayari.fallbackImage;
                          }
                        }}
                      />
                    )
                  )}
                  {/* Vinyl center pin */}
                  <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-[#f7f2ea] border border-[#b86b2b]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-serif font-bold text-[#2d1810] truncate">
                      {isNaat ? activeNaat.title : displayTitle}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        isNaat
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-[#f5ece0] text-[#9c5720] border-[#dec8b2]"
                      }`}
                    >
                      {displayBadge}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#6e5548] mt-0.5">
                    {isNaat ? (
                      <span className="flex items-center gap-1 text-emerald-700 font-medium truncate">
                        <Sparkles className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{activeNaat.khawan} · شازیہ की पसंद</span>
                      </span>
                    ) : isSpeechMode ? (
                      <span className="flex items-center gap-1 text-[#b86b2b] font-medium">
                        <Mic className="w-3 h-3" /> AI पाठ (स्वाभाविक वाचन + तानपूरा)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-700 font-medium">
                        <Volume2 className="w-3 h-3" /> शायर की असली आवाज़
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Top actions: Minimize + Fav */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!isNaat && activeShayari && (
                  <button
                    onClick={() => toggleFavorite(activeShayari.id)}
                    className={`p-2 rounded-xl transition-all ${
                      isFav
                        ? "text-rose-500 bg-rose-50"
                        : "text-[#7d6456] hover:text-rose-500 hover:bg-[#f5ece0]"
                    }`}
                    title={isFav ? "पसंदीदा से हटाएं" : "पसंदीदा में जोड़ें"}
                    aria-label="पसंदीदा"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
                  </button>
                )}
                <button
                  onClick={toggleMini}
                  className="p-2 rounded-xl text-[#7d6456] hover:text-[#2d1810] hover:bg-[#f5ece0] transition-colors"
                  title="छोटा करें (Collapse)"
                  aria-label="प्लेयर को छोटा करें"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar & Scrubber */}
            <div className="space-y-1 mb-2">
              <div
                className="relative h-1.5 w-full bg-[#ede0d0] rounded-full cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                  seek(pct);
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#b86b2b] to-[#e5a759] rounded-full transition-all duration-150 relative"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border border-[#b86b2b] shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-[#7d6456]">
                <span>{formatTime(currentTime)}</span>
                {/* Animated sound equalizer bars when playing */}
                <div className="flex items-center gap-0.5 h-3">
                  <span
                    className={`w-0.5 bg-[#b86b2b] rounded-full transition-all ${
                      isPlaying ? "h-3 animate-pulse" : "h-1"
                    }`}
                  />
                  <span
                    className={`w-0.5 bg-[#b86b2b] rounded-full transition-all ${
                      isPlaying ? "h-2 animate-bounce" : "h-1"
                    }`}
                  />
                  <span
                    className={`w-0.5 bg-[#b86b2b] rounded-full transition-all ${
                      isPlaying ? "h-3.5 animate-pulse" : "h-1"
                    }`}
                  />
                  <span
                    className={`w-0.5 bg-[#b86b2b] rounded-full transition-all ${
                      isPlaying ? "h-1.5 animate-bounce" : "h-1"
                    }`}
                  />
                </div>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Bottom Row Controls */}
            <div className="flex items-center justify-between pt-1">
              {/* Auto-Next toggle button */}
              <button
                onClick={toggleAutoPlayNext}
                className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                  autoPlayNext
                    ? "bg-[#f5ece0] border-[#dec8b2] text-[#9c5720]"
                    : "bg-transparent border-[#e6dacd] text-[#7d6456]"
                }`}
                title="शेर खत्म होने पर अगला शेर खुद ब खुद शुरू हो"
              >
                <RotateCcw className="w-3 h-3" />
                <span>अगला अपने-आप {autoPlayNext ? "चालू" : "बंद"}</span>
              </button>

              {/* Main Playback Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={prevShayari}
                  className="p-2 rounded-xl text-[#7d6456] hover:text-[#2d1810] hover:bg-[#f5ece0] active:scale-95 transition-all"
                  title="पिछला शेर (P)"
                  aria-label="पिछला शेर"
                >
                  <SkipBack className="w-4 h-4 fill-current" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-xl bg-[#b86b2b] text-white flex items-center justify-center hover:bg-[#9c5720] active:scale-95 transition-transform shadow-md shadow-[#b86b2b]/25"
                  title={isPlaying ? "रोकें (SPACE)" : "चलाएँ (SPACE)"}
                  aria-label={isPlaying ? "रोकें" : "चलाएँ"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={nextShayari}
                  className="p-2 rounded-xl text-[#7d6456] hover:text-[#2d1810] hover:bg-[#f5ece0] active:scale-95 transition-all"
                  title="अगला शेर (N)"
                  aria-label="अगला शेर"
                >
                  <SkipForward className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop-Only Keyboard Shortcuts Pill Strip (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-3 px-4 py-1.5 mt-2 rounded-full bg-white/90 border border-[#dec8b2] text-[11px] text-[#6e5548] backdrop-blur-md shadow-sm">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#f5ece0] border border-[#dec8b2] font-mono text-[10px] text-[#2d1810]">
                SPACE
              </kbd>
              चलाएँ/रोकें
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#f5ece0] border border-[#dec8b2] font-mono text-[10px] text-[#2d1810]">
                N
              </kbd>
              अगला
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#f5ece0] border border-[#dec8b2] font-mono text-[10px] text-[#2d1810]">
                P
              </kbd>
              पिछला
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#f5ece0] border border-[#dec8b2] font-mono text-[10px] text-[#2d1810]">
                M
              </kbd>
              छोटा/बड़ा
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#f5ece0] border border-[#dec8b2] font-mono text-[10px] text-[#2d1810]">
                R
              </kbd>
              रैंडम
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};
