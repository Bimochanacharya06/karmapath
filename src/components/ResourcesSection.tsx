import { motion } from "framer-motion";
import { BookOpen, Music, ScrollText, Video } from "lucide-react";
import pujaItems from "@/assets/puja-items.jpg";

const resources = [
  {
    icon: ScrollText,
    title: "Mantra Collection",
    description: "Complete collection of Vedic mantras used in Nepali Karmakanda rituals with proper pronunciation guides.",
    count: "200+ Mantras",
  },
  {
    icon: BookOpen,
    title: "Puja Vidhi Guides",
    description: "Step-by-step ritual procedure guides for performing various pujas at home or temple.",
    count: "50+ Guides",
  },
  {
    icon: Music,
    title: "Sacred Chants",
    description: "Audio recordings of traditional Vedic chants, bhajans, and stotras in Nepali tradition.",
    count: "100+ Audio",
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Learn proper ritual techniques from experienced Pandits through detailed video instructions.",
    count: "30+ Videos",
  },
];

const ResourcesSection = () => {
  return (
    <section id="resources" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-elevated">
              <img
                src={pujaItems}
                alt="Traditional puja items"
                width={800}
                height={600}
                loading="lazy"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-brown/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-display text-2xl font-bold text-cream">
                  पूजा सामग्री
                </p>
                <p className="text-cream/80 text-sm">
                  Complete guide to puja materials and their significance
                </p>
              </div>
            </div>
          </motion.div>

          <div>
            <p className="text-primary font-display text-sm tracking-widest uppercase mb-2">
              ज्ञान भण्डार
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Sacred Knowledge
              <br />
              Resources
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Access a growing library of mantras, ritual guides, and educational
              content to deepen your understanding of Karmakanda traditions.
            </p>

            <div className="space-y-4">
              {resources.map((r) => (
                <div
                  key={r.title}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-card hover:shadow-card transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <r.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display font-semibold text-foreground">
                        {r.title}
                      </h3>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {r.count}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
