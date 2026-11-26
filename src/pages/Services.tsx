import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
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

const servicesList = [
  {
    id: "namakaran",
    titleNe: "नामकरण (न्वारन)",
    titleEn: "Namakaran",
    image: imgNamakaran,
    descNe: "११ औं दिनमा नक्षत्र अनुसार शुभ नाम र जन्म कुण्डली निर्माण।",
    descEn: "11th-day Nakshatra name selection, Havan & Janam Kundali.",
  },
  {
    id: "bratabandha",
    titleNe: "ब्रतबन्ध (उपनयन)",
    titleEn: "Bratabandha",
    image: imgBratabandha,
    descNe: "जनै धारण, गायत्री मन्त्र दीक्षा र वैदिक हवन संस्कार।",
    descEn: "Sacred thread ceremony, Gayatri Diksha & Havan rituals.",
  },
  {
    id: "gupha",
    titleNe: "गुफा राख्ने / इही",
    titleEn: "Ihi & Bahra",
    image: imgGupha,
    descNe: "नेवार परम्परा अनुसार बेल विवाह र सूर्य दर्शन अनुष्ठान।",
    descEn: "Traditional Newar Bel Bibaha & 12-day Surya Darshan.",
  },
  {
    id: "vivah",
    titleNe: "विवाह संस्कार",
    titleEn: "Vivah (Wedding)",
    image: imgVivah,
    descNe: "स्वयम्भर, कन्यादान र सप्तपदीसहित पूर्ण वैदिक विवाह।",
    descEn: "Complete Vedic wedding with Kanyadaan & Saptapadi vows.",
  },
  {
    id: "shraddha",
    titleNe: "श्राद्ध र पितृ कर्म",
    titleEn: "Shraddha & Pitru Rites",
    image: imgShraddha,
    descNe: "तिथि श्राद्ध, पिण्डदान र पितृ तर्पण विधिपूर्वक सम्पन्न।",
    descEn: "Annual Tithi Shraddha, Pinda Daan & ancestral Tarpan.",
  },
  {
    id: "puja",
    titleNe: "गृह प्रवेश र शान्ति पूजा",
    titleEn: "Griha Pravesh & Puja",
    image: imgPuja,
    descNe: "वास्तु शान्ति, सत्यनारायण कथा, रुद्री र नवग्रह पूजा।",
    descEn: "Housewarming Vastu Shanti, Satyanarayan & Rudri Path.",
  },
];

const Services = () => {
  const { lang } = useLanguage();
  const [quickBook, setQuickBook] = useState<{ open: boolean; ritual: string }>({
    open: false,
    ritual: "",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-12 bg-gradient-warm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2">
            {lang === "ne" ? "हाम्रा सेवाहरू" : "Our Services"}
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
            {lang === "ne" ? "वैदिक पूजा तथा संस्कारहरू" : "Sacred Vedic Services"}
          </h1>
          <p className="text-muted-foreground text-base">
            {lang === "ne"
              ? "आवश्यक संस्कार छान्नुहोस् र अनुभवी पण्डित सजिलै बुक गर्नुहोस्।"
              : "Choose your ceremony and book a verified Pandit in minutes."}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesList.map((s, idx) => {
              const title = lang === "ne" ? s.titleNe : s.titleEn;
              const desc = lang === "ne" ? s.descNe : s.descEn;
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/35 hover:shadow-elevated transition-all flex flex-col"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={s.image}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-1.5">{title}</h3>
                      <p className="text-sm text-muted-foreground mb-5">{desc}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <button
                        type="button"
                        onClick={() => setQuickBook({ open: true, ritual: title })}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all"
                      >
                        {lang === "ne" ? "तुरुन्त बुक" : "Quick Book"} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <a href="#booking" className="text-xs text-muted-foreground hover:text-primary">
                        {lang === "ne" ? "विस्तृत फारम →" : "Full form →"}
                      </a>
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
        ritual={quickBook.ritual}
      />

      <section id="booking" className="py-16 bg-gradient-warm border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
              {lang === "ne" ? "पूजा बुकिङ फारम" : "Book a Ceremony"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {lang === "ne"
                ? "संस्कार, मिति र पण्डित छनोट गरी अनुरोध पठाउनुहोस्।"
                : "Select your ritual, preferred date, and Pandit."}
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
