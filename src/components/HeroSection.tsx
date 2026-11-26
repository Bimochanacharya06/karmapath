import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroTemple from "@/assets/hero-temple.jpg";
import omSymbol from "@/assets/om-symbol.png";

interface HeroSectionProps {
  panditCount?: number;
}

const HeroSection = ({ panditCount = 50 }: HeroSectionProps) => {
  const { t, lang } = useLanguage();
  const displayPanditStat = panditCount >= 5 ? `${Math.max(panditCount, 50)}+` : "50+";

  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-24 overflow-hidden bg-gradient-warm">
      {/* Soft warm ambient accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-0 w-[480px] h-[480px] rounded-full bg-primary/[0.06] blur-3xl"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Clean Editorial Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              <img src={omSymbol} alt="" aria-hidden="true" className="w-3.5 h-3.5 object-contain" />
              <span>{t("hero.badge")}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.15] tracking-tight mb-5">
              {t("hero.title1")}
              <br />
              <span className="text-gradient-saffron">{t("hero.title2")}</span>
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
              {t("hero.subtitle")}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              <Link
                to="/services#booking"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm sm:text-base hover:brightness-110 transition-all shadow-warm"
              >
                {t("hero.ctaBook")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border bg-card text-foreground font-semibold text-sm sm:text-base hover:border-primary/40 hover:text-primary transition-all"
              >
                <Sparkles className="w-4 h-4 text-primary" /> {t("hero.ctaSamagri")}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-border">
              {[
                { val: "5,000+", label: t("hero.stat1") },
                { val: displayPanditStat, label: t("hero.stat2") },
                { val: "25+", label: t("hero.stat3") },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-bold text-foreground">{s.val}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Framed Temple Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-elevated border border-border aspect-[4/4.6]">
              <img
                src={heroTemple}
                alt="Pashupatinath Temple, Kathmandu"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/65 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 bg-card/95 backdrop-blur-md rounded-2xl p-4 border border-border shadow-card flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {lang === "ne" ? "१००% प्रमाणित वैदिक गुरुहरू" : "100% Verified Vedic Pandits"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lang === "ne" ? "काठमाडौं, ललितपुर, भक्तपुर र पोखरा" : "Kathmandu, Lalitpur, Bhaktapur & Pokhara"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
