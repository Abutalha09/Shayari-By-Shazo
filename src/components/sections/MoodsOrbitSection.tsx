"use client";

import React, { useMemo } from "react";
import { DishOrbitCarousel, Dish } from "@/components/ui/dish-orbit-carousel";
import { SHAYARIS_DATA, Shayari } from "@/data/shayari";
import { useAudioPlayer } from "@/context/AudioPlayerContext";
import { Sparkles } from "lucide-react";

interface MoodsOrbitSectionProps {
  onSelectMood?: (mood: string) => void;
}

export const MoodsOrbitSection: React.FC<MoodsOrbitSectionProps> = ({
  onSelectMood,
}) => {
  const { playShayari } = useAudioPlayer();

  const moodDishes: Dish[] = useMemo(
    () => [
      {
        id: "mood-ishq",
        title: "पहला",
        subtitle: "इश्क़",
        label: "इश्क़ व मोहब्बत",
        image: "images/moods/ishq.svg",
        alt: "इश्क़ की कशिश",
        rating: 4.9,
        chef: "شازیہ",
        kitchen: "NH 48 · लखनऊ–दिल्ली",
        description:
          "इश्क़ वो नहीं जो सिर्फ लफ़्ज़ों में बयां हो, इश्क़ वो है जो खामोशी में भी दिल की धड़कन बनकर सुनाई दे।",
        likes: 240,
        ingredients: ["मोहब्बत", "दीदार", "क़रीब", "एहसास", "इकरार"],
        accent: "#f43f5e",
        eyebrow: "मूड 01 · दिल के जज़्बात",
      },
      {
        id: "mood-judaai",
        title: "तन्हा",
        subtitle: "जुदाई",
        label: "दर्द व हिज्र",
        image: "images/moods/judaai.svg",
        alt: "तन्हाई और जुदाई",
        rating: 4.8,
        chef: "شازیہ",
        kitchen: "सन्नाटे की रातें",
        description:
          "कुछ रिश्ते दूर रहकर भी दिल के सबसे करीब होते हैं, और कुछ का साथ होकर भी दूरियों का अहसास रहता है।",
        likes: 310,
        ingredients: ["तन्हाई", "यादें", "आँसू", "सन्नाटा", "फासले"],
        accent: "#3b82f6",
        eyebrow: "मूड 02 · हिज्र की दास्तान",
      },
      {
        id: "mood-chai",
        title: "रात की",
        subtitle: "चाय",
        label: "चाय वाली रातें",
        image: "images/moods/chai.svg",
        alt: "कुल्हड़ चाय की चुस्की",
        rating: 5.0,
        chef: "شازیہ",
        kitchen: "हाईवे की टपरी",
        description:
          "एक कप कड़क चाय और रात के दो बजे... ज़हन के सारे उलझे हुए शेर खुद-ब-खुद डायरी के पन्नों पर उतर आते हैं।",
        likes: 580,
        ingredients: ["कुल्हड़", "अदरक", "सफ़र", "यारी", "तपिश"],
        accent: "#f59e0b",
        eyebrow: "मूड 03 · चाय और क़लम",
      },
      {
        id: "mood-umeed",
        title: "रौशन",
        subtitle: "उम्मीद",
        label: "यकीन व हौसला",
        image: "images/moods/umeed.svg",
        alt: "उम्मीद का सूरज",
        rating: 4.9,
        chef: "شازیہ",
        kitchen: "रब की रहमत",
        description:
          "मेरा रब फरमाता है: ऐ बंदे तू रहम मांग, हौसला मांग, सब्र मांग... मैं तो पत्थर में भी कीड़ों को पालता हूँ, तू तो इंसान है।",
        likes: 420,
        ingredients: ["यकीन", "सब्र", "रहम", "सवेरा", "हौसला"],
        accent: "#10b981",
        eyebrow: "मूड 04 · रब पर भरोसा",
      },
      {
        id: "mood-safar",
        title: "सफ़र",
        subtitle: "NH 48",
        label: "हाईवे के शेर",
        image: "images/moods/safar.svg",
        alt: "रात का हाईवे",
        rating: 4.9,
        chef: "شازیہ",
        kitchen: "सड़क व क़लम",
        description:
          "लखनऊ से दिल्ली की ये लंबी सड़कें सिर्फ फासले नहीं तय करतीं, तन्हाई में नए शेर भी तराशती हैं।",
        likes: 380,
        ingredients: ["मंज़िल", "पहिए", "रोशनी", "तारें", "रास्ते"],
        accent: "#ea580c",
        eyebrow: "मूड 05 · सफ़र के शेर",
      },
    ],
    []
  );

  const handlePlayMoodSher = (dish: Dish) => {
    // Find matching mood in SHAYARIS_DATA
    let moodKey = "Chai-wali-raatein";
    if (dish.id === "mood-ishq") moodKey = "Ishq";
    if (dish.id === "mood-judaai") moodKey = "Judaai";
    if (dish.id === "mood-umeed") moodKey = "Umeed";
    if (dish.id === "mood-safar") moodKey = "Chai-wali-raatein";

    const match =
      SHAYARIS_DATA.find((s) => s.mood.toLowerCase().includes(moodKey.toLowerCase())) ||
      SHAYARIS_DATA[0];

    playShayari(match);
  };

  return (
    <section id="view-moods" className="relative w-full scroll-mt-24">
      {/* Pre-built DishOrbitCarousel Component */}
      <DishOrbitCarousel
        dishes={moodDishes}
        fontSrc={null} // Use host font (Mukta + Outfit) for perfect Devanagari 2-weight wiping
        height="100vh"
        loop={false}
        onPlay={(dish) => handlePlayMoodSher(dish)}
        onOrder={(dish) => {
          if (onSelectMood) onSelectMood(dish.title);
        }}
      />
    </section>
  );
};

