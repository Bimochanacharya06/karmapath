import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PanditSection from "@/components/PanditSection";
import Footer from "@/components/Footer";

import vivahImg from "@/assets/service-vivah.jpg";
import bratabandhaImg from "@/assets/service-bratabandha.jpg";
import namakaranImg from "@/assets/service-namakaran.jpg";
import guphaImg from "@/assets/service-gupha.jpg";
import pujaImg from "@/assets/service-puja.jpg";
import shraddhaImg from "@/assets/service-shraddha.jpg";

const Index = () => {
  const { t, lang } = useLanguage();
  const [panditCount, setPanditCount] = useState(5);

  useEffect(() => {
    supabase
      .from("pandits")
      .select("id", { count: "exact", head: true })
      .eq("verified", true)
      .then(({ count }) => {
        if (count) setPanditCount(count);
      });
  }, []);

  const rituals = [
    {
      id: "vivah",
      img: vivahImg,
      title: lang === "ne" ? "विवाह संस्कार" : "Vivah (Wedding)",
      desc: lang === "ne" ? "कन्यादान, सप्तपदी र पूर्ण वैदिक विवाह अनुष्ठान।" : "Sacred Hindu wedding with Kanyadaan & Saptapadi.",
    },
    {
      id: "bratabandha",
      img: bratabandhaImg,
      title: lang === "ne" ? "ब्रतबन्ध" : "Bratabandha",
      desc: lang === "ne" ? "जनै धारण र गायत्री मन्त्र दीक्षा संस्कार।" : "Sacred thread initiation & Gayatri Mantra Diksha.",
    },
    {
      id: "namakaran",
      img: namakaranImg,
      title: lang === "ne" ? "नामकरण (न्वारन)" : "Namakaran",
      desc: lang === "ne" ? "नक्षत्र अनुसार शुभ नाम र जन्म कुण्डली।" : "Auspicious 11th-day naming & Janam Kundali.",
    },
    {
      id: "gupha",
      img: guphaImg,
      title: lang === "ne" ? "गुफा राख्ने / इही" : "Ihi & Bahra",
      desc: lang === "ne" ? "नेवार परम्परा अनुसार बेल विवाह र सूर्य दर्शन।" : "Traditional Newar Bel Bibaha & Surya Darshan.",
    },
    {
      id: "puja",
      img: pujaImg,
      title: lang === "ne" ? "गृह प्रवेश र पूजा" : "Griha Pravesh & Puja",
      desc: lang === "ne" ? "वास्तु शान्ति, रुद्री पाठ र सत्यनारायण कथा।" : "Housewarming Vastu Shanti, Rudri & Satyanarayan.",
    },
    {
      id: "shraddha",
      img: shraddhaImg,
      title: lang === "ne" ? "श्राद्ध कर्म" : "Shraddha Karma",
      desc: lang === "ne" ? "तिथि श्राद्ध, पिण्डदान र पितृ तर्पण विधि।" : "Ancestral Tithi Shraddha, Pinda Daan & Tarpan.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection panditCount={panditCount} />

      {/* Core Ceremonies — Clean 6-Card Minimal Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rituals.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/35 hover:shadow-elevated transition-all"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={r.img}
                    alt={r.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold text-foreground mb-1.5">{r.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{r.desc}</p>
                  <Link
                    to="/services#booking"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2.5 transition-all"
                  >
                    {t("featured.bookNow")} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Pandits */}
      <PanditSection />

      {/* Clean Minimal CTA */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-card border border-border shadow-elevated p-8 sm:p-12 text-center">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground mb-3">
              {t("cta.title")}
            </h2>
            <p className="text-muted-foreground text-base mb-8 max-w-lg mx-auto">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/services#booking"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all shadow-warm"
              >
                {t("cta.bookPuja")} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/resources"
                className="inline-flex items-center px-7 py-3.5 rounded-full border border-border text-foreground text-sm font-semibold hover:border-primary/40 hover:text-primary transition-colors"
              >
                {t("cta.exploreResources")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
