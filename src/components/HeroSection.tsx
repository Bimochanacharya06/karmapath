import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroVideo from "@/assets/hero-aarti.mp4.asset.json";

const floatingItems = [
  { text: "ॐ", x: "10%", y: "20%", delay: 0, size: "text-4xl" },
  { text: "🪷", x: "85%", y: "15%", delay: 1.2, size: "text-3xl" },
  { text: "🔱", x: "75%", y: "70%", delay: 0.8, size: "text-3xl" },
  { text: "🕉️", x: "15%", y: "75%", delay: 1.5, size: "text-2xl" },
];

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Pashupatinath aarti background — authentic dusk ritual ambience */}
      <div className="absolute inset-0">
        <video
          src={heroVideo.url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-deep-brown/80 via-deep-brown/55 to-deep-brown/95" />
      </div>

      {/* Floating symbols */}
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute ${item.size} opacity-25 pointer-events-none select-none text-saffron`}
          style={{ left: item.x, top: item.y }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 4 + i, delay: item.delay, ease: "easeInOut" }}
        >
          {item.text}
        </motion.div>
      ))}

      {/* Glowing orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 text-saffron text-sm font-medium mb-6"
        >
          <Sparkles className="w-4 h-4" /> {t("hero.badge")}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-cream leading-[1.1] mb-6"
        >
          {t("hero.title1")}
          <br />
          <span className="text-gradient-saffron">{t("hero.title2")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-cream/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/services"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:brightness-110 transition-all shadow-warm"
          >
            {t("hero.ctaBook")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/marketplace"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-cream/30 text-cream font-semibold text-base hover:bg-cream/10 backdrop-blur-sm transition-all"
          >
            <Sparkles className="w-4 h-4" /> {t("hero.ctaSamagri")}
          </Link>
        </motion.div>

        {/* Glass stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-16 max-w-3xl mx-auto"
        >
          {[
            { val: "5,000+", label: t("hero.stat1") },
            { val: "50+", label: t("hero.stat2") },
            { val: "25+", label: t("hero.stat3") },
            { val: "4.9★", label: t("hero.stat4") },
          ].map((s) => (
            <div key={s.label} className="bg-cream/10 backdrop-blur-md border border-cream/20 rounded-xl px-4 py-3">
              <p className="font-display text-xl md:text-2xl font-bold text-saffron">{s.val}</p>
              <p className="text-cream/70 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-cream/40 flex items-start justify-center p-1.5"
        >
          <div className="w-1.5 h-2.5 rounded-full bg-cream/60" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
