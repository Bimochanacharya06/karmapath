import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "en" | "ne";

type Dict = Record<string, { en: string; ne: string }>;

// Translation dictionary — keys used across the app
const dict: Dict = {
  // Navbar
  "nav.home": { en: "Home", ne: "गृहपृष्ठ" },
  "nav.services": { en: "Services", ne: "सेवाहरू" },
  "nav.explore": { en: "Explore", ne: "अन्वेषण" },
  "nav.marketplace": { en: "Samagri Marketplace", ne: "सामग्री बजार" },
  "nav.marketplaceDesc": { en: "AI-powered ritual goods guide", ne: "AI-संचालित अनुष्ठान सामग्री मार्गदर्शक" },
  "nav.askPandit": { en: "Ask AI Pandit", ne: "AI पण्डितलाई सोध्नुहोस्" },
  "nav.askPanditDesc": { en: "24/7 ritual guidance chatbot", ne: "२४/७ अनुष्ठान मार्गदर्शक च्याटबट" },
  "nav.blog": { en: "Blog", ne: "ब्लग" },
  "nav.resources": { en: "Resources", ne: "स्रोतहरू" },
  "nav.contact": { en: "Contact", ne: "सम्पर्क" },
  "nav.dashboard": { en: "Dashboard", ne: "ड्यासबोर्ड" },
  "nav.signin": { en: "Sign In", ne: "साइन इन" },
  "nav.signinFull": { en: "Sign In / Sign Up", ne: "साइन इन / दर्ता" },
  "nav.signout": { en: "Sign Out", ne: "साइन आउट" },

  // Hero
  "hero.badge": { en: "AI-Powered Ritual Platform", ne: "AI-संचालित अनुष्ठान मञ्च" },
  "hero.title1": { en: "Your Sacred", ne: "तपाईंको पवित्र" },
  "hero.title2": { en: "Digital Temple", ne: "डिजिटल मन्दिर" },
  "hero.subtitle": {
    en: "Book verified Pandits, get AI-powered samagri lists, and experience authentic Vedic ceremonies — all from one platform built for Nepal.",
    ne: "प्रमाणित पण्डितहरू बुक गर्नुहोस्, AI-संचालित सामग्री सूची प्राप्त गर्नुहोस्, र प्रामाणिक वैदिक अनुष्ठानहरूको अनुभव गर्नुहोस् — नेपालको लागि निर्मित एउटै मञ्चबाट।",
  },
  "hero.ctaBook": { en: "Book a Ceremony", ne: "अनुष्ठान बुक गर्नुहोस्" },
  "hero.ctaSamagri": { en: "AI Samagri Guide", ne: "AI सामग्री मार्गदर्शक" },
  "hero.stat1": { en: "Ceremonies", ne: "अनुष्ठानहरू" },
  "hero.stat2": { en: "Pandits", ne: "पण्डितहरू" },
  "hero.stat3": { en: "Cities", ne: "शहरहरू" },
  "hero.stat4": { en: "Rating", ne: "मूल्याङ्कन" },

  // Featured rituals (home)
  "featured.eyebrow": { en: "संस्कार · Featured Rituals", ne: "संस्कार · विशेष अनुष्ठान" },
  "featured.title": { en: "Sacred Life Rituals", ne: "पवित्र जीवन अनुष्ठान" },
  "featured.subtitle": {
    en: "From birth to the final journey — every Samskara is a sacred milestone. Begin with the most-booked ceremonies of the season.",
    ne: "जन्मदेखि अन्तिम यात्रासम्म — हरेक संस्कार एक पवित्र कोसेढुङ्गा हो। सिजनको सबैभन्दा धेरै बुक भएका अनुष्ठानहरूबाट सुरु गर्नुहोस्।",
  },
  "featured.viewAll": { en: "View All 16 Samskaras", ne: "सबै १६ संस्कारहरू हेर्नुहोस्" },
  "featured.bookNow": { en: "Book Now", ne: "अहिले बुक गर्नुहोस्" },

  // Ritual content
  "ritual.vivah.title": { en: "विवाह संस्कार", ne: "विवाह संस्कार" },
  "ritual.vivah.sub": { en: "Vivah · The Sacred Union", ne: "विवाह · पवित्र मिलन" },
  "ritual.vivah.desc": {
    en: "A complete Vedic wedding with Saptapadi, Kanyadaan, Mangalsutra, and the seven sacred vows around the holy fire. Performed by senior Pandits with full ritual fidelity.",
    ne: "सप्तपदी, कन्यादान, मङ्गलसूत्र र पवित्र अग्निवरिपरि सात पवित्र वचनसहित पूर्ण वैदिक विवाह। पूर्ण अनुष्ठान निष्ठाका साथ वरिष्ठ पण्डितद्वारा सम्पन्न।",
  },
  "ritual.bratabandha.title": { en: "ब्रतबन्ध", ne: "ब्रतबन्ध" },
  "ritual.bratabandha.sub": { en: "Bratabandha · Sacred Thread Initiation", ne: "ब्रतबन्ध · यज्ञोपवीत संस्कार" },
  "ritual.bratabandha.desc": {
    en: "The Upanayana ceremony marking a boy's spiritual rebirth — Gayatri Mantra initiation, sacred thread (Janai), and Bhiksha ritual following ancient Vedic procedures.",
    ne: "बालकको आध्यात्मिक पुनर्जन्म चिनो उपनयन संस्कार — गायत्री मन्त्र दीक्षा, जनै र भिक्षा अनुष्ठान, प्राचीन वैदिक विधि अनुसार।",
  },

  // Why trust
  "why.title1": { en: "Why Families Trust", ne: "परिवारहरूले किन भरोसा गर्छन्" },
  "why.subtitle": {
    en: "Nepal's most trusted platform for authentic Vedic ceremonies — connecting devoted families with experienced Pandits.",
    ne: "प्रामाणिक वैदिक अनुष्ठानका लागि नेपालको सबैभन्दा भरपर्दो मञ्च — श्रद्धालु परिवारहरूलाई अनुभवी पण्डितहरूसँग जोड्दै।",
  },
  "why.card1.title": { en: "Verified & Trusted", ne: "प्रमाणित र भरपर्दो" },
  "why.card1.desc": {
    en: "Every Pandit on KarmaPath is personally verified with authentic Vedic training, references, and years of ceremony experience across Nepal.",
    ne: "KarmaPath का हरेक पण्डित प्रामाणिक वैदिक तालिम, सिफारिस र नेपालभर वर्षौंको अनुष्ठान अनुभवसहित व्यक्तिगत रूपमा प्रमाणित छन्।",
  },
  "why.card2.title": { en: "Hassle-Free Booking", ne: "झन्झटमुक्त बुकिङ" },
  "why.card2.desc": {
    en: "Book ceremonies in minutes. Choose your ritual, select a date, pick a Pandit — we handle coordination, samagri guidance, and scheduling.",
    ne: "मिनेटमै अनुष्ठान बुक गर्नुहोस्। अनुष्ठान छान्नुहोस्, मिति चयन गर्नुहोस्, पण्डित छान्नुहोस् — समन्वय, सामग्री मार्गदर्शन र तालिका हामी सम्हाल्छौं।",
  },
  "why.card3.title": { en: "Authentic Traditions", ne: "प्रामाणिक परम्पराहरू" },
  "why.card3.desc": {
    en: "No shortcuts. Our Pandits perform complete, authentic Vedic rituals with proper mantras, procedures, and sacred traditions preserved for generations.",
    ne: "कुनै सर्टकट छैन। हाम्रा पण्डितहरूले पुस्तौँदेखि संरक्षित उचित मन्त्र, विधि र पवित्र परम्परासहित पूर्ण, प्रामाणिक वैदिक अनुष्ठान गर्छन्।",
  },

  // Pandits
  "pandits.eyebrow": { en: "पुरोहित", ne: "पुरोहित" },
  "pandits.title1": { en: "Meet Our", ne: "हाम्रा पण्डितहरूसँग" },
  "pandits.title2": { en: "Pandits", ne: "भेट्नुहोस्" },
  "pandits.subtitle": {
    en: "Each Pandit is personally verified with authentic Vedic training certificates, references, and years of ceremony experience across Nepal.",
    ne: "हरेक पण्डित प्रामाणिक वैदिक तालिम प्रमाणपत्र, सिफारिस र नेपालभर वर्षौंको अनुष्ठान अनुभवसहित व्यक्तिगत रूपमा प्रमाणित छन्।",
  },
  "pandits.years": { en: "years", ne: "वर्ष" },
  "pandits.ceremonies": { en: "ceremonies", ne: "अनुष्ठानहरू" },
  "pandits.contact": { en: "Contact", ne: "सम्पर्क" },

  // Testimonials
  "testimonials.eyebrow": { en: "प्रशंसापत्र", ne: "प्रशंसापत्र" },
  "testimonials.title": { en: "What Families Say", ne: "परिवारहरू के भन्छन्" },

  // CTA
  "cta.title": { en: "Begin Your Sacred Journey", ne: "आफ्नो पवित्र यात्रा सुरु गर्नुहोस्" },
  "cta.subtitle": {
    en: "Book a ceremony with a verified Pandit, explore our mantra library, or connect with us for guidance on any Karmakanda ritual.",
    ne: "प्रमाणित पण्डितसँग अनुष्ठान बुक गर्नुहोस्, हाम्रो मन्त्र पुस्तकालय अन्वेषण गर्नुहोस्, वा कुनै पनि कर्मकाण्ड अनुष्ठानको मार्गदर्शनका लागि हामीलाई सम्पर्क गर्नुहोस्।",
  },
  "cta.bookPuja": { en: "Book a Puja", ne: "पूजा बुक गर्नुहोस्" },
  "cta.exploreResources": { en: "Explore Resources", ne: "स्रोतहरू अन्वेषण गर्नुहोस्" },

  // Quotes
  "quotes.eyebrow": { en: "Wisdom from the Shastras", ne: "शास्त्रहरूको ज्ञान" },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("karmapath_lang") as Lang) || "en";
  });

  useEffect(() => {
    localStorage.setItem("karmapath_lang", lang);
    document.documentElement.lang = lang === "ne" ? "ne" : "en";
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  const t = (key: string) => {
    const entry = dict[key];
    if (!entry) return key;
    return entry[lang] || entry.en;
  };

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
