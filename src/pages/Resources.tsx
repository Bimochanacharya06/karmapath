import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ritualGuides = [
  {
    id: "namakaran",
    titleNe: "नामकरण (न्वारन)",
    titleEn: "Namakaran (Naming Ceremony)",
    durationNe: "२–३ घण्टा · ११ औं दिन",
    durationEn: "2–3 hrs · 11th day",
    summaryNe: "नवजात शिशुको जन्म नक्षत्र र राशि अनुसार शुभ नाम राख्ने वैदिक संस्कार।",
    summaryEn: "Sacred naming ceremony choosing an auspicious syllable from the newborn's Nakshatra.",
    stepsNe: ["गणेश र कलश पूजा", "जन्म कुण्डली र नाम उच्चारण", "हवन तथा आशीर्वाद"],
    stepsEn: ["Ganesh & Kalash Puja", "Kundali reading & whispering the name", "Havan & family blessings"],
    mantra: "ॐ अङ्गादङ्गात् सम्भवसि हृदयादधिजायसे। आत्मा वै पुत्रनामासि स जीव शरदः शतम्॥",
  },
  {
    id: "bratabandha",
    titleNe: "ब्रतबन्ध (उपनयन)",
    titleEn: "Bratabandha (Sacred Thread)",
    durationNe: "पूरा दिन",
    durationEn: "Full day",
    summaryNe: "यज्ञोपवीत (जनै) धारण र गुरुबाट गायत्री मन्त्र दीक्षा लिने संस्कार।",
    summaryEn: "Spiritual initiation with sacred Janai thread and Gayatri Mantra Diksha.",
    stepsNe: ["मुण्डन र स्नान शुद्धीकरण", "यज्ञोपवीत र गायत्री दीक्षा", "अग्नि हवन र भिक्षा विधि"],
    stepsEn: ["Mundan & ritual bath", "Janai & Gayatri Diksha", "Agni Havan & Bhiksha"],
    mantra: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
  },
  {
    id: "vivah",
    titleNe: "विवाह संस्कार",
    titleEn: "Vivah (Vedic Wedding)",
    durationNe: "१–२ दिन",
    durationEn: "1–2 days",
    summaryNe: "अग्नि साक्षी राखी कन्यादान र सप्तपदी वचनसहित सम्पन्न हुने पवित्र बन्धन।",
    summaryEn: "Sacred marriage union witnessed by Agni with Kanyadaan and Saptapadi vows.",
    stepsNe: ["स्वयम्भर र कन्यादान", "लाजा होम र सप्तपदी (७ फेरा)", "सिन्दूर, मङ्गलसूत्र र आशीर्वाद"],
    stepsEn: ["Swayambar & Kanyadaan", "Laja Homa & Saptapadi (7 vows)", "Sindoor, Mangalsutra & blessings"],
    mantra: "धर्मेच अर्थेच कामेच नातिचरामि।",
  },
  {
    id: "satyanarayan",
    titleNe: "सत्यनारायण पूजा",
    titleEn: "Satyanarayan Puja",
    durationNe: "२ घण्टा",
    durationEn: "2 hours",
    summaryNe: "घरमा सुख, शान्ति र समृद्धिका लागि गरिने भगवान् विष्णुको विशेष पूजा र ५ अध्याय कथा।",
    summaryEn: "Devotional Lord Vishnu worship with Panchamrit snan and five-chapter Katha.",
    stepsNe: ["गणेश, कलश र नवग्रह पूजा", "सत्यनारायण पाँच अध्याय कथा श्रवण", "आरती र प्रसाद वितरण"],
    stepsEn: ["Ganesh, Kalash & Navagraha Puja", "Five-chapter Katha recitation", "Aarti & Prasad distribution"],
    mantra: "ॐ नमो भगवते वासुदेवाय। श्री सत्यनारायणाय नमः॥",
  },
  {
    id: "griha",
    titleNe: "गृह प्रवेश (वास्तु शान्ति)",
    titleEn: "Griha Pravesh & Vastu Shanti",
    durationNe: "३–४ घण्टा",
    durationEn: "3–4 hours",
    summaryNe: "नयाँ घरमा प्रवेश गर्नुअघि वास्तु दोष निवारण र सकारात्मक ऊर्जाका लागि गरिने पूजा।",
    summaryEn: "Sanctifies a new home with Kalash entry, milk-boiling abundance, and Vastu Havan.",
    stepsNe: ["द्वार पूजा र मङ्गल कलश प्रवेश", "दूध उमाल्ने शुभ विधि", "वास्तु पुरुष हवन र लक्ष्मी स्थापना"],
    stepsEn: ["Entrance Puja & Kalash entry", "Auspicious milk-boiling ritual", "Vastu Havan & Lakshmi Sthapana"],
    mantra: "वास्तोष्पते प्रति जानीह्यस्मान् स्वावेशो अनमीवो भवा नः।",
  },
  {
    id: "shraddha",
    titleNe: "श्राद्ध र पितृ कर्म",
    titleEn: "Shraddha & Pitru Rites",
    durationNe: "२–३ घण्टा",
    durationEn: "2–3 hours",
    summaryNe: "दिवंगत पितृहरूको आत्माको शान्तिका लागि श्रद्धापूर्वक गरिने तर्पण र पिण्डदान।",
    summaryEn: "Reverent ancestral offering of Til Tarpan and Pinda Daan on annual Tithi.",
    stepsNe: ["संकल्प र पितृ आवाहन", "तिल तर्पण र पिण्डदान", "ब्राह्मण भोजन र दक्षिणा"],
    stepsEn: ["Sankalpa & Pitru invocation", "Til Tarpan & Pinda Daan", "Brahmin Bhojan & Dakshina"],
    mantra: "ॐ पितृभ्यः स्वधायिभ्यः स्वधा नमः॥",
  },
];

