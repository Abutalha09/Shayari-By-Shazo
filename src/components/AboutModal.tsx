"use client";

import React from "react";
import { X, ExternalLink, Feather, MapPin, Coffee, Heart } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white border border-[#dec8b2] p-6 sm:p-8 text-[#2d1810] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient circle */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#b86b2b]/10 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#faf6f0] border border-[#dec8b2] text-[#7d6456] hover:text-[#2d1810] hover:bg-[#f5ece0] transition-colors"
          aria-label="बंद करें"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#f5ece0] border border-[#dec8b2] flex items-center justify-center text-[#b86b2b] shadow-sm flex-shrink-0">
            <Feather className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[11px] font-mono tracking-widest text-[#b86b2b] uppercase font-semibold">
              The Poet & Calligrapher
            </span>
            <h3 className="text-2xl font-serif font-bold text-[#2d1810]">
              شازیہ
            </h3>
            <p className="text-xs text-[#6e5548] flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#b86b2b]" />
              NH 48 · लखनऊ–दिल्ली (तहरीरें और ख़याल)
            </p>
          </div>
        </div>

        {/* Bio Content */}
        <div className="space-y-4 text-sm text-[#543015] leading-relaxed font-sans">
          <p>
            "शायरी by Shazo" सिर्फ लफ़्ज़ों का मजमुआ नहीं, बल्कि रात के सन्नाटे,
            सफ़र के ख़यालों और चाय की चुस्कियों के बीच डायरी के पन्नों पर क़लम से उकेरे गए
            ज़ज़्बात हैं।
          </p>
          <p className="text-xs text-[#7d6456] italic border-l-2 border-[#b86b2b] pl-3 py-1 bg-[#faf6f0] rounded-r-lg">
            "रात गहरी होती है तो अल्फ़ाज़ जागते हैं... NH 48 के किसी ढाबे पर रखी चाय की प्याली से उठते धुएँ जैसी ये नज़्में हैं।"
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[#faf6f0] border border-[#dec8b2] text-center shadow-sm">
              <span className="block text-xl font-serif font-bold text-[#b86b2b]">59</span>
              <span className="text-[11px] text-[#7d6456]">हस्तलिखित पन्ने</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#faf6f0] border border-[#dec8b2] text-center shadow-sm">
              <span className="block text-xl font-serif font-bold text-[#b86b2b]">5</span>
              <span className="text-[11px] text-[#7d6456]">मूड रूम्स व अहसास</span>
            </div>
          </div>
        </div>

        {/* Footer Link to Portfolio */}
        <div className="mt-6 pt-5 border-t border-[#dec8b2] flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="https://abutalha09.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#b86b2b] text-white text-xs font-semibold hover:bg-[#9c5720] transition-all shadow-md shadow-[#b86b2b]/25 active:scale-95"
          >
            <span>पोर्टफोलियो देखें (abutalha09)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs text-[#7d6456] hover:text-[#2d1810] transition-colors"
          >
            वापस डायरी पर जाएँ
          </button>
        </div>
      </div>
    </div>
  );
};
