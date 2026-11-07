"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Sparkles,
  Moon,
  Coffee,
  Shuffle,
  User,
  Menu,
  X,
  Feather,
  Clock,
  Heart,
} from "lucide-react";
import { useAudioPlayer } from "@/context/AudioPlayerContext";

interface SiteHeaderProps {
  onOpenAbout: () => void;
  onOpenRandom: () => void;
  onOpenFavorites?: () => void;
  activeSection: string;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  onOpenAbout,
  onOpenRandom,
  onOpenFavorites,
  activeSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeGreeting, setTimeGreeting] = useState("");
  const [timeString, setTimeString] = useState("");
  const { favorites } = useAudioPlayer();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();

      let greeting = "रात के शेर";
      if (hours >= 4 && hours < 12) {
        greeting = "सुबह के शेर";
      } else if (hours >= 12 && hours < 17) {
        greeting = "दोपहर के शेर";
      } else if (hours >= 17 && hours < 21) {
        greeting = "शाम के शेर";
      }

      setTimeGreeting(greeting);
      setTimeString(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { id: "view-diary", label: "डायरी", icon: BookOpen },
    { id: "view-moods", label: "5 मूड्स", icon: Sparkles },
    { id: "view-sky", label: "आसमाँ", icon: Moon },
    { id: "view-wall", label: "चाय टपरी", icon: Coffee },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 76;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#faf5ee]/90 border-b border-[#e6dacd] transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <a
            href="#view-diary"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("view-diary");
            }}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#f5ece0] border border-[#dec8b2] flex items-center justify-center text-[#b86b2b] group-hover:scale-105 group-hover:border-[#b86b2b] transition-transform shadow-sm">
              <Feather className="w-5 h-5 transition-transform group-hover:-rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg sm:text-xl text-[#2d1810] tracking-tight group-hover:text-[#b86b2b] transition-colors">
                  शायरी BY <span className="text-sm sm:text-base text-[#b86b2b] font-serif font-bold">شازیہ (Shazo)</span>
                </span>
              </div>
              <p className="text-[10px] text-[#7d6456] tracking-wider hidden sm:block">
                क़लम, काग़ज़ और आवाज़ · कानपुर–मुंबई
              </p>
            </div>
          </a>

          {/* Meaningful Greeting Clock */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#e6dacd] text-xs text-[#6e5548] shadow-sm ml-3">
            <Clock className="w-3.5 h-3.5 text-[#b86b2b] animate-pulse" />
            <span className="text-[#2d1810] font-medium">{timeGreeting}</span>
            <span className="text-[#dec8b2]">·</span>
            <span className="font-mono text-[#b86b2b] text-[11px] font-semibold">{timeString}</span>
          </div>
        </div>

        {/* Desktop Nav Tabs: Coffee Pour Pill Style */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#f0e6da]/70 p-1.5 rounded-2xl border border-[#e0d2c3] shadow-inner">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                  isActive
                    ? "bg-[#ede2d4] text-[#2d1810] border border-[#d8c6b2] shadow-sm font-semibold"
                    : "text-[#6e5548] hover:text-[#2d1810] hover:bg-white/60 font-medium"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#b86b2b]" : "text-[#7d6456]"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Random Shayari Button */}
          <button
            onClick={onOpenRandom}
            title="रैंडम शेर पढ़ें"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white text-[#2d1810] border border-[#e6dacd] hover:border-[#b86b2b] hover:bg-[#faf6f0] transition-all active:scale-95 shadow-sm"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#b86b2b]" />
            <span className="hidden sm:inline">रैंडम शेर</span>
          </button>

          {/* Poet Button */}
          <button
            onClick={onOpenAbout}
            title="शायर से मिलें"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#b86b2b] text-white hover:bg-[#9c5720] transition-all active:scale-95 shadow-sm"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">शायर</span>
          </button>

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white border border-[#e6dacd] text-[#2d1810] hover:text-[#b86b2b] shadow-sm"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-5 bg-[#faf5ee]/98 border-b border-[#e6dacd] space-y-2 backdrop-blur-2xl shadow-lg">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#e6dacd] text-xs text-[#6e5548] mb-2 shadow-sm">
            <span className="flex items-center gap-2 text-[#2d1810]">
              <Clock className="w-3.5 h-3.5 text-[#b86b2b]" />
              {timeGreeting}
            </span>
            <span className="font-mono text-[#b86b2b] font-semibold">{timeString}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleNavClick(tab.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-xs font-medium border text-left transition-all ${
                    isActive
                      ? "bg-[#ede2d4] text-[#2d1810] border-[#d8c6b2] font-semibold shadow-sm"
                      : "bg-white border-[#e6dacd] text-[#6e5548] hover:border-[#b86b2b]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#b86b2b]" : "text-[#7d6456]"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRandom();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-[#e6dacd] text-xs text-[#2d1810] shadow-sm font-medium"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#b86b2b]" />
              <span>रैंडम शेर</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAbout();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#b86b2b] text-white text-xs font-medium shadow-sm hover:bg-[#9c5720]"
            >
              <User className="w-3.5 h-3.5" />
              <span>शायर से मिलें</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
