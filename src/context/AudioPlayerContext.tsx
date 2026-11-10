"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import { Shayari, SHAYARIS_DATA } from "@/data/shayari";
import { Naat, NAATS_DATA } from "@/data/naats";

interface AudioPlayerContextType {
  activeShayari: Shayari | null;
  activeNaat: Naat | null;
  currentTrackType: "shayari" | "naat";
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  isSpeechMode: boolean;
  isMini: boolean;
  autoPlayNext: boolean;
  favorites: number[];
  lastReadPage: number;
  playShayari: (shayari: Shayari) => void;
  playNaat: (naat: Naat) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  nextShayari: () => void;
  prevShayari: () => void;
  playRandom: () => void;
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  toggleMini: () => void;
  setIsMini: (val: boolean) => void;
  toggleAutoPlayNext: () => void;
  seek: (percent: number) => void;
  setLastReadPage: (page: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

const STORAGE_FAVS_KEY = "shazo_favs";
const STORAGE_LAST_PAGE_KEY = "shazo_last_page";

// Helpers for natural speech duration and voice selection
export function getEstimatedSpeechSeconds(text: string): number {
  if (!text) return 30;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  // Poetic, natural recital rhythm is ~75 words per minute
  return Math.max(12, Math.round((words / 75) * 60));
}

export function parseDurationToSeconds(durationStr?: string): number {
  if (!durationStr) return 240;
  const parts = durationStr.split(":").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return 240;
}

function selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  return (
    voices.find(
      (v) =>
        v.lang?.toLowerCase().startsWith("hi") ||
        v.name?.toLowerCase().includes("hindi") ||
        v.name?.toLowerCase().includes("madhur") ||
        v.name?.toLowerCase().includes("swara") ||
        v.name?.toLowerCase().includes("kalpana") ||
        v.name?.toLowerCase().includes("neerja") ||
        v.name?.toLowerCase().includes("kavya")
    ) ||
    voices.find(
      (v) =>
        v.lang?.toLowerCase().startsWith("ur") ||
        v.name?.toLowerCase().includes("urdu")
    ) ||
    voices.find(
      (v) =>
        v.lang?.toLowerCase().startsWith("en-in") ||
        v.name?.toLowerCase().includes("india")
    ) ||
    voices[0] ||
    null
  );
}

// Web Audio Ambient Drone for Warm Poetic Recitation
class AmbientHarmonicDrone {
  private ctx: AudioContext | null = null;
  private oscs: OscillatorNode[] = [];
  private masterGain: GainNode | null = null;
  private isRunning = false;

  public unlock() {
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      } catch (e) {
        console.warn("Web Audio not supported", e);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  private init() {
    this.unlock();
  }

  public start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    if (this.isRunning) return;

    try {
      const now = this.ctx.currentTime;
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.0005, now);
      master.gain.exponentialRampToValueAtTime(0.012, now + 1.2); // Ultra soft, calming tanpura undertone

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(260, now);

      master.connect(filter);
      filter.connect(this.ctx.destination);
      this.masterGain = master;

      // Soulful chord notes: C# root (138.5Hz), G# fifth (207.65Hz), C# octave (277.18Hz)
      const freqs = [138.59, 207.65, 277.18];
      this.oscs = freqs.map((f) => {
        const osc = this.ctx!.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now);
        osc.connect(master);
        osc.start(now);
        return osc;
      });

      this.isRunning = true;
    } catch (e) {
      console.warn("Drone audio error", e);
    }
  }

  public stop() {
    if (!this.ctx || !this.isRunning) return;
    try {
      const now = this.ctx.currentTime;
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      }
      setTimeout(() => {
        this.oscs.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        });
        this.oscs = [];
        this.isRunning = false;
      }, 700);
    } catch (e) {
      this.isRunning = false;
    }
  }
}

const ambientDrone = typeof window !== "undefined" ? new AmbientHarmonicDrone() : null;

