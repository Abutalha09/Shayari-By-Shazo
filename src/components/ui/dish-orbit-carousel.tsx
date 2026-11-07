"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure GSAP plugins are registered safely in browser
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface Dish {
  id?: string | number;
  title: string;
  subtitle: string;
  label?: string;
  image: string;
  alt?: string;
  rating: number;
  chef: string;
  kitchen?: string;
  description: string;
  likes: number;
  ingredients?: string[]; // mapped to 'अल्फ़ाज़' (key words)
  accent: string;
  eyebrow?: string;
}

export interface DishOrbitCarouselProps {
  dishes: Dish[];
  height?: string;
  backdrop?: string;
  loop?: boolean;
  fontSrc?: string | null;
  onPlay?: (dish: Dish, index: number) => void;
  onOrder?: (dish: Dish, index: number) => void;
  onChange?: (index: number) => void;
  className?: string;
}

// Math and Arc constants from original component
const REST_ANGLES: [number, number][] = [
  [50, 98],
  [46, 124],
  [60, 126],
  [40, 100],
  [48, 115],
];
const SWING_ANGLES: [number, number] = [38, 146];
const ARC_CX = 299;
const ARC_CY = -450;
const ARC_R = 650;
const STEP_HEIGHT_RATIO = 0.7;
const ORBIT_ROTATION = 50;
const THUMB_WIDTH = 118;
const VISIBLE_THUMBS = 4;

// Clip paths for 2-weight title text wiping
const CLIP_WIPE_OUT_LEFT = "inset(0% 0% 0% 100%)";
const CLIP_WIPE_OUT_RIGHT = "inset(0% 100% 0% 0%)";
const CLIP_WIPE_IN = "inset(0% 0% 0% 0%)";

function getRestAngles(idx: number): [number, number] {
  return REST_ANGLES[((idx % REST_ANGLES.length) + REST_ANGLES.length) % REST_ANGLES.length];
}

function calculateScrollSteps(count: number, isLoop: boolean): number {
  return Math.max(0, isLoop ? count : count - 1);
}

function calculateSegment(target: number, current: number, count: number, isLoop: boolean): number {
  return isLoop && target === 0 && current > count / 2 ? count : target;
}

function calculateStepDirection(curr: number, next: number, total: number): number {
  if (total <= 0) return 1;
  const diff = ((next - curr) % total + total) % total;
  return diff <= total - diff ? 1 : -1;
}

function calculateThumbTrackOffset(activeIdx: number, total: number, maxVisible: number): number {
  return total <= maxVisible ? 0 : Math.max(0, Math.min(activeIdx - 1, total - maxVisible));
}

// Tuned fitSize function for Hindi / Devanagari titles so long titles never overflow
function fitFontSize(length: number, baseSize: number, maxBoxWidth: number, factor: number = 0.72): number {
  return Math.min(baseSize, maxBoxWidth / (Math.max(1, length) * factor));
}

// Draw smooth SVG radial arc path
function generateArcPath(
  a0: number,
  a1: number,
  cx: number,
  cy: number,
  r: number,
  bandWidth: number,
  steps: number = 48
): string {
  const outerPts: string[] = [];
  const innerPts: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const angleRad = ((a0 + (a1 - a0) * progress) * Math.PI) / 180;
    const bulge = (bandWidth / 2) * Math.pow(Math.sin(Math.PI * progress), 0.45);
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);

    outerPts.push(`${(cx + cosA * (r + bulge)).toFixed(1)} ${(cy + sinA * (r + bulge)).toFixed(1)}`);
    innerPts.unshift(`${(cx + cosA * (r - bulge)).toFixed(1)} ${(cy + sinA * (r - bulge)).toFixed(1)}`);
  }

  return `M ${outerPts.join(" L ")} L ${innerPts.join(" L ")} Z`;
}

