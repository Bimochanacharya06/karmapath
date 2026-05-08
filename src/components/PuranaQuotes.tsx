import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const quotes = [
  {
    sanskrit: "धर्मो रक्षति रक्षितः",
    transliteration: "Dharmo Rakshati Rakshitah",
    meaning: "Dharma protects those who protect Dharma.",
    source: "Manusmriti 8.15",
  },
  {
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",
    transliteration: "Karmanye Vadhikaraste Ma Phaleshu Kadachana",
    meaning: "You have the right to perform your duty, but never to its fruits.",
    source: "Bhagavad Gita 2.47",
  },
  {
    sanskrit: "अहिंसा परमो धर्मः",
    transliteration: "Ahimsa Paramo Dharma",
    meaning: "Non-violence is the highest moral virtue.",
    source: "Mahabharata, Anushasana Parva",
  },
  {
    sanskrit: "सत्यमेव जयते नानृतं",
    transliteration: "Satyameva Jayate Naanritam",
    meaning: "Truth alone triumphs, not falsehood.",
    source: "Mundaka Upanishad 3.1.6",
  },
  {
    sanskrit: "वसुधैव कुटुम्बकम्",
    transliteration: "Vasudhaiva Kutumbakam",
    meaning: "The whole world is one family.",
    source: "Maha Upanishad 6.72",
  },
  {
    sanskrit: "यत्र नार्यस्तु पूज्यन्ते रमन्ते तत्र देवताः",
    transliteration: "Yatra Naryastu Pujyante Ramante Tatra Devatah",
    meaning: "Where women are honored, there the gods rejoice.",
    source: "Manusmriti 3.56",
  },
];

const PuranaQuotes = () => {
  const [current, setCurrent] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % quotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const q = quotes[current];

  return (
    <section className="py-20 bg-deep-brown relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-8xl text-cream font-display">ॐ</div>
        <div className="absolute bottom-10 right-10 text-8xl text-cream font-display">श्री</div>
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream/10 text-saffron text-sm font-medium mb-8">
          <BookOpen className="w-4 h-4" /> {t("quotes.eyebrow")}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-display text-3xl md:text-5xl text-saffron mb-4 leading-snug">
              "{q.sanskrit}"
            </p>
            <p className="text-cream/60 text-sm md:text-base italic mb-2">
              {q.transliteration}
            </p>
            <p className="text-cream/80 text-lg md:text-xl font-medium mb-4 max-w-2xl mx-auto">
              {q.meaning}
            </p>
            <p className="text-cream/40 text-sm">— {q.source}</p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-10">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-saffron w-6" : "bg-cream/20 hover:bg-cream/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PuranaQuotes;