export const AudioPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to first shayari so player is immediately accessible
  const [activeShayari, setActiveShayari] = useState<Shayari | null>(() => SHAYARIS_DATA[0]);
  const [activeNaat, setActiveNaat] = useState<Naat | null>(null);
  const [currentTrackType, setCurrentTrackType] = useState<"shayari" | "naat">("shayari");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(() => {
    return getEstimatedSpeechSeconds(SHAYARIS_DATA[0]?.text || "");
  });
  const [isSpeechMode, setIsSpeechMode] = useState(false);
  const [isMini, setIsMini] = useState(true); // Default to compact pill mode as requested
  const [autoPlayNext, setAutoPlayNext] = useState(true);

  // Favorites & Last read page from localStorage
  const [favorites, setFavorites] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_FAVS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [lastReadPage, setLastReadPage] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    try {
      const saved = localStorage.getItem(STORAGE_LAST_PAGE_KEY);
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechTimerRef = useRef<any>(null);
  const autoNextTimeoutRef = useRef<any>(null);
  const speechStartTimeRef = useRef<number>(0);
  const speechEstimatedDurRef = useRef<number>(10);
  const isPlayingRef = useRef(false);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Pre-warm SpeechSynthesis voices cache on mount
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const loadVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices();
        if (v && v.length > 0) {
          voicesRef.current = v;
        }
      } catch {}
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // Sync favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FAVS_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn("Could not save favorites to localStorage", e);
    }
  }, [favorites]);

  // Sync lastReadPage to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LAST_PAGE_KEY, lastReadPage.toString());
    } catch (e) {
      console.warn("Could not save last page to localStorage", e);
    }
  }, [lastReadPage]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.ontimeupdate = null;
        audioRef.current = null;
      }
      if (autoNextTimeoutRef.current) {
        clearTimeout(autoNextTimeoutRef.current);
        autoNextTimeoutRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (speechTimerRef.current) {
        clearInterval(speechTimerRef.current);
      }
      ambientDrone?.stop();
    };
  }, []);

  const stopAllPlayback = useCallback(() => {
    if (autoNextTimeoutRef.current) {
      clearTimeout(autoNextTimeoutRef.current);
      autoNextTimeoutRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    ambientDrone?.stop();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsPaused(false);
    setCurrentTime(0);
  }, []);

  const playSpeech = useCallback(
    (shayari: Shayari) => {
      if (typeof window === "undefined") {
        setIsPlaying(false);
        isPlayingRef.current = false;
        return;
      }

      // 1. Immediately unlock and resume Web Audio during user click gesture
      ambientDrone?.unlock();

      // 2. Format text for natural speech reading
      const textToSpeak = shayari.text.trim() || shayari.title;
      const estimatedSeconds = getEstimatedSpeechSeconds(textToSpeak);
      speechEstimatedDurRef.current = estimatedSeconds;
      setDuration(estimatedSeconds);
      setCurrentTime(0);
      setIsSpeechMode(true);
      setIsPlaying(true);
      isPlayingRef.current = true;
      setIsPaused(false);

      // 3. Start progress timer
      speechStartTimeRef.current = Date.now();
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
      speechTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - speechStartTimeRef.current) / 1000;
        if (elapsed >= estimatedSeconds) {
          clearInterval(speechTimerRef.current);
          setCurrentTime(estimatedSeconds);
          setIsPlaying(false);
          isPlayingRef.current = false;
          ambientDrone?.stop();
          if (autoPlayNext) {
            if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
            autoNextTimeoutRef.current = setTimeout(() => {
              const currentIndex = SHAYARIS_DATA.findIndex((s) => s.id === shayari.id);
              const nextIndex = (currentIndex + 1) % SHAYARIS_DATA.length;
              playShayari(SHAYARIS_DATA[nextIndex]);
            }, 800);
          }
        } else {
          setCurrentTime(elapsed);
        }
      }, 250);

      // 4. Web Speech Synthesis without delay to preserve User Gesture Activation
      if ("speechSynthesis" in window) {
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
          }

          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          (window as any).__shazoUtterance = utterance;

          const voices =
            voicesRef.current.length > 0
              ? voicesRef.current
              : window.speechSynthesis.getVoices();
          const selectedVoice = selectBestVoice(voices);

          if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
          } else {
            utterance.lang = "hi-IN";
          }

          utterance.rate = 0.88;
          utterance.pitch = 0.98;

          // Start ambient tanpura sound immediately for acoustic response
          ambientDrone?.start();

          utterance.onstart = () => {
            ambientDrone?.start();
          };

          utterance.onend = () => {
            if (speechTimerRef.current) clearInterval(speechTimerRef.current);
            setCurrentTime(estimatedSeconds);
            setIsPlaying(false);
            isPlayingRef.current = false;
            ambientDrone?.stop();
            if (autoPlayNext) {
              if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
              autoNextTimeoutRef.current = setTimeout(() => {
                const currentIndex = SHAYARIS_DATA.findIndex((s) => s.id === shayari.id);
                const nextIndex = (currentIndex + 1) % SHAYARIS_DATA.length;
                playShayari(SHAYARIS_DATA[nextIndex]);
              }, 800);
            }
          };

          utterance.onerror = (e) => {
            console.warn("SpeechSynthesis notice:", e);
            if (speechTimerRef.current) clearInterval(speechTimerRef.current);
            setIsPlaying(false);
            isPlayingRef.current = false;
            ambientDrone?.stop();
          };

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.warn("SpeechSynthesis error:", err);
          ambientDrone?.stop();
          if (speechTimerRef.current) clearInterval(speechTimerRef.current);
          setIsPlaying(false);
          isPlayingRef.current = false;
        }
      }
    },
    [autoPlayNext]
  );

  const playShayari = useCallback(
    (shayari: Shayari) => {
      stopAllPlayback();
      setActiveShayari(shayari);
      setCurrentTrackType("shayari");
      setLastReadPage(shayari.page);
      setIsMini(false);

      if (shayari.audio) {
        setIsSpeechMode(false);
        setDuration(0);
        setCurrentTime(0);

        const audio = new Audio(shayari.audio);
        audioRef.current = audio;
        audio.preload = "auto";

        audio.onloadedmetadata = () => {
          if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
            setDuration(audio.duration);
          }
        };

        audio.ontimeupdate = () => {
          setCurrentTime(audio.currentTime);
        };

        audio.onended = () => {
          setIsPlaying(false);
          isPlayingRef.current = false;
          setIsPaused(false);
          ambientDrone?.stop();
          if (autoPlayNext) {
            if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
            autoNextTimeoutRef.current = setTimeout(() => {
              const currentIndex = SHAYARIS_DATA.findIndex((s) => s.id === shayari.id);
              const nextIndex = (currentIndex + 1) % SHAYARIS_DATA.length;
              playShayari(SHAYARIS_DATA[nextIndex]);
            }, 800);
          }
        };

        audio.onerror = () => {
          console.warn(`Audio error for ${shayari.audio}, falling back to AI voice`);
          playSpeech(shayari);
        };

        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            isPlayingRef.current = true;
            setIsPaused(false);
          })
          .catch((err) => {
            console.warn("Audio playback error, falling back to speech", err);
            playSpeech(shayari);
          });
      } else {
        // Natural speech recital with warm tanpura drone
        playSpeech(shayari);
      }
    },
    [stopAllPlayback, playSpeech, autoPlayNext]
  );

  const playNaat = useCallback(
    (naat: Naat) => {
      stopAllPlayback();
      setActiveNaat(naat);
      setCurrentTrackType("naat");
      setIsMini(false);
      setIsSpeechMode(false);

      const parsedDur = parseDurationToSeconds(naat.duration);
      setDuration(parsedDur);
      setCurrentTime(0);

      const safeUrl = encodeURI(naat.audio);
      const audio = new Audio(safeUrl);
      audioRef.current = audio;
      audio.preload = "auto";

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(audio.duration);
        }
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        isPlayingRef.current = false;
        setIsPaused(false);
        if (autoPlayNext) {
          if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
          autoNextTimeoutRef.current = setTimeout(() => {
            const curIdx = NAATS_DATA.findIndex((n) => n.id === naat.id);
            const nextIdx = (curIdx + 1) % NAATS_DATA.length;
            playNaat(NAATS_DATA[nextIdx]);
          }, 800);
        }
      };

      audio.onerror = (e) => {
        console.warn(`Audio playback error for naat ${naat.audio}`, e);
        setIsPlaying(false);
        isPlayingRef.current = false;
      };

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
          setIsPaused(false);
        })
        .catch((err) => {
          console.warn("Audio play promise error", err);
          setIsPlaying(false);
          isPlayingRef.current = false;
        });
    },
    [stopAllPlayback, autoPlayNext]
  );

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
    }
    ambientDrone?.stop();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsPaused(true);
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (audioRef.current && isPaused) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      isPlayingRef.current = true;
      setIsPaused(false);
    } else if (currentTrackType === "naat" && activeNaat) {
      playNaat(activeNaat);
    } else if (typeof window !== "undefined" && window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      ambientDrone?.start();
      speechStartTimeRef.current = Date.now() - currentTime * 1000;
      speechTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - speechStartTimeRef.current) / 1000;
        setCurrentTime(Math.min(elapsed, speechEstimatedDurRef.current));
      }, 250);
      setIsPlaying(true);
      isPlayingRef.current = true;
      setIsPaused(false);
    } else if (activeShayari) {
      playShayari(activeShayari);
    }
  }, [isPaused, currentTrackType, activeNaat, playNaat, activeShayari, currentTime, playShayari]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else if (currentTrackType === "naat" && activeNaat) {
      playNaat(activeNaat);
    } else if (activeShayari) {
      playShayari(activeShayari);
    } else {
      const initial =
        SHAYARIS_DATA.find((s) => s.page === lastReadPage) || SHAYARIS_DATA[0];
      playShayari(initial);
    }
  }, [isPlaying, isPaused, currentTrackType, activeNaat, playNaat, activeShayari, lastReadPage, pause, resume, playShayari]);

  const nextShayari = useCallback(() => {
    if (currentTrackType === "naat" && activeNaat) {
      const curIdx = NAATS_DATA.findIndex((n) => n.id === activeNaat.id);
      const nextIdx = (curIdx + 1) % NAATS_DATA.length;
      playNaat(NAATS_DATA[nextIdx]);
      return;
    }
    const curId = activeShayari ? activeShayari.id : 0;
    const curIdx = SHAYARIS_DATA.findIndex((s) => s.id === curId);
    const nextIdx = (curIdx + 1) % SHAYARIS_DATA.length;
    playShayari(SHAYARIS_DATA[nextIdx]);
  }, [currentTrackType, activeNaat, playNaat, activeShayari, playShayari]);

  const prevShayari = useCallback(() => {
    if (currentTrackType === "naat" && activeNaat) {
      const curIdx = NAATS_DATA.findIndex((n) => n.id === activeNaat.id);
      const prevIdx = (curIdx - 1 + NAATS_DATA.length) % NAATS_DATA.length;
      playNaat(NAATS_DATA[prevIdx]);
      return;
    }
    const curId = activeShayari ? activeShayari.id : 1;
    const curIdx = SHAYARIS_DATA.findIndex((s) => s.id === curId);
    const prevIdx = (curIdx - 1 + SHAYARIS_DATA.length) % SHAYARIS_DATA.length;
    playShayari(SHAYARIS_DATA[prevIdx]);
  }, [currentTrackType, activeNaat, playNaat, activeShayari, playShayari]);

  const playRandom = useCallback(() => {
    const randIdx = Math.floor(Math.random() * SHAYARIS_DATA.length);
    playShayari(SHAYARIS_DATA[randIdx]);
  }, [playShayari]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const isFavorite = useCallback(
    (id: number) => favorites.includes(id),
    [favorites]
  );

  const toggleMini = useCallback(() => {
    setIsMini((prev) => !prev);
  }, []);

  const toggleAutoPlayNext = useCallback(() => {
    setAutoPlayNext((prev) => !prev);
  }, []);

  const seek = useCallback(
    (percent: number) => {
      const targetTime = (percent / 100) * duration;
      if (audioRef.current) {
        audioRef.current.currentTime = targetTime;
        setCurrentTime(targetTime);
      } else if (isSpeechMode && activeShayari) {
        setCurrentTime(targetTime);
      }
    },
    [duration, isSpeechMode, activeShayari]
  );

  // Global Keyboard shortcuts (Desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "KeyN":
          e.preventDefault();
          nextShayari();
          break;
        case "KeyP":
          e.preventDefault();
          prevShayari();
          break;
        case "KeyM":
          e.preventDefault();
          toggleMini();
          break;
        case "KeyR":
          e.preventDefault();
          playRandom();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, nextShayari, prevShayari, toggleMini, playRandom]);

  return (
    <AudioPlayerContext.Provider
      value={{
        activeShayari,
        activeNaat,
        currentTrackType,
        isPlaying,
        isPaused,
        currentTime,
        duration,
        isSpeechMode,
        isMini,
        autoPlayNext,
        favorites,
        lastReadPage,
        playShayari,
        playNaat,
        pause,
        resume,
        togglePlay,
        nextShayari,
        prevShayari,
        playRandom,
        toggleFavorite,
        isFavorite,
        toggleMini,
        setIsMini,
        toggleAutoPlayNext,
        seek,
        setLastReadPage,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return ctx;
};