const Resources = () => {
  const [search, setSearch] = useState("");
  const { lang } = useLanguage();

  const filtered = ritualGuides.filter(
    (g) =>
      g.titleNe.toLowerCase().includes(search.toLowerCase()) ||
      g.titleEn.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="pt-28 pb-12 bg-gradient-warm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2">
            {lang === "ne" ? "विधि र मन्त्र" : "Ritual Guides"}
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
            {lang === "ne" ? "सरल पूजा विधि र मन्त्र" : "Essential Puja Guides"}
          </h1>
          <p className="text-muted-foreground text-base">
            {lang === "ne"
              ? "प्रमुख संस्कारहरूको संक्षिप्त विधि र मूल मन्त्रहरू।"
              : "Concise step-by-step procedures and core mantras for major ceremonies."}
          </p>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={lang === "ne" ? "पूजा खोज्नुहोस् (विवाह, ब्रतबन्ध, सत्यनारायण...)" : "Search rituals..."}
              className="pl-10 rounded-full bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {filtered.map((g) => (
              <AccordionItem
                key={g.id}
                value={g.id}
                className="bg-card rounded-2xl border border-border px-5 hover:border-primary/35 transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-1 items-center justify-between pr-3 text-left gap-3">
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {lang === "ne" ? g.titleNe : g.titleEn}
                    </h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground shrink-0">
                      {lang === "ne" ? g.durationNe : g.durationEn}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5 space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lang === "ne" ? g.summaryNe : g.summaryEn}
                  </p>

                  <ol className="flex flex-wrap gap-2">
                    {(lang === "ne" ? g.stepsNe : g.stepsEn).map((step, idx) => (
                      <li
                        key={step}
                        className="inline-flex items-center gap-1.5 text-xs bg-muted px-3 py-1.5 rounded-full text-foreground"
                      >
                        <span className="font-bold text-primary">{idx + 1}.</span> {step}
                      </li>
                    ))}
                  </ol>

                  <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                    <p className="font-display text-sm sm:text-base text-foreground">{g.mantra}</p>
                  </div>

                  <Link
                    to="/services#booking"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    {lang === "ne" ? "यो पूजा बुक गर्नुहोस्" : "Book this ceremony"} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resources;
