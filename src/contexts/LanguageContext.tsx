import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "ne" | "en";

type Dict = Record<string, { ne: string; en: string }>;

const dict: Dict = {
  // Navbar
  "nav.home": { ne: "गृहपृष्ठ", en: "Home" },
  "nav.services": { ne: "सेवाहरू", en: "Services" },
  "nav.marketplace": { ne: "पूजा सामग्री", en: "Samagri" },
  "nav.resources": { ne: "विधि र मन्त्र", en: "Guides" },
  "nav.blog": { ne: "ब्लग", en: "Blog" },
  "nav.contact": { ne: "सम्पर्क", en: "Contact" },
  "nav.dashboard": { ne: "ड्यासबोर्ड", en: "Dashboard" },
  "nav.signin": { ne: "साइन इन", en: "Sign In" },
  "nav.signinFull": { ne: "साइन इन / दर्ता", en: "Sign In / Sign Up" },
  "nav.signout": { ne: "साइन आउट", en: "Sign Out" },

  // Hero
  "hero.badge": { ne: "नेपालको वैदिक पूजा मञ्च", en: "Vedic Ritual Platform of Nepal" },
  "hero.title1": { ne: "घरमै विधिपूर्वक", en: "Authentic Vedic" },
  "hero.title2": { ne: "वैदिक पूजा र संस्कार", en: "Rituals & Samskaras" },
  "hero.subtitle": {
    ne: "अनुभवी पण्डित बुक गर्नुहोस् र आवश्यक पूजा सामग्रीको सहज सूची तुरुन्त पाउनुहोस्।",
    en: "Book verified Pandits across Nepal and get instant puja samagri checklists in minutes.",
  },
  "hero.ctaBook": { ne: "पूजा बुक गर्नुहोस्", en: "Book a Ceremony" },
  "hero.ctaSamagri": { ne: "सामग्री सूची", en: "Samagri Guide" },
  "hero.stat1": { ne: "सम्पन्न पूजा", en: "Ceremonies" },
  "hero.stat2": { ne: "प्रमाणित गुरु", en: "Pandits" },
  "hero.stat3": { ne: "शहरहरू", en: "Cities" },

  // Rituals
  "featured.eyebrow": { ne: "पवित्र संस्कार", en: "Sacred Rituals" },
  "featured.title": { ne: "प्रमुख वैदिक सेवाहरू", en: "Core Vedic Ceremonies" },
  "featured.viewAll": { ne: "सबै सेवाहरू हेर्नुहोस्", en: "View All Services" },
  "featured.bookNow": { ne: "बुक गर्नुहोस्", en: "Book Now" },

  // Pandits
  "pandits.eyebrow": { ne: "हाम्रा पुरोहित", en: "Our Acharyas" },
  "pandits.title1": { ne: "अनुभवी र प्रमाणित", en: "Verified Vedic" },
  "pandits.title2": { ne: "पण्डितहरू", en: "Pandits" },
  "pandits.years": { ne: "वर्ष अनुभव", en: "yrs exp" },
  "pandits.ceremonies": { ne: "पूजा", en: "pujas" },
  "pandits.contact": { ne: "बुक गर्नुहोस्", en: "Book" },

  // CTA
  "cta.title": { ne: "शुभ कार्यको तयारी सुरु गरौं", en: "Ready to Plan Your Ceremony?" },
  "cta.subtitle": {
    ne: "तपाईंको परिवारको परम्परा अनुसार अनुभवी पण्डितसँग सजिलै समय मिलाउनुहोस्।",
    en: "Schedule a verified Pandit tailored to your family's Vedic tradition.",
  },
  "cta.bookPuja": { ne: "अहिले बुक गर्नुहोस्", en: "Book a Puja" },
  "cta.exploreResources": { ne: "मन्त्र र विधि हेर्नुहोस्", en: "Read Ritual Guides" },
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const STORAGE_KEY = "karmapath_lang_v2";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ne";
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "ne" ? saved : "ne";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === "ne" ? "ne" : "en";
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  const t = (key: string) => {
    const entry = dict[key];
    if (!entry) return key;
    return entry[lang] || entry.ne;
  };

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
