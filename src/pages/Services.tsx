import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Baby, Heart, GraduationCap, Flame, BookOpen, Sparkles,
  CheckCircle, Clock, Star, Users, MapPin, Calendar, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PujaBookingForm from "@/components/PujaBookingForm";
import QuickBookModal from "@/components/QuickBookModal";

import imgNamakaran from "@/assets/service-namakaran.jpg";
import imgBratabandha from "@/assets/service-bratabandha.jpg";
import imgGupha from "@/assets/service-gupha.jpg";
import imgVivah from "@/assets/service-vivah.jpg";
import imgShraddha from "@/assets/service-shraddha.jpg";
import imgPuja from "@/assets/service-puja.jpg";

const samskaras = [
  {
    icon: Baby, title: "नामकरण", subtitle: "Namakaran", image: imgNamakaran,
    description: "The sacred naming ceremony performed on the 11th day after birth. A Pandit selects an auspicious name based on the child's Nakshatra (birth star), Rashi (zodiac), and planetary alignment.",
    details: ["Nakshatra-based name selection by Jyotish", "Havan with ghee, samagri & sacred herbs", "Ganesh Puja & family blessing ceremony", "Preparation of Janam Kundali (birth chart)"],
  },
  {
    icon: GraduationCap, title: "ब्रतबन्ध", subtitle: "Bratabandha (Upanayana)", image: imgBratabandha,
    description: "The sacred thread ceremony marking spiritual initiation. The boy receives the Gayatri Mantra from his Guru and takes vows of discipline, learning, and dharma.",
    details: ["Yagnopavit (sacred thread) ceremony", "Gayatri Mantra Diksha from Guru", "Agni Parikrama & Havan rituals", "Mundan & Bhiksha (alms seeking)"],
  },
  {
    icon: Sparkles, title: "गुफा राख्ने / इही", subtitle: "Gupha Rakhne / Ihi", image: imgGupha,
    description: "Unique Newar traditions. Ihi symbolically marries young girls to Lord Vishnu through a Bel fruit. Bahra is a 12-day seclusion ceremony marking their transition.",
    details: ["Ihi — Bel Bibaha with Lord Vishnu", "Bahra — 12-day Gupha ceremony", "Surya Darshan (first viewing of Sun)", "Traditional Newar feast & celebration"],
  },
  {
    icon: Heart, title: "विवाह", subtitle: "Vivah (Hindu Wedding)", image: imgVivah,
    description: "The most elaborate Samskara — the sacred union of two souls. Includes Kanyadaan, Saptapadi around sacred fire, Mangal Sutra, Sindoor, and numerous rituals spanning 2-3 days.",
    details: ["Swayambar, Kanyadaan & Pani Grahan", "Saptapadi — seven vows around Agni", "Sindoor, Mangalsutra & Ashirwad", "Laja Homa & Dhruva-Arundhati Darshan"],
  },
  {
    icon: Flame, title: "श्राद्ध", subtitle: "Shraddha & Antim Sanskar", image: imgShraddha,
    description: "Final journey rituals and ancestral rites. Shraddha honors departed ancestors through Pinda Daan, Tarpan, and special pujas to ensure the soul attains moksha.",
    details: ["Antim Sanskar — cremation ceremony", "Pinda Daan & Tarpan rituals", "13-day Kriya & Shanti Puja", "Annual Pitru Paksha Shraddha"],
  },
  {
    icon: BookOpen, title: "पूजा विधि", subtitle: "Puja & Havan Ceremonies", image: imgPuja,
    description: "Daily and occasional worship — Satyanarayan Katha, Rudri Path, Griha Pravesh, and deity-specific pujas for prosperity, health, peace, or planetary remedies.",
    details: ["Satyanarayan Puja & Katha", "Rudri Path & Maha Mrityunjaya Havan", "Griha Pravesh & Vastu Shanti Puja", "Navagraha Shanti & Graha Dosh Nivaran"],
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.15 } } };
const item = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const Services = () => {
  const [panditsList, setPanditsList] = useState<any[]>([]);
  const [quickBook, setQuickBook] = useState<{ open: boolean; ritual: string; sub: string }>({ open: false, ritual: "", sub: "" });

  useEffect(() => {
    supabase.from("pandits").select("*").eq("verified", true).order("rating", { ascending: false }).then(({ data }) => {
      setPanditsList(data || []);
    });
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-primary font-display text-sm tracking-widest uppercase mb-2">
            सेवाहरू
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
            Our Sacred <span className="text-gradient-saffron">Services</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From birth to the final journey — authentic Vedic rituals performed by experienced and verified Pandits across Nepal.
          </motion.p>
        </div>
      </section>

      {/* Samskaras with Images */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="space-y-16">
            {samskaras.map((s, idx) => (
              <motion.div key={s.subtitle} variants={item}
                className={`flex flex-col ${idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 items-center`}
              >
                {/* Image */}
                <div className="lg:w-1/2 w-full">
                  <div className="rounded-2xl overflow-hidden shadow-elevated border border-border">
                    <img src={s.image} alt={s.subtitle} loading="lazy" width={640} height={512}
                      className="w-full h-64 md:h-80 object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
                {/* Content */}
                <div className="lg:w-1/2 w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <s.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl md:text-3xl font-semibold text-foreground">{s.title}</h3>
                      <p className="text-primary text-sm font-medium">{s.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-5">{s.description}</p>
                  <ul className="space-y-2.5 mb-6">
                    {s.details.map((d) => (
                      <li key={d} className="flex items-center gap-2.5 text-sm text-foreground">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0" /> {d}
                      </li>
                    ))}
                  </ul>
                  {/* Card-footer Book Now — minimal info quick book */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                    <button
                      onClick={() => setQuickBook({ open: true, ritual: s.subtitle, sub: s.title })}
                      className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all shadow-warm"
                    >
                      Book Now <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <a href="#booking" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      or use full booking form →
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Quick-book modal */}
      <QuickBookModal
        open={quickBook.open}
        onOpenChange={(o) => setQuickBook((s) => ({ ...s, open: o }))}
        ritual={quickBook.ritual}
        ritualSubtitle={quickBook.sub}
      />

      {/* Pandits from DB */}
      {panditsList.length > 0 && (
        <section className="py-20 bg-gradient-warm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-primary font-display text-sm tracking-widest uppercase mb-2">हाम्रा पण्डितहरू</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                Our Verified <span className="text-gradient-saffron">Pandits</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Each Pandit is personally verified with authentic Vedic training and years of ceremony experience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {panditsList.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border hover:shadow-elevated transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl shrink-0">
                      {p.name.split(" ").pop()?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{p.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" /> {p.city}
                        <span>·</span>
                        <span>{p.experience_years} years</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{p.bio}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.specializations?.slice(0, 4).map((s: string) => (
                      <span key={s} className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Star className="w-3.5 h-3.5 fill-primary" /> {p.rating}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {p.total_ceremonies?.toLocaleString() || 0} ceremonies
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            Why Choose <span className="text-gradient-saffron">KarmaPath</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: CheckCircle, title: "Verified Pandits", desc: "Every Pandit is personally verified with authentic Vedic training and years of ceremony experience." },
              { icon: Calendar, title: "Muhurta Matching", desc: "Our Jyotish experts find the most auspicious Tithi, Nakshatra, and Muhurta for your ceremony." },
              { icon: Clock, title: "Timely Service", desc: "Punctual, reliable service with complete ritual fulfillment — no shortcuts, no compromises." },
              { icon: Star, title: "Trusted by 5000+", desc: "Thousands of families across Nepal trust us for life's most sacred moments." },
            ].map((f) => (
              <div key={f.title} className="text-center p-6 rounded-xl bg-card border border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="booking" className="py-20 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-display text-sm tracking-widest uppercase mb-2">बुकिङ</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Book a <span className="text-gradient-saffron">Puja Ceremony</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Select your ritual, pick your preferred date, and choose an experienced Pandit.
            </p>
          </div>
          <PujaBookingForm />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
