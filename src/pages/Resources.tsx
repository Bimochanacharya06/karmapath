import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Search, Calendar, Sparkles, ChevronRight, Flame, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Authentic ritual guides — written for Nepali Hindu families
const ritualGuides = [
  {
    id: "namakaran",
    icon: "👶",
    title: "Namakaran — नामकरण",
    subtitle: "Sacred Naming Ceremony",
    when: "11th day after birth (Ekadashi)",
    duration: "2–3 hours",
    summary:
      "The Namakaran samskara welcomes the newborn into the family and Vedic tradition. The Pandit selects an auspicious name based on the child's Nakshatra (birth star), Rashi, and the syllable indicated by their Janma Kundali.",
    prepare: [
      "Clean the home thoroughly; create a sacred puja space facing east",
      "Arrange Kalash with water, mango leaves, coconut, supari, akshat",
      "Keep new yellow or red cloth, ghee for havan, samagri, fruits",
      "Inform close family — the mother, father, and child sit together",
      "Provide birth time, date, and place to the Pandit beforehand",
    ],
    steps: [
      "Ganesh Puja & Sankalpa — invoking Lord Ganesha for an obstacle-free ceremony",
      "Kalash Puja & Navagraha invocation for planetary blessings",
      "Jyotish reads the Janam Kundali and reveals the Nakshatra-pada syllable",
      "Father whispers the chosen name in the child's right ear three times",
      "Havan with ghee and samagri, followed by family blessing & Aashirvaad",
      "Ann Prashan offering (a few grains of rice/honey to child's lips)",
    ],
    mantra: "ॐ अङ्गादङ्गात् सम्भवसि हृदयादधिजायसे। आत्मा वै पुत्रनामासि स जीव शरदः शतम्॥",
    mantraMeaning: "You are born from my limbs, you arise from my heart. You are my very soul named 'son/daughter' — may you live a hundred autumns.",
  },
  {
    id: "bratabandha",
    icon: "🧵",
    title: "Bratabandha — ब्रतबन्ध",
    subtitle: "Sacred Thread / Upanayana",
    when: "Between ages 7–14 (odd years preferred)",
    duration: "Full day (with Mundan & Bhiksha)",
    summary:
      "Bratabandha is the spiritual rebirth of a Brahmin/Kshatriya boy. He receives the sacred Janai (Yagnopavit) and the Gayatri Mantra from his Guru — taking vows of celibacy, learning, and dharma. In Newar tradition, this is performed as 'Kayta Puja'.",
    prepare: [
      "Plan 1–2 weeks in advance — invitations, mandap, samagri",
      "New Janai (sacred thread), Mekhala (waist cord), Krishnamriga skin or substitute",
      "Mundan supplies (razor, fresh cloth) — the boy's head is shaved",
      "Yellow Dhoti, Kaupina, wooden danda, Bhiksha patra (alms bowl)",
      "Havan kund, samagri, ghee, palash twigs, dharbha grass",
      "Boy fasts the morning of the ceremony",
    ],
    steps: [
      "Mundan (head shaving) & ritual bath — symbolic purification",
      "Mangal Snan, new clothes, Tilak by the mother",
      "Ganesh Puja, Kalash Puja, Navagraha & Matrika Puja",
      "Yagnopavit Dharan — Pandit places the sacred thread over left shoulder",
      "Gayatri Mantra Diksha — Guru whispers the mantra into the boy's right ear",
      "Agni Parikrama and Havan with the new Brahmachari offering oblations",
      "Bhiksha — boy seeks alms first from his mother, then relatives",
      "Ashirvaad and feast (Bhoj) for all guests",
    ],
    mantra: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥",
    mantraMeaning: "We meditate upon the divine radiance of the Sun; may it illuminate our intellect and guide us toward truth.",
  },
  {
    id: "vivah",
    icon: "💍",
    title: "Vivah — विवाह",
    subtitle: "Vedic Hindu Wedding",
    when: "Auspicious Lagna decided by Jyotish (typically Magh, Falgun, Baishakh, Jestha)",
    duration: "2–3 days of rituals",
    summary:
      "Vivah is the most elaborate of the 16 samskaras — the sacred union of two souls in front of Agni Devta. It includes Swayambar, Kanyadaan, Saptapadi (seven steps), Mangalsutra dharan, and Sindoor.",
    prepare: [
      "Match Kundalis (Kundli Milan / Guna Milan) — ideally 18+ Gunas matching",
      "Fix Lagna (auspicious wedding time) with the Jyotish",
      "Arrange Mandap with 4 pillars, Havan kund, banana stalks, mango torans",
      "Sindoor, Mangalsutra, Saptapadi rice mounds, Laja (puffed rice)",
      "Bride's Kanyadaan items: gold ornaments, new clothes, dakshina",
      "Havan samagri, ghee, palash wood, dharbha grass, panchamrit",
    ],
    steps: [
      "Ganesh Puja, Punyahavachan, Matruka Puja (day before)",
      "Swayambar & Var Mala — exchange of garlands",
      "Kanyadaan — father gives the bride's hand into the groom's",
      "Pani Grahan — groom holds bride's hand reciting Vedic mantras",
      "Laja Homa — bride's brother pours puffed rice into the fire",
      "Saptapadi — seven steps around Agni, each with a sacred vow",
      "Sindoor Daan & Mangalsutra Dharan",
      "Dhruva-Arundhati Darshan & Ashirvaad from elders",
    ],
    mantra: "धर्मेच अर्थेच कामेच नातिचरामि। (Saptapadi vow) ॐ एकमिषे विष्णुस्त्वान्वेतु।",
    mantraMeaning: "I will not deviate from you in dharma, artha, and kama. May Lord Vishnu walk this first step with us — for nourishment.",
  },
  {
    id: "shraddha",
    icon: "🪔",
    title: "Shraddha — श्राद्ध",
    subtitle: "Pitru Rituals & Pinda Daan",
    when: "Death anniversary (Tithi) or Pitru Paksha (15 days)",
    duration: "3–4 hours",
    summary:
      "Shraddha honors departed ancestors and ensures their souls attain peace. Pinda Daan (offering rice balls), Tarpan (water libations), and feeding Brahmins are the core rituals — performed with reverence and faith.",
    prepare: [
      "Bathe early; wear white or off-white dhoti/clothes (no stitched garments for the karta)",
      "Prepare cooked rice, black sesame, dharbha grass, water, milk",
      "Arrange items: Pinda (rice balls), Til (sesame), honey, ghee, fruits",
      "Invite a Brahmin/Pandit and prepare Sattvik food (no onion, garlic)",
      "Keep south-facing space clean — Pitru direction",
    ],
    steps: [
      "Achaman, Sankalpa & Pavitri Dharan",
      "Vishwadeva invocation followed by Pitru Avahan",
      "Pinda Daan — offering three rice balls to father, grandfather, great-grandfather",
      "Tarpan — water with til and dharbha offered to the ancestors",
      "Feeding the Brahmins (Brahman Bhojan)",
      "Crow & cow feeding (Kak Bali, Go Gras) — symbolic Pitru offering",
      "Dakshina to the Pandit & seeking blessings",
    ],
    mantra: "ॐ पितृभ्यः स्वधायिभ्यः स्वधा नमः पितामहेभ्यः स्वधायिभ्यः स्वधा नमः।",
    mantraMeaning: "Salutations and offerings (Svadha) to the departed fathers and grandfathers who accept ancestral oblations.",
  },
  {
    id: "satyanarayan",
    icon: "🕉️",
    title: "Satyanarayan Puja — सत्यनारायण पूजा",
    subtitle: "Auspicious Vishnu Puja with Katha",
    when: "Purnima (full moon), Sankranti, or any auspicious day",
    duration: "2 hours",
    summary:
      "One of the most popular pujas in Nepali Hindu homes — performed on housewarmings, weddings, birthdays, or to remove obstacles. It includes the recitation of five chapters of the Satyanarayan Katha and Panchamrit Snan.",
    prepare: [
      "Clean the puja space, place Vishnu murti/photo on a wooden chowki with red cloth",
      "Panchamrit: milk, curd, ghee, honey, sugar — for Abhishek",
      "Panjeeri prasad (atta + ghee + sugar + dry fruits) and banana fruit (108 if possible)",
      "Kalash, mango leaves, coconut, akshat, kumkum, flowers, tulsi leaves",
      "Ghee diya (5 wicks), dhoop, agarbatti, panchapatra",
    ],
    steps: [
      "Ganesh Puja & Sankalpa",
      "Kalash Sthapana and Navagraha invocation",
      "Satyanarayan Avahan & Shodashopachar Puja (16-step worship)",
      "Recitation of Satyanarayan Katha — all 5 Adhyayas",
      "Aarti with ghee diya and Pushpanjali",
      "Prasad distribution (Panjeeri & banana to all attendees)",
    ],
    mantra: "ॐ नमो भगवते वासुदेवाय। सत्यनारायणाय नमः॥",
    mantraMeaning: "Salutations to Lord Vasudeva, the embodiment of eternal Truth — Satyanarayan.",
  },
  {
    id: "griha",
    icon: "🏠",
    title: "Griha Pravesh — गृह प्रवेश",
    subtitle: "House Warming & Vastu Shanti",
    when: "Auspicious Muhurta after construction/before moving in",
    duration: "3–4 hours",
    summary:
      "Performed before entering a new home for the first time. The puja sanctifies the house, pacifies any Vastu doshas, and invites Lakshmi-Ganesh and the Vastu Purusha to bless the dwelling with prosperity, peace, and protection.",
    prepare: [
      "Ensure the house is clean and ideally unoccupied before the puja",
      "Decorate main entrance with mango torans, marigold flowers, rangoli",
      "Sacred cow (if possible) led inside first, followed by family with Kalash",
      "Kalash with water, mango leaves, coconut, akshat, kumkum",
      "Havan kund (in northeast/Ishan corner), samagri, ghee, palash wood",
      "Milk to boil over (symbol of abundance), new utensils, fresh fruits",
    ],
    steps: [
      "Ganesh Puja, Punyahavachan, Vastu Purusha invocation",
      "Navagraha & Dikpala Puja (10 directional deities)",
      "Kalash Sthapana at the puja altar (typically northeast)",
      "Milk-boiling ritual in kitchen — boiling over signifies overflowing prosperity",
      "Vastu Shanti Havan with Vedic mantras",
      "Lakshmi-Ganesh Sthapana in the puja room",
      "Bhojan to Pandit and family meal in the new home",
    ],
    mantra: "वास्तोष्पते प्रति जानीह्यस्मान् स्वावेशो अनमीवो भवा नः।",
    mantraMeaning: "O Lord of the dwelling (Vastu Purusha), recognize and welcome us. May our entry here be prosperous and free from disease.",
  },
];

