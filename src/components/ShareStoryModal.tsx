"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, Download, Share2, Check, Sparkles, Image as ImageIcon } from "lucide-react";
import { Shayari } from "@/data/shayari";

interface ShareStoryModalProps {
  shayari: Shayari | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareStoryModal: React.FC<ShareStoryModalProps> = ({
  shayari,
  isOpen,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !shayari) return;

    setIsGenerating(true);
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw background gradient (warm cafe latte froth)
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, "#faf5ee");
    bgGrad.addColorStop(0.5, "#f3eae0");
    bgGrad.addColorStop(1, "#ede0d0");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Warm radial glow
    const radial = ctx.createRadialGradient(540, 960, 50, 540, 960, 600);
    radial.addColorStop(0, "rgba(184, 107, 43, 0.08)");
    radial.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1080, 1920);

    // Warm caramel decorative border
    ctx.strokeStyle = "rgba(184, 107, 43, 0.35)";
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1000, 1840);
    ctx.strokeStyle = "rgba(93, 58, 38, 0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(55, 55, 970, 1810);

    // Top Brand
    ctx.fillStyle = "#b86b2b";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("शायरी BY SHAZO", 540, 160);

    ctx.fillStyle = "#6e5548";
    ctx.font = "24px sans-serif";
    ctx.fillText("क़लम, काग़ज़ और आवाज़ · NH 48 · लखनऊ–दिल्ली", 540, 205);

    // Mood Badge
    ctx.fillStyle = "rgba(184, 107, 43, 0.12)";
    ctx.beginPath();
    ctx.roundRect(420, 240, 240, 50, 25);
    ctx.fill();
    ctx.strokeStyle = "rgba(184, 107, 43, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#2d1810";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(`मूड: ${shayari.mood}`, 540, 273);

    // Load and draw image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = shayari.image;

    const renderRemaining = () => {
      // Bottom Author credit
      ctx.fillStyle = "#2d1810";
      ctx.font = "bold 34px serif";
      ctx.textAlign = "center";
      ctx.fillText("— شازیہ (Shazo)", 540, 1680);

      ctx.fillStyle = "#b86b2b";
      ctx.font = "24px sans-serif";
      ctx.fillText("abutalha09.vercel.app", 540, 1730);

      ctx.fillStyle = "#7d6456";
      ctx.font = "20px monospace";
      ctx.fillText(`सफ़ा #${shayari.page} / 59 · NH 48`, 540, 1780);

      try {
        const url = canvas.toDataURL("image/png");
        setDownloadUrl(url);
      } catch (e) {
        console.warn("Canvas toDataURL failed", e);
      }
      setIsGenerating(false);
    };

    img.onload = () => {
      const targetW = 860;
      const targetH = 1140;
      const targetX = (1080 - targetW) / 2;
      const targetY = 360;

      // Card shadow & background
      ctx.shadowColor = "rgba(78, 52, 46, 0.18)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(targetX, targetY, targetW, targetH, 24);
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw clipped photo
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(targetX + 16, targetY + 16, targetW - 32, targetH - 32, 16);
      ctx.clip();
      ctx.drawImage(img, targetX + 16, targetY + 16, targetW - 32, targetH - 32);
      ctx.restore();

      renderRemaining();
    };

    img.onerror = () => {
      // Fallback: draw typed text box
      const targetW = 860;
      const targetH = 900;
      const targetX = (1080 - targetW) / 2;
      const targetY = 480;

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(targetX, targetY, targetW, targetH, 24);
      ctx.fill();

      ctx.fillStyle = "#2d1810";
      ctx.font = "32px serif";
      ctx.textAlign = "center";

      const lines = shayari.text.split("\n").slice(0, 10);
      let y = targetY + 120;
      for (const line of lines) {
        ctx.fillText(line, 540, y);
        y += 55;
      }

      renderRemaining();
    };
  }, [isOpen, shayari]);

  if (!isOpen || !shayari) return null;

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `shazo-shayari-${shayari.page}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNativeShare = async () => {
    if (navigator.share && downloadUrl) {
      try {
        const blob = await (await fetch(downloadUrl)).blob();
        const file = new File([blob], `shazo-shayari-${shayari.page}.png`, {
          type: "image/png",
        });
        await navigator.share({
          title: `शायरी by Shazo - सफ़ा #${shayari.page}`,
          text: `${shayari.title}\n\n${shayari.text.slice(0, 100)}...\n\nपूरी डायरी पढ़ें: https://abutalha09.vercel.app`,
          files: [file],
        });
      } catch (e) {
        console.warn("Share cancelled or failed", e);
      }
    } else {
      navigator.clipboard.writeText(
        `https://abutalha09.vercel.app #shayari-${shayari.page}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white border border-[#dec8b2] p-5 sm:p-6 text-[#2d1810] shadow-2xl flex flex-col items-center max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#faf6f0] border border-[#dec8b2] text-[#7d6456] hover:text-[#2d1810] transition-colors shadow-sm"
          aria-label="बंद करें"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-serif font-bold text-[#2d1810] mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#b86b2b]" />
          Instagram Story Card
        </h3>
        <p className="text-xs text-[#6e5548] mb-4">
          1080 × 1920 (WhatsApp Status / Instagram Story)
        </p>

        {/* Story Preview */}
        <div className="w-full max-w-[260px] aspect-[9/16] rounded-2xl overflow-hidden border-2 border-[#b86b2b]/40 shadow-xl relative bg-[#faf6f0] flex items-center justify-center">
          {isGenerating ? (
            <div className="text-center p-4 text-xs text-[#7d6456] space-y-2">
              <div className="w-6 h-6 border-2 border-[#b86b2b] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>कार्ड तैयार हो रहा है...</p>
            </div>
          ) : (
            downloadUrl && (
              <img
                src={downloadUrl}
                alt="Story Preview"
                className="w-full h-full object-contain"
              />
            )
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={handleDownload}
            disabled={isGenerating || !downloadUrl}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#b86b2b] text-white text-xs font-semibold hover:bg-[#9c5720] disabled:opacity-50 transition-all shadow-md shadow-[#b86b2b]/25 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>डाउनलोड (PNG)</span>
          </button>

          <button
            onClick={handleNativeShare}
            disabled={isGenerating || !downloadUrl}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-[#dec8b2] text-[#2d1810] text-xs font-semibold hover:bg-[#faf6f0] disabled:opacity-50 transition-all shadow-sm active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>लिंक कॉपी हुआ!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#b86b2b]" />
                <span>शेयर करें</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
