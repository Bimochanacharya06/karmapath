import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Sparkles, UserCheck, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { SERVICE_PACKAGES, type ServicePackageItem } from "@/data/serviceCatalog";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PanditSection from "@/components/PanditSection";
import QuickBookModal from "@/components/QuickBookModal";
import Footer from "@/components/Footer";
import omSymbol from "@/assets/om-symbol.png";

const Index = () => {
  const { t, lang } = useLanguage();
  const [panditCount, setPanditCount] = useState(5);
  const [quickBook, setQuickBook] = useState<{ open: boolean; pkg: ServicePackageItem | null }>({
    open: false,
    pkg: null,
  });

  useEffect(() => {
    supabase
      .from("pandits")
      .select("id", { count: "exact", head: true })
      .eq("verified", true)
      .then(({ count }) => {
        if (count) setPanditCount(count);
      });
  }, []);

  const topTwo = SERVICE_PACKAGES.slice(0, 2);
  const nextFour = SERVICE_PACKAGES.slice(2, 6);

  const steps = [
    {
      icon: Sparkles,
      num: lang === "ne" ? "०१" : "01",
      title: lang === "ne" ? "संस्कार र मिति छनोट" : "Select Ritual & Date",
      desc:
        lang === "ne"
          ? "आफ्नो परिवारलाई आवश्यक पूजा र सहज मिति अनलाइन पठाउनुहोस्।"
          : "Pick your ceremony and preferred date in seconds.",
    },
    {
      icon: UserCheck,
      num: lang === "ne" ? "०२" : "02",
      title: lang === "ne" ? "पण्डित र सामग्री समन्वय" : "Pandit & Samagri Coordination",
      desc:
        lang === "ne"
          ? "तपाईंको कुल-परम्परा मिल्ने गुरु र आवश्यक सामग्री व्यवस्था गरिन्छ।"
          : "We match a verified Acharya and coordinate your samagri needs.",
    },
    {
      icon: Flame,
      num: lang === "ne" ? "०३" : "03",
      title: lang === "ne" ? "घरमै विधिपूर्वक पूजा" : "Authentic Home Ceremony",
      desc:
        lang === "ne"
          ? "शुभ साइतमा पूर्ण वैदिक मन्त्र र विधिसहित अनुष्ठान सम्पन्न हुन्छ।"
          : "Experience a serene, complete Vedic ceremony at your doorstep.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection panditCount={panditCount} />

      {/* Section 1: Editorial Bento Sacred Ceremonies Showcase (Zero Price Clutter) */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-1.5">
                {t("featured.eyebrow")}
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {t("featured.title")}
              </h2>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
            >
              {t("featured.viewAll")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Featured 2 Large Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {topTwo.map((pkg, i) => {
              const title = lang === "ne" ? pkg.titleNe : pkg.titleEn;
              const tagline = lang === "ne" ? pkg.taglineNe : pkg.taglineEn;
              const duration = lang === "ne" ? pkg.durationNe : pkg.durationEn;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative rounded-3xl overflow-hidden aspect-[16/10] shadow-card hover:shadow-elevated border border-border"
                >
                  <img
                    src={pkg.image}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/92 via-deep-brown/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-deep-brown/75 backdrop-blur-md text-cream text-xs font-medium">
                      <Clock className="w-3 h-3 text-saffron" /> {duration}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream mb-1.5">{title}</h3>
                      <p className="text-cream/80 text-xs sm:text-sm max-w-md line-clamp-2">{tagline}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuickBook({ open: true, pkg })}
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all shadow-warm"
                    >
                      {t("featured.bookNow")} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Secondary 4 Sleek Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {nextFour.map((pkg, i) => {
              const title = lang === "ne" ? pkg.titleNe : pkg.titleEn;
              const tagline = lang === "ne" ? pkg.taglineNe : pkg.taglineEn;
              const duration = lang === "ne" ? pkg.durationNe : pkg.durationEn;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-elevated transition-all flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-deep-brown/75 text-cream text-[11px]">
                      <Clock className="w-3 h-3 text-saffron" /> {duration}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-1">{title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{tagline}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuickBook({ open: true, pkg })}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2.5 transition-all"
                    >
                      {t("featured.bookNow")} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 2: Simple 3-Step Sacred Flow */}
      <section className="py-16 bg-gradient-warm border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div
                key={s.num}
                className="bg-card rounded-2xl p-6 border border-border shadow-card flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-primary tracking-wider">{s.num}</span>
                  <h3 className="font-display text-lg font-bold text-foreground mt-0.5 mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Verified Pandits */}
      <PanditSection />

      {/* Section 4: Warm Temple Sankalpa CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-deep-brown text-cream p-8 sm:p-12 text-center relative overflow-hidden shadow-elevated">
          <div className="w-12 h-12 rounded-full bg-cream/10 border border-saffron/35 flex items-center justify-center p-2.5 mx-auto mb-5">
            <img src={omSymbol} alt="" aria-hidden="true" className="w-full h-full object-contain brightness-125" />
          </div>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-cream mb-3">{t("cta.title")}</h2>
          <p className="text-warm-stone text-sm sm:text-base max-w-lg mx-auto mb-7">{t("cta.subtitle")}</p>
          <div className="flex flex-wrap gap-3.5 justify-center">
            <Link
              to="/services#booking"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all shadow-warm"
            >
              {t("cta.bookPuja")} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center px-7 py-3.5 rounded-full border border-cream/25 text-cream text-sm font-semibold hover:bg-cream/10 transition-colors"
            >
              {t("hero.ctaSamagri")}
            </Link>
          </div>
        </div>
      </section>

      <QuickBookModal
        open={quickBook.open}
        onOpenChange={(o) => setQuickBook((s) => ({ ...s, open: o }))}
        ritual={quickBook.pkg ? (lang === "ne" ? quickBook.pkg.titleNe : quickBook.pkg.titleEn) : ""}
      />

      <Footer />
    </div>
  );
};

export default Index;