// Real Nepali festival calendar (2025 sample dates — locale-aware)
const festivals2025 = [
  { date: "Feb 26, 2025", title: "Maha Shivaratri", titleNe: "महा शिवरात्रि", desc: "Night-long fasting & Rudri Path. Pashupatinath sees lakhs of devotees.", category: "Major" },
  { date: "Mar 14, 2025", title: "Holi (Fagu Purnima)", titleNe: "होली / फागु पूर्णिमा", desc: "Festival of colors. Burning of Holika the night before.", category: "Major" },
  { date: "Apr 13, 2025", title: "Nepali New Year (Baishakh 1)", titleNe: "नयाँ वर्ष २०८२", desc: "Bisket Jatra in Bhaktapur, family pujas welcoming the new year.", category: "Cultural" },
  { date: "Apr 30, 2025", title: "Akshaya Tritiya", titleNe: "अक्षय तृतीया", desc: "Auspicious for new ventures, gold purchase, Lakshmi puja.", category: "Auspicious" },
  { date: "Jul 10, 2025", title: "Guru Purnima", titleNe: "गुरु पूर्णिमा", desc: "Honoring spiritual & academic teachers.", category: "Spiritual" },
  { date: "Aug 9, 2025", title: "Janai Purnima / Raksha Bandhan", titleNe: "जनै पूर्णिमा", desc: "Renewal of sacred thread; Rishi Tarpan.", category: "Major" },
  { date: "Aug 16, 2025", title: "Krishna Janmashtami", titleNe: "श्री कृष्ण जन्माष्टमी", desc: "Lord Krishna's birth — fasting, midnight aarti.", category: "Major" },
  { date: "Aug 26, 2025", title: "Teej (Hartalika)", titleNe: "हरितालिका तीज", desc: "Women's festival — fasting for marital prosperity, dancing, red sarees.", category: "Women's" },
  { date: "Sep 22 – Oct 2, 2025", title: "Dashain (Bada Dashain)", titleNe: "दशैं", desc: "Nepal's largest festival — Ghatasthapana to Kojagrat Purnima. Tika & Jamara from elders.", category: "Major" },
  { date: "Oct 20 – 23, 2025", title: "Tihar (Deepawali)", titleNe: "तिहार / दीपावली", desc: "5 days: Kag Tihar, Kukur Tihar, Gai Tihar/Lakshmi Puja, Govardhan, Bhai Tika.", category: "Major" },
  { date: "Oct 28, 2025", title: "Chhath Parva", titleNe: "छठ पर्व", desc: "Sun worship over 4 days, especially in Madhesh region.", category: "Major" },
  { date: "Nov 5, 2025", title: "Haribodhini Ekadashi", titleNe: "हरिबोधिनी एकादशी", desc: "Vishnu awakens — auspicious for weddings, Tulsi Vivah.", category: "Spiritual" },
];

