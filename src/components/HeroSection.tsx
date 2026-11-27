import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, PackageCheck, HeartHandshake, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroTemple from "@/assets/hero-temple.jpg";
import pujaItems from "@/assets/puja-items.jpg";
import omSymbol from "@/assets/om-symbol.png";

interface HeroSectionProps {
  panditCount?: number;
}

const HeroSection = ({ panditCount = 50 }: HeroSectionProps) => {
  const { t, lang } = useLanguage();
  const displayPanditStat = panditCount >= 5 ? `${Math.max(panditCount, 50)}+` : "50+";

  return (
    <section className="relative pt-24 pb-14 md:pt-28 md:pb-20 overflow-hidden bg-gradient-warm border-b border-border/70">
      {/* Subtle Sacred Ambient Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/8 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-0 w-[28rem] h-[28rem] rounded-full bg-accent/80 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Text, Actions & Sacred Trust Metrics */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-card border border-primary/20 shadow-card text-foreground text-xs sm:text-sm font-semibold mb-6"
            >
              <img src={omSymbol} alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
              <span className="text-primary">{t("hero.badge")}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="font-display text-4xl sm:text-5xl lg:text-[3.55rem] font-bold text-foreground leading-[1.15] mb-5"
            >
              {t("hero.title1")}
              <br />
              <span className="text-gradient-vermillion">{t("hero.title2")}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="text-muted-foreground text-base sm:text-lg max-w-xl mb-8 leading-relaxed"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="flex flex-wrap items-center gap-3.5 mb-10"
            >
              <Link
                to="/services"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm sm:text-base hover:brightness-110 transition-all shadow-warm"
              >
                {t("hero.ctaBook")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border bg-card text-foreground font-semibold text-sm sm:text-base hover:border-primary/40 hover:text-primary transition-all shadow-card"
              >
                <Sparkles className="w-4 h-4 text-primary" /> {t("hero.ctaSamagri")}
              </Link>
            </motion.div>

            {/* Concise 3-Pillar Trust Row */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-border/80 max-w-xl"
            >
              <div>
                <p className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  {displayPanditStat}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("hero.stat2")}</p>
              </div>
              <div>
                <p className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-secondary shrink-0" />
                  100%
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lang === "ne" ? "पण्डित र सामग्री सुविधा" : "Pandit & Samagri"}
                </p>
              </div>
              <div>
                <p className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-primary shrink-0" />
                  5,000+
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("hero.stat1")}</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Sacred Editorial Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.14 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative mx-auto max-w-xl lg:max-w-none">
              {/* Decorative Warm Frame Accent */}
              <div
                aria-hidden="true"
                className="absolute -inset-2.5 rounded-[2.25rem] bg-gradient-to-tr from-primary/18 via-accent to-transparent -z-10"
              />

              {/* Primary Sacred Photograph */}
              <div className="relative rounded-[2rem] overflow-hidden aspect-[4/3.5] shadow-elevated border-4 border-card bg-muted">
                <img
                  src={heroTemple}
                  alt={
                    lang === "ne"
                      ? "पशुपतिनाथ सन्ध्या आरती र वैदिक पूजा परम्परा"
                      : "Pashupatinath evening aarti and Vedic ritual heritage"
                  }
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/55 via-transparent to-transparent" />

                {/* Top-Right Sacred Tradition Tag */}
                <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-deep-brown/80 backdrop-blur-md border border-cream/20 text-cream text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-saffron animate-pulse" />
                  {lang === "ne" ? "शुद्ध वैदिक कर्मकाण्ड" : "Authentic Karmakanda"}
                </div>
              </div>

              {/* Overlapping Floating Sacred Samagri & Acharya Card */}
              <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:-left-5 bg-card/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-border shadow-elevated flex items-center gap-3.5 max-w-xs">
                <img
                  src={pujaItems}
                  alt=""
                  aria-hidden="true"
                  className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
                />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                    {lang === "ne" ? "घरदैलोमा अनुभवी गुरु" : "Verified Home Acharyas"}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                    {lang === "ne"
                      ? "विवाह, ब्रतबन्ध, गृह प्रवेश र सत्यनारायण पूजा"
                      : "Vivah, Bratabandha, Griha Pravesh & Puja"}
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
