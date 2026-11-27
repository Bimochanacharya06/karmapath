import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Clock, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  SERVICE_PACKAGES,
  type ServiceCategory,
  type ServicePackageItem,
  type ServicePackageTier,
} from "@/data/serviceCatalog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PujaBookingForm from "@/components/PujaBookingForm";
import QuickBookModal from "@/components/QuickBookModal";

const Services = () => {
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();

  const [category, setCategory] = useState<"all" | ServiceCategory>("all");
  const [tier, setTier] = useState<ServicePackageTier>(() =>
    searchParams.get("tier") === "pandit" ? "pandit" : "full",
  );
  const [query, setQuery] = useState("");
  const [quickBook, setQuickBook] = useState<{ open: boolean; pkg: ServicePackageItem | null }>({
    open: false,
    pkg: null,
  });

  const highlightedServiceId = searchParams.get("service") || "";

  useEffect(() => {
    const paramTier = searchParams.get("tier");
    if (paramTier === "pandit" || paramTier === "full") {
      setTier(paramTier);
    }
  }, [searchParams]);

  const filteredServices = SERVICE_PACKAGES.filter((pkg) => {
    if (category !== "all" && pkg.category !== category) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      pkg.titleNe.toLowerCase().includes(q) ||
      pkg.titleEn.toLowerCase().includes(q) ||
      pkg.taglineNe.toLowerCase().includes(q) ||
      pkg.taglineEn.toLowerCase().includes(q)
    );
  });

  const categoryTabs: { key: "all" | ServiceCategory; ne: string; en: string }[] = [
    { key: "all", ne: "सबै सेवा", en: "All Ceremonies" },
    { key: "home", ne: "गृह र शान्ति पूजा", en: "Home & Shanti Puja" },
    { key: "milestone", ne: "जीवन संस्कार", en: "Life Samskaras" },
    { key: "ancestral", ne: "पितृ कर्म", en: "Ancestral Rites" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Service Catalog Header + Scope Switcher */}
      <section className="pt-24 pb-8 bg-gradient-warm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-1.5">
                {lang === "ne" ? "हाम्रा वैदिक सेवाहरू" : "Sacred Vedic Services"}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                {lang === "ne" ? "पूजा सेवा र पण्डित बुकिङ" : "Ceremony Services & Pandit Booking"}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
                {lang === "ne"
                  ? "पण्डित सहित पूजा सामग्री व्यवस्था वा पण्डित मात्र — आवश्यकता अनुसार सेवा छान्नुहोस्।"
                  : "Choose complete Pandit + Samagri coordination or Pandit-only guidance for your family."}
              </p>
            </div>

            {/* Service Scope Switcher (No Price Clutter) */}
            <div className="inline-flex items-center p-1 rounded-full bg-card border border-border shadow-card self-start">
              <button
                type="button"
                onClick={() => setTier("full")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  tier === "full" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "ne" ? "सम्पूर्ण व्यवस्था (पण्डित + सामग्री)" : "Pandit + Samagri Setup"}
              </button>
              <button
                type="button"
                onClick={() => setTier("pandit")}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  tier === "pandit" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "ne" ? "पण्डित मात्र" : "Pandit Only"}
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setCategory(tab.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    category === tab.key
                      ? "bg-foreground text-background"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang === "ne" ? tab.ne : tab.en}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lang === "ne" ? "सेवा खोज्नुहोस्..." : "Search ceremonies..."}
                className="pl-9 h-9 rounded-full bg-card text-xs"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="packages" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredServices.map((pkg, idx) => {
              const title = lang === "ne" ? pkg.titleNe : pkg.titleEn;
              const tagline = lang === "ne" ? pkg.taglineNe : pkg.taglineEn;
              const duration = lang === "ne" ? pkg.durationNe : pkg.durationEn;
              const includes =
                tier === "full"
                  ? lang === "ne"
                    ? pkg.includesFullNe
                    : pkg.includesFullEn
                  : lang === "ne"
                    ? pkg.includesPanditNe
                    : pkg.includesPanditEn;
              const isHighlighted = highlightedServiceId === pkg.id;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                  className={`bg-card rounded-2xl overflow-hidden border transition-all flex flex-col ${
                    isHighlighted
                      ? "border-primary ring-2 ring-primary/25 shadow-elevated"
                      : "border-border hover:border-primary/40 hover:shadow-elevated"
                  }`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-deep-brown/80 text-cream text-[10px] font-medium">
                        <Clock className="w-2.5 h-2.5 text-saffron" /> {duration}
                      </span>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-card/95 text-foreground text-[10px] font-semibold">
                        <Star className="w-2.5 h-2.5 fill-saffron text-saffron" /> {pkg.rating}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-1">{title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3.5">{tagline}</p>

                      <ul className="space-y-1.5 pt-3 border-t border-border mb-4">
                        {includes.map((item) => (
                          <li key={item} className="flex items-center gap-1.5 text-xs text-foreground">
                            <Check className="w-3.5 h-3.5 text-secondary shrink-0" />
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickBook({ open: true, pkg })}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all"
                      >
                        {lang === "ne" ? "बुक गर्नुहोस्" : "Book Now"} <ArrowRight className="w-3 h-3" />
                      </button>
                      <Link
                        to={`/marketplace?puja=${encodeURIComponent(pkg.samagriQuery)}`}
                        className="py-2.5 px-3 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {lang === "ne" ? "सामग्री" : "Samagri"}
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <QuickBookModal
        open={quickBook.open}
        onOpenChange={(o) => setQuickBook((s) => ({ ...s, open: o }))}
        ritual={
          quickBook.pkg
            ? `${lang === "ne" ? quickBook.pkg.titleNe : quickBook.pkg.titleEn} (${
                tier === "full"
                  ? lang === "ne"
                    ? "पण्डित + सामग्री"
                    : "Pandit + Samagri"
                  : lang === "ne"
                    ? "पण्डित मात्र"
                    : "Pandit Only"
              })`
            : ""
        }
      />

      {/* Custom Booking Form */}
      <section id="booking" className="py-16 bg-gradient-warm border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-1">
              {lang === "ne" ? "विस्तृत बुकिङ" : "Ceremony Booking"}
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {lang === "ne" ? "पूजा बुकिङ फारम" : "Request Your Ceremony"}
            </h2>
          </div>
          <PujaBookingForm />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