const Resources = () => {
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "calendar" ? "calendar" : "guides";

  const filteredGuides = ritualGuides.filter(
    (g) => g.title.toLowerCase().includes(search.toLowerCase()) ||
           g.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-primary font-display text-sm tracking-widest uppercase mb-2">
            ज्ञान भण्डार
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
            Sacred <span className="text-gradient-saffron">Resources</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Authentic ritual guides written by Pandits, plus the complete Nepali festival calendar — everything you need to perform sacred ceremonies with confidence.
          </motion.p>
        </div>
      </section>

      {/* Tabs: Guides + Calendar */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setSearchParams(val === "calendar" ? { tab: "calendar" } : {})}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-10">
              <TabsTrigger value="guides" className="gap-2"><BookOpen className="w-4 h-4" /> Ritual Guides</TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2"><Calendar className="w-4 h-4" /> Festival Calendar</TabsTrigger>
            </TabsList>

            {/* Guides */}
            <TabsContent value="guides">
              <div className="max-w-4xl mx-auto">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search rituals (Vivah, Bratabandha, Satyanarayan...)" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <Accordion type="single" collapsible className="space-y-3">
                  {filteredGuides.map((g) => (
                    <AccordionItem key={g.id} value={g.id} className="bg-card rounded-xl border border-border px-5 hover:border-primary/30 transition-colors">
                      <AccordionTrigger className="hover:no-underline py-5">
                        <div className="flex items-center gap-4 text-left">
                          <span className="text-3xl shrink-0">{g.icon}</span>
                          <div>
                            <h3 className="font-display text-lg font-semibold text-foreground">{g.title}</h3>
                            <p className="text-sm text-primary">{g.subtitle}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">When</p>
                            <p className="text-foreground font-medium">{g.when}</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Duration</p>
                            <p className="text-foreground font-medium">{g.duration}</p>
                          </div>
                        </div>

                        <p className="text-foreground leading-relaxed">{g.summary}</p>

                        <div>
                          <h4 className="font-display text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" /> What to prepare
                          </h4>
                          <ul className="space-y-1.5">
                            {g.prepare.map((p, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />{p}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-display text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Flame className="w-4 h-4 text-primary" /> Ritual steps
                          </h4>
                          <ol className="space-y-2">
                            {g.steps.map((s, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                <span className="text-foreground">{s}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <p className="text-xs text-primary uppercase tracking-wide font-medium mb-1">Sacred Mantra</p>
                          <p className="font-display text-foreground leading-relaxed mb-2">{g.mantra}</p>
                          <p className="text-sm text-muted-foreground italic">{g.mantraMeaning}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>

            {/* Calendar */}
            <TabsContent value="calendar">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Nepali Hindu Festival Calendar 2025</h2>
                  <p className="text-muted-foreground text-sm">Major festivals, Tithis, and auspicious dates for ritual planning.</p>
                </div>

                <div className="space-y-3">
                  {festivals2025.map((f, i) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-start gap-4 bg-card rounded-xl p-4 md:p-5 border border-border hover:border-primary/30 hover:shadow-card transition-all"
                    >
                      <div className="w-16 md:w-20 shrink-0 text-center bg-primary/10 rounded-lg p-2">
                        <p className="text-[10px] uppercase tracking-wider text-primary font-medium">{f.date.split(",")[0].split(" ")[0]}</p>
                        <p className="font-display text-lg md:text-xl font-bold text-primary leading-tight">{f.date.split(",")[0].split(" ")[1] || ""}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h3 className="font-display text-base md:text-lg font-semibold text-foreground">{f.title}</h3>
                            <p className="text-sm text-primary font-display">{f.titleNe}</p>
                          </div>
                          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0">{f.category}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                        <p className="text-xs text-muted-foreground mt-1.5">{f.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 p-5 rounded-xl bg-gradient-warm border border-primary/20 text-center">
                  <Star className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-sm text-foreground">
                    Need a Pandit for any of these festivals? <Link to="/services#booking" className="text-primary font-medium hover:underline">Book a ceremony →</Link>
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resources;
