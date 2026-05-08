import { motion } from "framer-motion";
import { Calendar, Moon, Sun, Star } from "lucide-react";

const tithis = [
  { date: "वैशाख ५, २०८३", event: "अक्षय तृतीया", type: "Festival", icon: Star },
  { date: "वैशाख १५, २०८३", event: "बुद्ध पूर्णिमा", type: "Purnima", icon: Moon },
  { date: "जेठ १, २०८३", event: "सीताष्टमी", type: "Tithi", icon: Sun },
  { date: "जेठ ११, २०८३", event: "निर्जला एकादशी", type: "Ekadashi", icon: Star },
  { date: "जेठ १५, २०८३", event: "जेठ पूर्णिमा", type: "Purnima", icon: Moon },
  { date: "असार १, २०८३", event: "असार पन्ध्र", type: "Festival", icon: Sun },
];

const typeColors: Record<string, string> = {
  Festival: "bg-secondary/10 text-secondary",
  Purnima: "bg-primary/10 text-primary",
  Tithi: "bg-accent/20 text-accent-foreground",
  Ekadashi: "bg-vermillion/10 text-vermillion",
};

const PanchangSection = () => {
  return (
    <section id="panchang" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-primary font-display text-sm tracking-widest uppercase mb-2">
              पञ्चाङ्ग
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Nepali Panchang &<br /> Tithi Calendar
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Stay connected with auspicious dates, festivals, Ekadashi, Purnima,
              and Amavasya. Plan your rituals according to the Vedic calendar
              aligned with Nepal's Bikram Sambat.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">B.S. 2083</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10">
                <Moon className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-foreground">शुक्ल पक्ष</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            {tithis.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/20 hover:shadow-card transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <t.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-foreground">{t.event}</p>
                  <p className="text-sm text-muted-foreground">{t.date}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${typeColors[t.type]}`}>
                  {t.type}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PanchangSection;
