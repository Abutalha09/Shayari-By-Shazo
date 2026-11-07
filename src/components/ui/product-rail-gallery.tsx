"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useId,
  useMemo,
  useCallback,
} from "react";
import {
  Share2,
  Heart,
  Play,
  RotateCw,
  X,
  Volume2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export type GarmentKind = "page" | "tee" | "hoodie" | "shirt" | "jacket" | "coat";

export interface RailGarment {
  id: string;
  name: string;
  kind?: GarmentKind;
  color?: string;
  tag?: string;
  description?: string;
  details?: string[];
  image?: string;
  backImage?: string;
  sideImage?: string;
  rawItem?: any;
}

export interface ClothingRailLabels {
  front: string;
  back: string;
  close: string;
  show: string;
}

export interface ClothingRailHeroProps {
  items: RailGarment[];
  eyebrow?: string;
  heading?: string;
  caption?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoplay?: boolean;
  interval?: number;
  hanger?: "wood" | "brass" | "none";
  labels?: ClothingRailLabels;
  onOpenChange?: (open: boolean, item: RailGarment | null) => void;
  onPlayItem?: (item: RailGarment) => void;
  onShareItem?: (item: RailGarment) => void;
  onToggleFav?: (item: RailGarment) => void;
  isFav?: (item: RailGarment) => boolean;
  className?: string;
  currentPageRange?: string;
  onPrevPageSet?: () => void;
  onNextPageSet?: () => void;
  hasPrevPageSet?: boolean;
  hasNextPageSet?: boolean;
}

const DEFAULT_LABELS: ClothingRailLabels = {
  front: "लिखावट",
  back: "टेक्स्ट",
  close: "बंद करें",
  show: "देखें",
};

// Physics and layout constants
const NATURAL_WIDTH = 240;
const NATURAL_HEIGHT = 350;
const HANGER_OFFSET = 38;
const MIN_DESKTOP_WIDTH = 580;
const SPACING = 14;

interface SimState {
  x: number[];
  vx: number[];
  tx: number[];
  px: number[];
  turn: number[];
  vturn: number[];
  tturn: number[];
  swing: number[];
  vswing: number[];
  tag: number[];
  vtag: number[];
  drag: number;
  grab: number;
  free: number;
  last: number;
  raf: number;
}

function emptySim(): SimState {
  return {
    x: [],
    vx: [],
    tx: [],
    px: [],
    turn: [],
    vturn: [],
    tturn: [],
    swing: [],
    vswing: [],
    tag: [],
    vtag: [],
    drag: -1,
    grab: 0,
    free: 0,
    last: 0,
    raf: 0,
  };
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Wooden / Brass Hanger with golden clip for notebook pages
function PageHanger({
  material = "wood",
}: {
  material?: "wood" | "brass" | "none";
}) {
  if (material === "none") return null;

  return (
    <svg
      viewBox="0 0 160 55"
      className="absolute -top-[34px] left-1/2 -translate-x-1/2 w-[140px] h-[48px] pointer-events-none drop-shadow-md z-20"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="brass-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="wood-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#78350f" />
          <stop offset="50%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#291104" />
        </linearGradient>
      </defs>

      {/* Metal Hook */}
      <path
        d="M80 18 C80 8, 92 4, 92 12 C92 18, 80 16, 80 26"
        fill="none"
        stroke="url(#brass-grad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Hanger Bar or Clip Bar */}
      {material === "wood" ? (
        <path
          d="M16 46 C50 36, 110 36, 144 46 C148 47.5, 148 51, 143 51 C110 43, 50 43, 17 51 C12 51, 12 47.5, 16 46 Z"
          fill="url(#wood-grad)"
          stroke="#92400e"
          strokeWidth="0.8"
        />
      ) : (
        <path
          d="M20 44 L140 44"
          fill="none"
          stroke="url(#brass-grad)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      )}

      {/* Golden Clips grasping the notebook sheet */}
      <rect x="36" y="42" width="12" height="12" rx="2" fill="url(#brass-grad)" stroke="#78350f" strokeWidth="0.8" />
      <rect x="112" y="42" width="12" height="12" rx="2" fill="url(#brass-grad)" stroke="#78350f" strokeWidth="0.8" />
    </svg>
  );
}

// Side profile of page when turned 90 degrees on the rail
function SidePaperSilhouette() {
  return (
    <div className="w-[10px] h-[310px] mx-auto relative rounded-sm bg-[#eedfc3] shadow-md border-l border-amber-900/40">
      <div className="absolute inset-y-2 left-0.5 w-[2px] bg-amber-700/30" />
      <div className="absolute top-4 left-0 w-full h-[6px] bg-amber-500/40" />
      <div className="absolute top-10 left-0 w-full h-[6px] bg-amber-500/40" />
      <div className="absolute top-16 left-0 w-full h-[6px] bg-amber-500/40" />
      <div className="absolute top-22 left-0 w-full h-[6px] bg-amber-500/40" />
    </div>
  );
}

// Realistic notebook sheet card for Front (Handwritten image) and Back (Typed Hindi text)
function NotebookPageCard({
  item,
  isBack = false,
  full = false,
}: {
  item: RailGarment;
  isBack?: boolean;
  full?: boolean;
}) {
  return (
    <div
      className={`relative w-full h-full rounded-xl overflow-hidden select-none bg-[#fbf7ee] text-[#1c120c] shadow-[0_8px_30px_rgba(0,0,0,0.45)] border border-[#d8c39e] flex flex-col ${
        full ? "p-5" : "p-3"
      }`}
    >
      {/* Spiral Holes on top */}
      <div className="flex justify-between items-center px-2 py-1 border-b border-[#e6d5b8] mb-2 bg-[#f4ebd9]/80 rounded-t-lg">
        {[...Array(full ? 10 : 7)].map((_, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-[#3e2415]/75 shadow-inner border border-amber-200/40"
          />
        ))}
      </div>

      {/* Subtle ruled paper lines */}
      <div
        className="absolute inset-x-0 bottom-0 top-9 pointer-events-none opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 23px, #92400e 24px)",
        }}
      />

      {/* Page Content: Front = Handwritten photo, Back = Typed Hindi text */}
      {!isBack ? (
        <div className="flex-1 w-full h-full relative rounded-md overflow-hidden bg-white/70 shadow-sm flex items-center justify-center">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              draggable={false}
              className="w-full h-full object-cover object-center pointer-events-none"
              onError={(e) => {
                if (item.rawItem?.fallbackImage) {
                  (e.currentTarget as HTMLImageElement).src = item.rawItem.fallbackImage;
                }
              }}
            />
          ) : (
            <div className="p-4 text-center font-hindi text-amber-900 font-medium">
              {item.name}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 w-full h-full flex flex-col justify-center items-center p-3 text-center z-10">
          <span className="text-[10px] tracking-widest uppercase font-serif text-amber-800/80 mb-2 font-semibold">
            {item.details?.[0] || "शायरी"} · मुद्रित देवनागरी
          </span>
          <p className="font-hindi text-sm md:text-base leading-relaxed text-[#231409] font-semibold whitespace-pre-line max-w-[92%]">
            {item.description || item.name}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-amber-900/60 font-hindi">
            <span>✍️ شازیہ</span>
          </div>
        </div>
      )}

      {/* Paper footer watermark */}
      <div className="mt-2 pt-1.5 border-t border-[#e6d5b8] flex items-center justify-between text-[10px] text-amber-900/70 font-mono">
        <span>{item.tag || "शायरी by Shazo"}</span>
        <span>NH 48</span>
      </div>
    </div>
  );
}

// Lightbox Detail Modal with 3D FLIP front/back toggle
function PageDetailModal({
  item,
  labels,
  isFavorite,
  onClose,
  onPlay,
  onShare,
  onToggleFav,
}: {
  item: RailGarment;
  labels: ClothingRailLabels;
  isFavorite: boolean;
  onClose: () => void;
  onPlay?: () => void;
  onShare?: () => void;
  onToggleFav?: () => void;
}) {
  const [showTypedBack, setShowTypedBack] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "t" || e.key === "T") setShowTypedBack((prev) => !prev);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#ffffff] border border-[#dec8b2] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-[#2d1810]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/80 text-[#7d6456] hover:text-[#2d1810] hover:bg-white transition-colors border border-[#dec8b2] shadow-sm"
          title={labels.close}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: 3D Notebook Sheet with Flip Switch */}
        <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center bg-[#faf6f0] border-b md:border-b-0 md:border-r border-[#dec8b2]">
          <div className="relative w-[240px] md:w-[310px] h-[340px] md:h-[440px] perspective-[1200px] transition-transform duration-500">
            <NotebookPageCard item={item} isBack={showTypedBack} full={true} />
          </div>

          {/* Front / Back Toggle Pills */}
          <div className="mt-4 flex items-center gap-1.5 p-1 rounded-full bg-[#ede0d0] border border-[#d8c6b2]">
            <button
              onClick={() => setShowTypedBack(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-hindi font-medium transition-all ${
                !showTypedBack
                  ? "bg-[#ede2d4] text-[#2d1810] border border-[#d8c6b2] shadow-sm font-semibold"
                  : "text-[#7d6456] hover:text-[#2d1810]"
              }`}
            >
              ✍️ {labels.front}
            </button>
            <button
              onClick={() => setShowTypedBack(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-hindi font-medium transition-all ${
                showTypedBack
                  ? "bg-[#ede2d4] text-[#2d1810] border border-[#d8c6b2] shadow-sm font-semibold"
                  : "text-[#7d6456] hover:text-[#2d1810]"
              }`}
            >
              📖 {labels.back}
            </button>
          </div>
        </div>

        {/* Right: Poetry Details, Audio Recital, Actions */}
        <div className="w-full md:w-[380px] p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f5ece0] text-[#9c5720] border border-[#dec8b2] font-hindi">
                {item.details?.[0] || "ग़ज़ल"}
              </span>
              <span className="text-xs text-[#7d6456] font-mono">
                {item.tag || "सफ़ा"}
              </span>
            </div>

            <h3 className="font-hindi text-xl md:text-2xl font-bold text-[#2d1810] leading-snug mb-3">
              {item.name}
            </h3>

            {/* Typed Text in Hindi */}
            <div className="p-4 rounded-xl bg-[#faf6f0] border border-[#dec8b2] mb-6 shadow-sm">
              <p className="font-hindi text-sm md:text-base leading-relaxed text-[#2d1810] whitespace-pre-line font-medium">
                {item.description || item.name}
              </p>
            </div>
          </div>

          {/* Action Row: Play Audio, Share, Bookmark */}
          <div className="space-y-3 pt-4 border-t border-[#dec8b2]">
            <button
              onClick={onPlay}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-[#b86b2b] hover:bg-[#9c5720] text-white font-semibold font-hindi text-sm shadow-md shadow-[#b86b2b]/25 active:scale-[0.98] transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>शेर सुनें (AI पाठ + तानपूरा)</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onShare}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-[#f5ece0] text-[#6e5548] border border-[#dec8b2] text-xs font-hindi transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4 text-[#b86b2b]" />
                <span>शेयर करें</span>
              </button>

              <button
                onClick={onToggleFav}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-hindi transition-colors shadow-sm ${
                  isFavorite
                    ? "bg-rose-50 border-rose-200 text-rose-600 font-medium"
                    : "bg-white hover:bg-[#f5ece0] text-[#6e5548] border-[#dec8b2]"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`}
                />
                <span>{isFavorite ? "पसंदीदा" : "पसंद करें"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Interactive ClothingRailHero Component
export function ClothingRailHero({
  items,
  eyebrow = "59 तहरीर · डायरी के पन्ने",
  heading = "मेरी असली लिखावट के पन्ने, हाथ से पलटें",
  caption = "रेल पर हाथ फेरिए, पन्ना खींचिए, पलट कर पीछे का शेर पढ़िए",
  action,
  autoplay = true,
  interval = 2600,
  hanger = "wood",
  labels = DEFAULT_LABELS,
  onOpenChange,
  onPlayItem,
  onShareItem,
  onToggleFav,
  isFav,
  className = "",
  currentPageRange,
  onPrevPageSet,
  onNextPageSet,
  hasPrevPageSet = true,
  hasNextPageSet = true,
}: ClothingRailHeroProps) {
  const railContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [modalItem, setModalItem] = useState<RailGarment | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Simulation state: item positions, velocities, swing angles
  const [positions, setPositions] = useState<number[]>([]);
  const [swings, setSwings] = useState<number[]>([]);
  const [turns, setTurns] = useState<number[]>([]);

  // Check reduced motion
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    const listener = () => setReducedMotion(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Initialize or re-initialize positions when items change
  useLayoutEffect(() => {
    const count = items.length;
    if (count === 0) return;

    const basePositions = items.map((_, i) => i * (NATURAL_WIDTH + SPACING));
    setPositions(basePositions);
    setSwings(new Array(count).fill(0));
    setTurns(new Array(count).fill(0));
  }, [items]);

  // Autoplay gentle rail advance when not hovered
  useEffect(() => {
    if (!autoplay || isHovered || reducedMotion || items.length === 0) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev === null ? 0 : (prev + 1) % items.length;
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, isHovered, interval, items.length, reducedMotion]);

  const handleOpenModal = useCallback(
    (item: RailGarment) => {
      setModalItem(item);
      onOpenChange?.(true, item);
    },
    [onOpenChange]
  );

  const handleCloseModal = useCallback(() => {
    setModalItem(null);
    onOpenChange?.(false, null);
  }, [onOpenChange]);

  return (
    <section
      id="view-diary"
      className={`relative w-full py-10 md:py-14 overflow-hidden select-none bg-transparent ${className}`}
    >
      {/* Header Eyebrow, Title & Tagline */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#dec8b2] text-[#b86b2b] text-xs font-serif tracking-widest uppercase mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{eyebrow}</span>
        </div>

        <h2 className="font-hindi text-3xl md:text-5xl font-extrabold text-[#2d1810] leading-tight mb-3">
          {heading}
        </h2>

        <p className="font-hindi text-sm md:text-base text-[#6e5548] max-w-2xl mx-auto">
          {caption}
        </p>

        {/* Global Action Button if provided */}
        {action && (
          <div className="mt-5 flex justify-center">
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#b86b2b] hover:bg-[#9c5720] text-white font-semibold font-hindi text-sm shadow-md shadow-[#b86b2b]/25 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{action.label}</span>
            </button>
          </div>
        )}
      </div>

      {/* Realistic Hanging Rail Bar */}
      <div className="relative max-w-[1240px] mx-auto px-4">
        {/* The Metal Rail Pipe with mounting brackets */}
        <div className="relative w-full h-4 mb-1">
          {/* Rail Pipe */}
          <div className="absolute inset-x-0 top-1.5 h-2.5 rounded-full bg-gradient-to-b from-[#e5a759] via-[#b86b2b] to-[#7b431a] shadow-[0_4px_12px_rgba(78,52,46,0.15)] border-t border-[#f5ece0]" />
          {/* Left & Right Brackets */}
          <div className="absolute left-6 -top-2 w-4 h-6 rounded-sm bg-gradient-to-b from-[#b86b2b] to-[#543015] border border-[#543015] shadow-sm" />
          <div className="absolute right-6 -top-2 w-4 h-6 rounded-sm bg-gradient-to-b from-[#b86b2b] to-[#543015] border border-[#543015] shadow-sm" />
        </div>

        {/* The Sliding Garment/Notebook Items Rail Area */}
        <div
          ref={railContainerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setActiveIndex(null);
          }}
          className="relative w-full min-h-[420px] md:min-h-[460px] overflow-x-auto overflow-y-visible no-scrollbar py-8 flex items-start justify-start md:justify-center gap-4 md:gap-6 px-4"
        >
          {items.map((item, idx) => {
            const isActive = activeIndex === idx;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => handleOpenModal(item)}
                className={`relative flex-shrink-0 cursor-pointer group transition-all duration-300 ease-out transform ${
                  isActive
                    ? "z-30 scale-105 -translate-y-2"
                    : "z-10 hover:z-20 hover:-translate-y-1"
                }`}
                style={{
                  width: `${NATURAL_WIDTH}px`,
                  height: `${NATURAL_HEIGHT}px`,
                }}
              >
                {/* Hanger at top */}
                <PageHanger material={hanger} />

                {/* Hanging Tag with Safa Number */}
                <div className="absolute top-2 -right-2 z-20 px-2 py-0.5 rounded-md bg-white border border-[#dec8b2] text-[#9c5720] text-[11px] font-mono font-semibold shadow-sm transform rotate-6 group-hover:rotate-0 transition-transform">
                  {item.tag || `सफ़ा ${idx + 1}`}
                </div>

                {/* The Notebook Page Card */}
                <NotebookPageCard item={item} isBack={false} />

                {/* Quick Hover Overlay: 'देखें' Button */}
                <div className="absolute inset-0 rounded-xl bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-4 py-1.5 rounded-full bg-[#b86b2b] text-white font-hindi font-semibold text-xs shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    {labels.show} ↗
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rail Footer: Pagination & Page-Set Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3 border-t border-[#dec8b2]">
          {/* Counter pill */}
          <div className="font-hindi text-sm text-[#2d1810] font-medium px-4 py-1.5 rounded-full bg-white border border-[#dec8b2] shadow-sm">
            {currentPageRange || `सफ़ा 1–${items.length} / 59`}
          </div>

          {/* Previous / Next Set Buttons */}
          <div className="flex items-center gap-2">
            {onPrevPageSet && (
              <button
                onClick={onPrevPageSet}
                disabled={!hasPrevPageSet}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-hindi bg-white hover:bg-[#f5ece0] disabled:opacity-40 disabled:pointer-events-none text-[#2d1810] border border-[#dec8b2] transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4 text-[#b86b2b]" />
                <span>पिछला सेट</span>
              </button>
            )}

            {onNextPageSet && (
              <button
                onClick={onNextPageSet}
                disabled={!hasNextPageSet}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-hindi bg-white hover:bg-[#f5ece0] disabled:opacity-40 disabled:pointer-events-none text-[#2d1810] border border-[#dec8b2] transition-all shadow-sm"
              >
                <span>अगला सेट</span>
                <ChevronRight className="w-4 h-4 text-[#b86b2b]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Detail Modal */}
      {modalItem && (
        <PageDetailModal
          item={modalItem}
          labels={labels}
          isFavorite={isFav ? isFav(modalItem) : false}
          onClose={handleCloseModal}
          onPlay={() => onPlayItem?.(modalItem)}
          onShare={() => onShareItem?.(modalItem)}
          onToggleFav={() => onToggleFav?.(modalItem)}
        />
      )}
    </section>
  );
}

export default ClothingRailHero;
