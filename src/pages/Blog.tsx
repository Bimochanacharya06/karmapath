import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Sparkles, Flame, BookOpen, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const blogPosts = [
  {
    id: 1,
    title: "Why Lord Krishna Revealed His Vishwaroop to Arjuna — and What It Teaches Us Today",
    excerpt: "On the battlefield of Kurukshetra, Arjuna trembled as Krishna unveiled his Vishwaroop — a thousand suns blazing, all of creation contained in one form. Beyond the mythology lies a profound psychological lesson: surrender, perspective, and the courage to act without attachment to outcome. Pt. Ram Prasad unpacks Chapter 11 of the Bhagavad Gita and what it means for modern dharma.",
    date: "2026-04-18",
    readTime: "9 min read",
    author: "Pt. Ram Prasad Sharma",
    category: "Stories",
    image: "🌌",
    featured: true,
  },
  {
    id: 2,
    title: "A Day in the Life of a Kathmandu Pandit — From 4 AM Sandhya to Midnight Havan",
    excerpt: "Ever wondered what a working Pandit's day actually looks like? We followed Pt. Keshav Acharya for 24 hours — from his pre-dawn Brahma Muhurta meditation, three back-to-back Satyanarayan Pujas in Bhaktapur, navigating Kathmandu traffic with his samagri kit, to a late-night Naam Karan in Patan. Raw, real, and surprisingly funny.",
    date: "2026-04-12",
    readTime: "11 min read",
    author: "KarmaPath Team",
    category: "Behind the Scenes",
    image: "🌅",
  },
  {
    id: 3,
    title: "The Hidden Science of Havan: Why Burning Ghee & Herbs Actually Works",
    excerpt: "IIT-BHU researchers measured air quality during a 90-minute Agnihotra and found a 96% reduction in airborne bacteria. The samagri — sandalwood, guggul, camphor, mango bark — releases formaldehyde-neutralizing compounds. Ancient Rishis called it shuddhi; modern science calls it antimicrobial fumigation. Here's the data behind the smoke.",
    date: "2026-04-05",
    readTime: "10 min read",
    author: "Dr. Anjali Pant",
    category: "Science & Spirit",
    image: "🔥",
  },
  {
    id: 4,
    title: "Dashain 2026: Tika Muhurta, Jamara Sowing & the Real Story of Durga's Victory",
    excerpt: "Most of us receive Tika without knowing why. The 15-day Bada Dashain commemorates Goddess Durga's nine-night battle with Mahishasura — a buffalo demon who had a boon making him invincible to men and gods. Learn the auspicious 2082 BS Tika Muhurta, why Jamara is sown on Ghatasthapana, and the right way to receive blessings from elders.",
    date: "2026-03-28",
    readTime: "8 min read",
    author: "Pt. Vishnu Dev Pant",
    category: "Festivals",
    image: "🌾",
  },
  {
    id: 5,
    title: "I Performed My Father's Shraddha for the First Time. Here's What No One Told Me.",
    excerpt: "A first-person account from Deepak, a software engineer in Pokhara, on conducting his father's annual Shraddha. The unexpected weight of holding the Pinda. The crow that wouldn't come, then suddenly did. The moment the Pandit's mantra cracked something open in him. A meditation on grief, ritual, and the strange comfort of doing exactly what our ancestors did.",
    date: "2026-03-22",
    readTime: "7 min read",
    author: "Deepak Sharma (Guest)",
    category: "Stories",
    image: "🪔",
  },
  {
    id: 6,
    title: "Decoding the Gayatri Mantra — Word by Word, Syllable by Syllable",
    excerpt: "ॐ भूर्भुवः स्वः... 24 syllables, three lines, one of the most powerful mantras in the Vedic canon. We break down each word — what 'Tat Savitur Varenyam' really means, why it's chanted facing the Sun, and the neuroscience of its 7.83 Hz resonance with Earth's Schumann frequency. The mantra you've heard a thousand times, finally understood.",
    date: "2026-03-15",
    readTime: "12 min read",
    author: "Pt. Keshav Acharya",
    category: "Mantras",
    image: "🕉️",
  },
  {
    id: 7,
    title: "Bratabandha at 12 vs 25: Does Age Still Matter for the Sacred Thread?",
    excerpt: "Traditionally performed between 8–16 years, Bratabandha is increasingly being done in adulthood — sometimes at 30 or even 50. Is it still valid? Pandits across Nepal weigh in on the shifting cultural meaning of Upanayana, why Gen-Z is reclaiming it, and what changes (and what doesn't) when you take Gayatri Diksha as an adult.",
    date: "2026-03-08",
    readTime: "8 min read",
    author: "KarmaPath Team",
    category: "Modern Dharma",
    image: "📿",
  },
  {
    id: 8,
    title: "Tihar's 5 Days, Decoded: From Kaag Tihar to Bhai Tika",
    excerpt: "Day 1 we worship crows. Day 2, dogs. Day 3, cows and Lakshmi. Day 4, the self (Mha Puja for Newars) or Govardhan. Day 5, brothers. Each day's logic traces back to a specific Puranic story — the crow as Yama's messenger, the dog as Bhairav's guardian. A complete walkthrough of why Tihar is the deepest 5-day theology in the Hindu year.",
    date: "2026-03-01",
    readTime: "10 min read",
    author: "Pt. Hari Datta Upadhyay",
    category: "Festivals",
    image: "🪔",
  },
  {
    id: 9,
    title: "Mangal Dosh, Shani Sade Sati & Kaal Sarp: Are Astrological Doshas Real?",
    excerpt: "Every Nepali family has heard 'don't marry her, she has Mangal Dosh' or 'his Sade Sati is starting'. We sat down with three respected Jyotish acharyas and a skeptic astrophysicist to ask: where does the math come from? What do the remedies actually do? And how do you know if your Pandit is reading your chart correctly?",
    date: "2026-02-22",
    readTime: "13 min read",
    author: "KarmaPath Team",
    category: "Jyotish",
    image: "♈",
  },
  {
    id: 10,
    title: "Inside Pashupatinath at 4 AM: The Mangal Aarti Most Devotees Never See",
    excerpt: "While Kathmandu sleeps, the Bhatta priests of Pashupatinath perform the Mangal Aarti — the first awakening of Lord Shiva. We were granted rare access to document the ritual: the bathing of the Jyotirlinga in milk, honey, and Bel patra, the chanting of the Rudri, the lighting of the 108 lamps. Photo essay + audio.",
    date: "2026-02-14",
    readTime: "6 min read",
    author: "KarmaPath Team",
    category: "Behind the Scenes",
    image: "🛕",
  },
  {
    id: 11,
    title: "Why We Boil Milk Until It Overflows During Griha Pravesh",
    excerpt: "It looks like a small thing — placing a pot of milk on the new stove and letting it spill over the rim. But this single act carries layers of meaning: prosperity overflowing into every direction, the kitchen as the heart of the home, an offering to the Vastu Purusha. The Vedic logic behind one of Nepal's most beloved Griha Pravesh moments.",
    date: "2026-02-07",
    readTime: "5 min read",
    author: "Pt. Ram Prasad Sharma",
    category: "Rituals",
    image: "🥛",
  },
  {
    id: 12,
    title: "The Newar Ihi Ceremony: When a 7-Year-Old Marries a Bel Fruit",
    excerpt: "In Newar tradition, every girl is married three times — first to the Bel fruit (representing Lord Vishnu) during Ihi, then to the Sun during Bahra, and finally to her human husband. The result? A girl is technically never a widow. We explore the brilliant feminist theology hidden inside a centuries-old Kathmandu Valley ritual.",
    date: "2026-01-30",
    readTime: "9 min read",
    author: "Pt. Vishnu Dev Pant",
    category: "Stories",
    image: "🌸",
  },
];

