import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Shield, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PanditSection from "@/components/PanditSection";
import PuranaQuotes from "@/components/PuranaQuotes";
import Footer from "@/components/Footer";
import vivahImg from "@/assets/service-vivah.jpg";
import bratabandhaImg from "@/assets/service-bratabandha.jpg";

const Index = () => {
  const { t } = useLanguage();
  const [, setPanditCount] = useState(0);

  useEffect(() => {
    supabase.from("pandits").select("id", { count: "exact", head: true }).eq("verified", true).then(({ count }) => {
      setPanditCount(count || 0);
    });
  }, []);

  const featured = [
    {
      img: vivahImg,
      title: t("ritual.vivah.title"),
      sub: t("ritual.vivah.sub"),
      desc: t("ritual.vivah.desc"),
    },
    {
      img: bratabandhaImg,
      title: t("ritual.bratabandha.title"),
      sub: t("ritual.bratabandha.sub"),
      desc: t("ritual.bratabandha.desc"),
    },
  ];

  const testimonials = [
    { name: "Rajesh Adhikari", location: "Kathmandu", text: "KarmaPath made our son's Bratabandha ceremony seamless. Pt. Ram Prasad ji was exceptional — every mantra, every ritual performed with devotion.", rating: 5 },
    { name: "Sunita Shrestha", location: "Lalitpur", text: "We used KarmaPath for our Griha Pravesh. The pandit arrived on time, explained every step, and made the ceremony truly memorable for our family.", rating: 5 },
    { name: "Deepak Sharma", location: "Pokhara", text: "Booking my father's Shraddha ceremony was emotional, but KarmaPath handled everything with sensitivity and respect. Highly recommended.", rating: 5 },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />

      {/* Featured 2 Rituals */}
      <section className="py-24 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary font-display text-sm tracking-widest uppercase mb-2">{t("featured.eyebrow")}</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">{t("featured.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t("featured.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {featured.map((f, i) => (
              <motion.div
                key={f.sub}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all border border-border hover:border-primary/30"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={f.img} alt={f.sub} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <h3 className="font-display text-3xl text-cream font-bold drop-shadow-lg">{f.title}</h3>
                    <p className="text-saffron text-sm font-medium">{f.sub}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-muted-foreground mb-5 leading-relaxed">{f.desc}</p>
                  <Link to="/services#booking" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                    {t("featured.bookNow")} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services" className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all shadow-warm">
              {t("featured.viewAll")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Our Pandits — directly after rituals */}
      <PanditSection />

      {/* Why KarmaPath */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              {t("why.title1")} <span className="text-gradient-saffron">KarmaPath</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("why.subtitle")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: t("why.card1.title"), desc: t("why.card1.desc") },
              { icon: Clock, title: t("why.card2.title"), desc: t("why.card2.desc") },
              { icon: Star, title: t("why.card3.title"), desc: t("why.card3.desc") },
            ].map((f) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-card rounded-2xl p-8 border border-border hover:shadow-elevated transition-all">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Purana Quotes */}
      <PuranaQuotes />

      {/* Testimonials */}
      <section className="py-24 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary font-display text-sm tracking-widest uppercase mb-2">{t("testimonials.eyebrow")}</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">{t("testimonials.title")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((tm, i) => (
              <motion.div
                key={tm.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-7 border border-border"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: tm.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-4 leading-relaxed italic">"{tm.text}"</p>
                <div>
                  <p className="font-display font-semibold text-foreground">{tm.name}</p>
                  <p className="text-sm text-muted-foreground">{tm.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-deep-brown">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-cream mb-6">{t("cta.title")}</h2>
          <p className="text-warm-stone text-lg mb-10 max-w-2xl mx-auto">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/services#booking" className="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all">
              {t("cta.bookPuja")}
            </Link>
            <Link to="/resources" className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-cream/30 text-cream font-semibold hover:bg-cream/10 transition-all">
              {t("cta.exploreResources")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
