import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Star, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface PanditCard {
  id: string;
  name: string;
  city: string | null;
  specializations: string[] | null;
  rating: number | null;
  experience_years: number | null;
}

interface SegmenterInstance {
  segment: (input: string) => Iterable<{ segment: string }>;
}

const getFirstGrapheme = (name: string): string => {
  const lastWord = name.trim().split(/\s+/).pop() || "प";
  const intlObj =
    typeof Intl !== "undefined"
      ? (Intl as typeof Intl & {
          Segmenter?: new (locales?: string, options?: { granularity: "grapheme" }) => SegmenterInstance;
        })
      : undefined;
  if (intlObj?.Segmenter) {
    const segmenter = new intlObj.Segmenter("ne", { granularity: "grapheme" });
    const first = segmenter.segment(lastWord)[Symbol.iterator]().next().value;
    if (first?.segment) return first.segment;
  }
  return Array.from(lastWord)[0] || "प";
};

const fallbackPandits: PanditCard[] = [
  {
    id: "1",
    name: "पण्डित राम प्रसाद शर्मा",
    city: "काठमाडौं",
    specializations: ["विवाह", "ब्रतबन्ध", "सत्यनारायण"],
    rating: 4.9,
    experience_years: 25,
  },
  {
    id: "2",
    name: "पण्डित केशव आचार्य",
    city: "भक्तपुर",
    specializations: ["श्राद्ध", "रुद्री पाठ"],
    rating: 4.85,
    experience_years: 30,
  },
  {
    id: "3",
    name: "पण्डित हरि दत्त उपाध्याय",
    city: "पोखरा",
    specializations: ["गृह प्रवेश", "नामकरण"],
    rating: 4.8,
    experience_years: 20,
  },
  {
    id: "4",
    name: "पण्डित विष्णु देव पन्त",
    city: "ललितपुर",
    specializations: ["विवाह", "कुण्डली"],
    rating: 4.95,
    experience_years: 28,
  },
];

const PanditSection = () => {
  const [pandits, setPandits] = useState<PanditCard[]>(fallbackPandits);
  const { t } = useLanguage();

  useEffect(() => {
    supabase
      .from("pandits")
      .select("id, name, city, specializations, rating, experience_years")
      .eq("verified", true)
      .order("rating", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data && data.length > 0) setPandits(data);
      });
  }, []);

  return (
    <section id="pandits" className="py-20 bg-gradient-warm border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2">{t("pandits.eyebrow")}</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {t("pandits.title1")} <span className="text-gradient-saffron">{t("pandits.title2")}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pandits.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="bg-card rounded-2xl p-5 border border-border hover:border-primary/35 hover:shadow-elevated transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-display font-bold text-lg">
                    {getFirstGrapheme(p.name)}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
                    <Star className="w-3.5 h-3.5 fill-secondary text-secondary" /> {p.rating}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-display text-base font-bold text-foreground truncate">{p.name}</h3>
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span>{p.city}</span>
                  <span>·</span>
                  <span>
                    {p.experience_years}+ {t("pandits.years")}
                  </span>
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {(p.specializations || []).slice(0, 2).map((s) => (
                    <span key={s} className="text-[11px] bg-muted text-foreground px-2.5 py-0.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <Link
                to={`/services?pandit=${encodeURIComponent(p.id)}#booking`}
                className="w-full inline-flex items-center justify-center py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {t("pandits.contact")}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PanditSection;
