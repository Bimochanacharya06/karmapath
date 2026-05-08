import { motion } from "framer-motion";
import { Baby, Heart, GraduationCap, Flame, BookOpen, Sparkles } from "lucide-react";

const samskaras = [
  {
    icon: Baby,
    title: "नामकरण",
    subtitle: "Namakaran",
    description: "Sacred naming ceremony performed on the 11th day after birth, invoking divine blessings for the newborn.",
  },
  {
    icon: GraduationCap,
    title: "ब्रतबन्ध",
    subtitle: "Bratabandha",
    description: "The sacred thread ceremony marking the beginning of Vedic education and spiritual initiation for young boys.",
  },
  {
    icon: Sparkles,
    title: "गुफा राख्ने",
    subtitle: "Gupha Rakhne",
    description: "Ihi and Gupha — unique Newar traditions of symbolic marriage and coming-of-age ceremonies for girls.",
  },
  {
    icon: Heart,
    title: "विवाह",
    subtitle: "Vivah",
    description: "Traditional Hindu wedding rituals including Swayambar, Kanyadaan, Saptapadi and sacred fire ceremonies.",
  },
  {
    icon: Flame,
    title: "श्राद्ध",
    subtitle: "Shraddha",
    description: "Ancestral rites and offerings to departed souls, performed with devotion to ensure their spiritual peace.",
  },
  {
    icon: BookOpen,
    title: "पूजा विधि",
    subtitle: "Puja Vidhi",
    description: "Daily and occasional worship practices including Satyanarayan Puja, Rudri, and Griha Pravesh rituals.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SamskarasSection = () => {
  return (
    <section id="samskaras" className="py-24 bg-gradient-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary font-display text-sm tracking-widest uppercase mb-2">
            संस्कार
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Sacred Life Rituals
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            The sixteen Samskaras mark the spiritual journey from conception to
            cremation, each a sacred milestone in the cycle of life.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {samskaras.map((s) => (
            <motion.div
              key={s.subtitle}
              variants={item}
              className="group relative bg-card rounded-xl p-8 shadow-card hover:shadow-elevated transition-all duration-300 border border-border hover:border-primary/30"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-1">
                {s.title}
              </h3>
              <p className="text-primary text-sm font-medium mb-3">{s.subtitle}</p>
              <p className="text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SamskarasSection;
