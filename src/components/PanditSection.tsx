import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Star, Users, Shield, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface PanditCard {
  id: string;
  name: string;
  bio: string | null;
  city: string | null;
  specializations: string[] | null;
  rating: number | null;
  experience_years: number | null;
  total_ceremonies: number | null;
}

const fallbackPandits: PanditCard[] = [
  {
    id: "1",
    name: "पण्डित राम प्रसाद शर्मा",
    bio: "Pt. Ram Prasad Sharma has been performing Vedic rituals for over 25 years across the Kathmandu Valley. Specializing in Vivah and Bratabandha ceremonies, he is known for his melodious mantra recitation and deep knowledge of Karmakanda. Families trust him for his punctuality and devotion.",
    city: "Kathmandu",
    specializations: ["Vivah", "Bratabandha", "Satyanarayan"],
    rating: 4.9,
    experience_years: 25,
    total_ceremonies: 3200,
  },
  {
    id: "2",
    name: "पण्डित केशव आचार्य",
    bio: "Pt. Keshav Acharya is a senior Purohit from Bhaktapur with 30+ years dedicated to Shraddha and Pitru Karma. He has helped thousands of families perform Antim Sanskar and annual Shraddha ceremonies with deep compassion and strict adherence to Vedic procedures.",
    city: "Bhaktapur",
    specializations: ["Shraddha", "Pinda Daan", "Antim Sanskar"],
    rating: 4.8,
    experience_years: 30,
    total_ceremonies: 4500,
  },
  {
    id: "3",
    name: "पण्डित हरि दत्त उपाध्याय",
    bio: "Based in Pokhara, Pt. Hari Datta Upadhyay specializes in Griha Pravesh and Vastu Shanti pujas. He combines traditional Vedic knowledge with Jyotish expertise to select the most auspicious muhurta for every ceremony, ensuring families start their new chapter with divine blessings.",
    city: "Pokhara",
    specializations: ["Griha Pravesh", "Vastu Shanti", "Navagraha"],
    rating: 4.7,
    experience_years: 20,
    total_ceremonies: 2100,
  },
  {
    id: "4",
    name: "पण्डित विष्णु देव पन्त",
    bio: "Pt. Vishnu Dev Pant from Lalitpur is renowned for his expertise in Namakaran and Rudri Path. With 18 years of experience, he carefully prepares Janam Kundali charts and selects auspicious names based on the child's Nakshatra. His gentle demeanor puts families at ease.",
    city: "Lalitpur",
    specializations: ["Namakaran", "Rudri Path", "Kundali"],
    rating: 4.9,
    experience_years: 18,
    total_ceremonies: 1800,
  },
];

const PanditSection = () => {
  const [pandits, setPandits] = useState<PanditCard[]>(fallbackPandits);
  const { t } = useLanguage();

  useEffect(() => {
    supabase.from("pandits").select("*").eq("verified", true).order("rating", { ascending: false }).limit(4).then(({ data }) => {
      if (data && data.length > 0) setPandits(data);
    });
  }, []);

  return (
    <section id="pandits" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary font-display text-sm tracking-widest uppercase mb-2">{t("pandits.eyebrow")}</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {t("pandits.title1")} <span className="text-gradient-saffron">{t("pandits.title2")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t("pandits.subtitle")}
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {pandits.map((p) => (
            <motion.div
              key={p.id}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-elevated transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-display text-2xl text-primary font-bold">
                    {p.name.split(" ").pop()?.charAt(0) || "प"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg font-semibold text-foreground">{p.name}</h3>
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {p.city}</span>
                    <span>·</span>
                    <span>{p.experience_years}+ {t("pandits.years")}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.bio}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(p.specializations || []).slice(0, 4).map((s: string) => (
                  <span key={s} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{s}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <Star className="w-3.5 h-3.5 fill-primary" /> {p.rating}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3.5 h-3.5" /> {(p.total_ceremonies || 0).toLocaleString()} {t("pandits.ceremonies")}
                  </span>
                </div>
                <Link
                  to={`/services?pandit=${encodeURIComponent(p.id)}#booking`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/20 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" /> {t("pandits.contact")}
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PanditSection;