const categories = ["All", "Stories", "Festivals", "Mantras", "Rituals", "Behind the Scenes", "Science & Spirit", "Jyotish", "Modern Dharma"];

const trending = [
  { title: "Tika Muhurta for Dashain 2026", icon: TrendingUp },
  { title: "How to perform Satyanarayan Puja at home", icon: BookOpen },
  { title: "Mahamrityunjaya Mantra — 108 times daily?", icon: Flame },
  { title: "Kundali matching: 36 gunas explained", icon: Sparkles },
];

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? blogPosts : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-24 pb-16 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-primary font-display text-sm tracking-widest uppercase mb-2">
            ज्ञान
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
            Sacred <span className="text-gradient-saffron">Knowledge</span> Blog
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            In-depth articles on Hindu Karmakanda traditions, Vedic wisdom, ritual guides, and Nepali cultural heritage — written by experienced Pandits and scholars.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === cat
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured Post */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl border border-border p-8 md:p-12 mb-12 hover:shadow-elevated transition-all"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="text-8xl">{filtered[0]?.image}</div>
              <div className="flex-1">
                <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                  {filtered[0]?.category}
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-3 mb-3">
                  {filtered[0]?.title}
                </h2>
                <p className="text-muted-foreground mb-4">{filtered[0]?.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {filtered[0]?.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {filtered[0]?.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {filtered[0]?.readTime}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Two-column layout: posts grid + trending sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.slice(1).map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-card rounded-2xl border border-border p-6 hover:shadow-elevated hover:border-primary/20 transition-all group cursor-pointer"
                >
                  <div className="text-5xl mb-4">{post.image}</div>
                  <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{post.category}</span>
                  <h3 className="font-display text-lg font-semibold text-foreground mt-3 mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Trending sidebar */}
            <aside className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="font-display text-lg font-semibold text-foreground">Trending now</h3>
                </div>
                <ul className="space-y-3">
                  {trending.map((t, i) => (
                    <li key={t.title} className="flex items-start gap-3 group cursor-pointer">
                      <span className="font-display text-2xl text-primary/30 font-bold leading-none w-6">{String(i + 1).padStart(2, "0")}</span>
                      <p className="text-sm text-foreground group-hover:text-primary transition-colors leading-snug">{t.title}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Quick read</p>
                  <p className="text-sm text-foreground italic leading-relaxed">
                    "धर्म एव हतो हन्ति, धर्मो रक्षति रक्षितः।"
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">— Manusmriti 8.15: Dharma destroys those who destroy it; dharma protects those who protect it.</p>
                </div>
              </div>
            </aside>
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 bg-card rounded-2xl border border-border p-8 md:p-12 text-center">
            <h3 className="font-display text-2xl font-bold text-foreground mb-3">📩 Stay Connected with Dharma</h3>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              Get weekly articles on Vedic traditions, festival reminders, and Panchang updates delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="your@email.com" className="flex-1 h-11 rounded-lg border border-input bg-background px-4 text-sm" />
              <button className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