// SVG Icons used inside DishOrbitCarousel
const DishIcons = {
  search: (
    <svg className="dsh-ico" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" fill="none" strokeWidth="2" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  menu: (
    <svg className="dsh-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6.5h16M4 12h16M4 17.5h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  play: (
    <svg className="dsh-ico dsh-fill" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3.5v17l14-8.5z" />
    </svg>
  ),
  share: (
    <svg className="dsh-ico dsh-fill" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5 3 15h18zM3 18h18v2.5H3z" />
    </svg>
  ),
  thumbUp: (
    <svg className="dsh-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 10v10H3.5V10zM7 10l4-7c1.6 0 2.6 1.2 2.2 2.8L12.6 9H19a2 2 0 0 1 2 2.3l-1.3 7A2 2 0 0 1 17.7 20H7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  thumbDown: (
    <svg className="dsh-ico" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 14V4h3.5v10zM17 14l-4 7c-1.6 0-2.6-1.2-2.2-2.8l.6-3.2H5a2 2 0 0 1-2-2.3l1.3-7A2 2 0 0 1 6.3 4H17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
};

export function DishOrbitCarousel({
  dishes,
  height = "100svh",
  backdrop,
  loop = true,
  fontSrc = null,
  onPlay,
  onOrder,
  onChange,
  className = "",
}: DishOrbitCarouselProps) {
  const count = dishes.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "ingredients">("overview");
  const [likesMap, setLikesMap] = useState<Record<number, boolean>>({});
  const [dislikesMap, setDislikesMap] = useState<Record<number, boolean>>({});

  const trackContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const currentStepRef = useRef(0);
  const selectedIndexRef = useRef(0);
  const onChangeCallbackRef = useRef(onChange);
  onChangeCallbackRef.current = onChange;

  // DOM node references for GSAP targets
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardBodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const arcPathRef = useRef<SVGPathElement | null>(null);

  const arcAnglesRef = useRef<{ a0: number; a1: number }>({ a0: 0, a1: 0 });
  const prevIndexRef = useRef(-1);
  const stepDirectionRef = useRef(1);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const reducedMotionRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // ResizeObserver to set canvas scale CSS variable --dsh-s
  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const updateScale = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      el.style.setProperty("--dsh-s", String(Math.min(w / 960, h / 520, 1.6)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Check prefers-reduced-motion
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = media.matches;
    const handler = () => {
      reducedMotionRef.current = media.matches;
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Update arc drawing
  const updateArcDrawing = useCallback(() => {
    if (arcPathRef.current) {
      arcPathRef.current.setAttribute(
        "d",
        generateArcPath(arcAnglesRef.current.a0, arcAnglesRef.current.a1, ARC_CX, ARC_CY, ARC_R, 118)
      );
    }
  }, []);

  // GSAP animation on active dish change
  useLayoutEffect(() => {
    const prevIdx = prevIndexRef.current;
    const currIdx = activeIndex;

    const getParts = (idx: number) => {
      const headEl = titleRefs.current[idx] || null;
      return {
        orbit: plateRefs.current[idx] || null,
        head: headEl,
        eye: (headEl?.querySelector(".dsh-eye") as HTMLElement | null) || null,
        t1: (headEl?.querySelector(".dsh-t1") as HTMLElement | null) || null,
        t2: (headEl?.querySelector(".dsh-t2") as HTMLElement | null) || null,
        body: cardBodyRefs.current[idx] || null,
      };
    };

    const targetAngles = getRestAngles(currIdx);
    const targetAccent = dishes[currIdx] ? dishes[currIdx].accent : "transparent";

    if (timelineRef.current) {
      timelineRef.current.progress(1).kill();
    }

    const currentParts = getParts(currIdx);

    // Initial mount or instant change
    if (prevIdx === -1 || prevIdx === currIdx || reducedMotionRef.current) {
      for (let i = 0; i < count; i++) {
        if (i !== currIdx) {
          const p = getParts(i);
          const hideTargets = [p.orbit, p.head, p.body].filter(Boolean) as Element[];
          if (hideTargets.length) gsap.set(hideTargets, { autoAlpha: 0 });
        }
      }

      const showTargets = [currentParts.orbit, currentParts.head, currentParts.body, currentParts.eye].filter(Boolean) as Element[];
      if (showTargets.length) {
        gsap.set(showTargets, {
          autoAlpha: 1,
          rotation: 0,
          y: 0,
        });
      }
      if (currentParts.t1) gsap.set(currentParts.t1, { clipPath: CLIP_WIPE_IN });
      if (currentParts.t2) gsap.set(currentParts.t2, { clipPath: CLIP_WIPE_IN });

      arcAnglesRef.current.a0 = targetAngles[0];
      arcAnglesRef.current.a1 = targetAngles[1];
      updateArcDrawing();

      if (arcPathRef.current) {
        gsap.set(arcPathRef.current, { fill: targetAccent });
      }

      prevIndexRef.current = currIdx;
      return;
    }

    // Dynamic GSAP Timeline transition
    const oldParts = getParts(prevIdx);
    const dir = stepDirectionRef.current;
    const tl = gsap.timeline({
      onComplete: () => {
        timelineRef.current = null;
      },
    });
    timelineRef.current = tl;

    // 1. Orbit swing animation
    if (oldParts.orbit) {
      tl.to(oldParts.orbit, {
        rotation: ORBIT_ROTATION * dir,
        duration: 0.62,
        ease: "power2.in",
      }, 0)
        .set(oldParts.orbit, { autoAlpha: 0, rotation: 0 }, 0.62);
    }
    if (currentParts.orbit) {
      tl.fromTo(
        currentParts.orbit,
        { autoAlpha: 1, rotation: -ORBIT_ROTATION * dir },
        { rotation: 0, duration: 0.95, ease: "power3.out" },
        0.3
      );
    }

    // 2. Title two-weight wipe transitions
    if (oldParts.t1) tl.to(oldParts.t1, { clipPath: CLIP_WIPE_OUT_LEFT, duration: 0.42, ease: "power2.in" }, 0);
    if (oldParts.t2) tl.to(oldParts.t2, { clipPath: CLIP_WIPE_OUT_RIGHT, duration: 0.42, ease: "power2.in" }, 0.06);
    if (oldParts.eye) tl.to(oldParts.eye, { autoAlpha: 0, duration: 0.25 }, 0);
    if (oldParts.head) tl.set(oldParts.head, { autoAlpha: 0 }, 0.5);
    if (currentParts.head) tl.set(currentParts.head, { autoAlpha: 1 }, 0.5);
    if (currentParts.eye) tl.fromTo(currentParts.eye, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.55);
    if (currentParts.t1) tl.fromTo(currentParts.t1, { clipPath: CLIP_WIPE_OUT_LEFT }, { clipPath: CLIP_WIPE_IN, duration: 0.7, ease: "power3.out" }, 0.55);
    if (currentParts.t2) tl.fromTo(currentParts.t2, { clipPath: CLIP_WIPE_OUT_RIGHT }, { clipPath: CLIP_WIPE_IN, duration: 0.7, ease: "power3.out" }, 0.62);

    // 3. Card content transition
    if (oldParts.body) tl.to(oldParts.body, { autoAlpha: 0, y: -6, duration: 0.3, ease: "power1.in" }, 0.05);
    if (currentParts.body) tl.set(currentParts.body, { autoAlpha: 1, y: 0 }, 0.4);

    if (currentParts.body) {
      tl.fromTo(
        currentParts.body.children,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" },
        0.4
      );
    }

    // 4. Arc band shape morphing
    tl.to(arcAnglesRef.current, {
      a0: SWING_ANGLES[0],
      a1: SWING_ANGLES[1],
      duration: 0.6,
      ease: "power2.inOut",
      onUpdate: updateArcDrawing,
    }, 0).to(arcAnglesRef.current, {
      a0: targetAngles[0],
      a1: targetAngles[1],
      duration: 0.85,
      ease: "power3.out",
      onUpdate: updateArcDrawing,
    }, 0.6);

    // 5. Arc band color morphing
    if (arcPathRef.current) {
      tl.to(arcPathRef.current, { fill: targetAccent, duration: 1.1, ease: "power1.inOut" }, 0.1);
    }

    prevIndexRef.current = currIdx;
  }, [activeIndex, count, dishes, updateArcDrawing]);

  // Cleanup timeline
  useEffect(() => {
    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  const selectDish = useCallback(
    (newIdx: number, dir: number) => {
      if (newIdx !== selectedIndexRef.current) {
        stepDirectionRef.current = dir;
        selectedIndexRef.current = newIdx;
        setActiveIndex(newIdx);
        onChangeCallbackRef.current?.(newIdx);
      }
    },
    []
  );

  const scrollSteps = calculateScrollSteps(count, loop);

  // GSAP ScrollTrigger bidirectional scroll setup
  useEffect(() => {
    const triggerEl = trackContainerRef.current;
    if (!triggerEl || scrollSteps < 1) return;

    // On mobile devices, let users swipe and click naturally without vertical scroll trapping
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      return;
    }

    const st = ScrollTrigger.create({
      trigger: triggerEl,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        // Natural progression without loop teleportation or trapping
        const step = Math.min(scrollSteps, Math.max(0, Math.round(self.progress * scrollSteps)));
        if (step === currentStepRef.current) return;

        const dir = step > currentStepRef.current ? 1 : -1;
        currentStepRef.current = step;
        const normalizedIdx = Math.min(count - 1, Math.max(0, step));
        selectDish(normalizedIdx, dir);
      },
    });

    scrollTriggerRef.current = st;

    return () => {
      st.kill();
      scrollTriggerRef.current = null;
    };
  }, [scrollSteps, count, selectDish]);

  const goToDish = useCallback(
    (targetIdx: number, forcedDir?: number) => {
      if (count < 2) return;
      const normalized = ((targetIdx % count) + count) % count;
      if (normalized === activeIndex) return;

      const st = scrollTriggerRef.current;
      const currentScroll = st ? st.scroll() : 0;

      if (st && currentScroll >= st.start - 1 && currentScroll <= st.end + 1) {
        const seg = calculateSegment(normalized, currentStepRef.current, count, loop);
        currentStepRef.current = seg;
        st.scroll(st.start + ((st.end - st.start) * seg) / scrollSteps);
      }

      selectDish(normalized, forcedDir ?? calculateStepDirection(activeIndex, normalized, count));
    },
    [activeIndex, count, loop, scrollSteps, selectDish]
  );

  const stepDish = useCallback(
    (delta: number) => {
      goToDish(activeIndex + delta, delta);
    },
    [activeIndex, goToDish]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      stepDish(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      stepDish(-1);
    }
  };

  // Touch swipe support
  const handlePointerDown = (e: React.PointerEvent) => {
    touchStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      stepDish(dx < 0 ? 1 : -1);
    }
  };

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const thumbTrackOffset = calculateThumbTrackOffset(activeIndex, count, VISIBLE_THUMBS);
  const currentDish = dishes[activeIndex];

  return (
    <div
      ref={trackContainerRef}
      id="view-moods"
      className={`dsh-trk ${className}`}
      style={{
        height: isMobile ? "auto" : `calc(${height} * ${1 + scrollSteps * 0.4})`,
        minHeight: isMobile ? "580px" : undefined,
      }}
    >
      <div
        ref={canvasRef}
        className="dsh-root"
        style={{
          height: isMobile ? "auto" : height,
          minHeight: isMobile ? "580px" : undefined,
          position: isMobile ? "relative" : "sticky",
          top: 0,
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label="5 मूड्स शायरी"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Backdrop images if specified */}
        {backdrop && (
          <>
            <img className="dsh-bd" src={backdrop} alt="" width={1200} height={900} />
            <div className="dsh-dim" />
            <div className="dsh-wash" />
          </>
        )}

        <div className="dsh-canvas">
          {/* Color Morphing SVG Radial Arc */}
          <svg className="dsh-arc" viewBox="0 0 960 520" aria-hidden="true">
            <path ref={arcPathRef} style={{ opacity: 0.38 }} />
          </svg>

          {/* Top Brand Tag */}
          <div className="dsh-top">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#b86b2b]/30 text-[#b86b2b] text-xs font-serif tracking-widest uppercase shadow-sm backdrop-blur-md">
              <span>5 मूड रूम्स · SHAZO</span>
            </div>
          </div>

          {/* Side Dot Pager */}
          <div className="dsh-pager" role="tablist" aria-label="मूड चुनें">
            {dishes.map((dish, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                className="dsh-btn dsh-dot"
                aria-selected={i === activeIndex}
                aria-current={i === activeIndex ? "true" : undefined}
                aria-label={`${dish.title} ${dish.subtitle}`}
                onClick={() => goToDish(i)}
              >
                <i />
              </button>
            ))}
          </div>

          {/* Plates Orbit Area */}
          <div
            className="dsh-plates"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => {
              touchStartRef.current = null;
            }}
          >
            {dishes.map((dish, i) => (
              <div
                key={i}
                ref={(el) => {
                  plateRefs.current[i] = el;
                }}
                className="dsh-orbit"
                aria-hidden={i !== activeIndex}
              >
                <img
                  src={dish.image}
                  alt={dish.alt ?? `${dish.title} ${dish.subtitle}`}
                  width={245}
                  height={245}
                  draggable={false}
                  className="rounded-full shadow-2xl object-cover"
                />
              </div>
            ))}
          </div>

          {/* Big Two-Weight Wiping Titles */}
          <div className="dsh-head" aria-live="polite">
            {dishes.map((dish, i) => (
              <div
                key={i}
                ref={(el) => {
                  titleRefs.current[i] = el;
                }}
                className="dsh-hd"
                aria-hidden={i !== activeIndex}
              >
                <p className="dsh-eye font-serif">
                  {dish.eyebrow ?? `#${i + 1} सबसे पसंदीदा मूड`}
                </p>
                <h2 style={{ margin: 0, font: "inherit" }}>
                  <span
                    className="dsh-t1 font-hindi"
                    style={{ fontSize: `${fitFontSize(dish.title.length, 54, 340, 0.72)}px` }}
                  >
                    {dish.title}
                  </span>
                  <span
                    className="dsh-t2 font-hindi"
                    style={{ fontSize: `${fitFontSize(dish.subtitle.length, 60, 330, 0.76)}px` }}
                  >
                    {dish.subtitle}
                  </span>
                </h2>
              </div>
            ))}
          </div>

          {/* Action Buttons: 'शेर सुनें' and 'शेयर करें' */}
          <div className="dsh-acts">
            <button
              type="button"
              className="dsh-btn font-hindi"
              onClick={() => currentDish && onPlay?.(currentDish, activeIndex)}
            >
              {DishIcons.play}
              <span>शेर सुनें</span>
            </button>
            <button
              type="button"
              className="dsh-btn font-hindi"
              onClick={() => currentDish && onOrder?.(currentDish, activeIndex)}
            >
              {DishIcons.share}
              <span>शेयर करें</span>
            </button>
          </div>

          {/* Side Poet / Sher Card */}
          <div className="dsh-card">
            {/* Tabs: 'शेर' vs 'अल्फ़ाज़' */}
            <div className="dsh-tabs" role="tablist" aria-label="मूड विवरण">
              <button
                type="button"
                role="tab"
                className="dsh-btn dsh-tab font-hindi"
                aria-selected={activeTab === "overview"}
                onClick={() => setActiveTab("overview")}
              >
                शेर
              </button>
              <button
                type="button"
                role="tab"
                className="dsh-btn dsh-tab font-hindi"
                aria-selected={activeTab === "ingredients"}
                onClick={() => setActiveTab("ingredients")}
              >
                अल्फ़ाज़
              </button>
            </div>

            {/* Bodies for each dish */}
            <div className="dsh-bodies">
              {dishes.map((dish, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    cardBodyRefs.current[i] = el;
                  }}
                  className="dsh-body"
                  aria-hidden={i !== activeIndex}
                >
                  {/* Rating Badge */}
                  <div className="dsh-rate">
                    <div className="dsh-badge" style={{ background: dish.accent }}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m12 2.5 2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" />
                      </svg>
                    </div>
                    <span className="dsh-num font-mono" aria-label={`रेटिंग ${dish.rating.toFixed(1)} / 5`}>
                      {dish.rating.toFixed(1)}
                    </span>
                  </div>

                  <p className="dsh-chef font-hindi">{dish.chef}</p>
                  <p className="dsh-kit font-mono">{dish.kitchen ?? "NH 48"}</p>

                  {/* Body Content */}
                  {activeTab === "overview" || !dish.ingredients?.length ? (
                    <p className="dsh-desc font-hindi whitespace-pre-line leading-relaxed text-amber-100/90">
                      "{dish.description}"
                    </p>
                  ) : (
                    <ul className="dsh-ing font-hindi">
                      {dish.ingredients.map((word) => (
                        <li key={word}>{word}</li>
                      ))}
                    </ul>
                  )}

                  {/* Reaction Buttons: Like / Dislike */}
                  <div className="dsh-react">
                    <button
                      type="button"
                      className="dsh-btn dsh-like font-hindi"
                      aria-pressed={!!likesMap[i]}
                      tabIndex={i === activeIndex ? 0 : -1}
                      onClick={() => {
                        setLikesMap((prev) => ({ ...prev, [i]: !prev[i] }));
                        setDislikesMap((prev) => ({ ...prev, [i]: false }));
                      }}
                    >
                      {DishIcons.thumbUp}
                      <span>{dish.likes + (likesMap[i] ? 1 : 0)} दाद</span>
                    </button>

                    <button
                      type="button"
                      className="dsh-btn dsh-meh"
                      aria-pressed={!!dislikesMap[i]}
                      aria-label="Not for me"
                      tabIndex={i === activeIndex ? 0 : -1}
                      onClick={() => {
                        setDislikesMap((prev) => ({ ...prev, [i]: !prev[i] }));
                        setLikesMap((prev) => ({ ...prev, [i]: false }));
                      }}
                    >
                      {DishIcons.thumbDown}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Thumbnail Strip */}
          <div className="dsh-strip">
            <button
              type="button"
              className="dsh-btn dsh-arrow"
              aria-label="पिछला मूड"
              onClick={() => stepDish(-1)}
            >
              <svg viewBox="0 0 12 16" aria-hidden="true">
                <path d="M11 0v16L0 8z" />
              </svg>
            </button>

            <div className="dsh-win">
              <div
                className="dsh-track"
                style={{ transform: `translateX(${-thumbTrackOffset * THUMB_WIDTH}px)` }}
              >
                {dishes.map((dish, i) => (
                  <div key={i} className="dsh-th">
                    <button
                      type="button"
                      className="dsh-btn"
                      aria-current={i === activeIndex ? "true" : undefined}
                      onClick={() => goToDish(i)}
                    >
                      <img
                        src={dish.image}
                        alt=""
                        width={56}
                        height={56}
                        draggable={false}
                        className="rounded-full shadow-md object-cover"
                      />
                      <span className="font-hindi">{dish.label ?? `${dish.title} ${dish.subtitle}`}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="dsh-btn dsh-arrow"
              aria-label="अगला मूड"
              onClick={() => stepDish(1)}
            >
              <svg viewBox="0 0 12 16" aria-hidden="true">
                <path d="M1 0v16l11-8z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Screen Reader Live Announcement */}
        <p className="dsh-sr" aria-live="polite">
          {currentDish
            ? `मूड ${activeIndex + 1} / ${count}: ${currentDish.title} ${currentDish.subtitle}`
            : ""}
        </p>
      </div>
    </div>
  );
}

export default DishOrbitCarousel;
