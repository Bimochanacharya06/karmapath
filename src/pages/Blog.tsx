import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import vishwaroopImg from "@/assets/hero-krishna-vishwaroop.jpg";
import vivahImg from "@/assets/service-vivah.jpg";
import bratabandhaImg from "@/assets/service-bratabandha.jpg";
import pujaImg from "@/assets/service-puja.jpg";
import guphaImg from "@/assets/service-gupha.jpg";
import shraddhaImg from "@/assets/service-shraddha.jpg";

const blogPosts = [
  {
    id: 1,
    img: vishwaroopImg,
    categoryNe: "शास्त्र कथा",
    categoryEn: "Stories",
    titleNe: "कुरुक्षेत्रमा श्रीकृष्णको विश्वरूप दर्शन र यसको सन्देश",
    titleEn: "Why Lord Krishna Revealed His Vishwaroop to Arjuna",
    excerptNe:
      "श्रीमद्भगवद्गीताको ११ औं अध्यायमा भगवान् श्रीकृष्णले अर्जुनलाई देखाउनुभएको विश्वरूपले कर्म, समर्पण र धर्मको गहिरो अर्थ सिकाउँछ।",
    excerptEn:
      "On the battlefield of Kurukshetra, Krishna unveiled His Vishwaroop — teaching surrender, perspective, and fearless dharma without attachment to outcome.",
    author: "Pt. Ram Prasad Sharma",
    readTime: "6 min",
  },
  {
    id: 2,
    img: pujaImg,
    categoryNe: "पूजा विज्ञान",
    categoryEn: "Rituals",
    titleNe: "हवनमा शुद्ध घिउ र जडीबुटी आहुति दिनुको महत्व",
    titleEn: "The Sacred Science Behind Vedic Havan & Herbs",
    excerptNe:
      "हवनमा प्रयोग हुने श्रीखण्ड, गुग्गुल, कपुर र घिउको आहुतिले वातावरण शुद्ध राख्नुका साथै मनमा गहिरो शान्ति प्रदान गर्छ।",
    excerptEn:
      "Sandalwood, camphor, sesame, and pure cow ghee offered into Agni purify the home atmosphere while centering the family's focus.",
    author: "Dr. Anjali Pant",
    readTime: "5 min",
  },
  {
    id: 3,
    img: bratabandhaImg,
    categoryNe: "मन्त्र ज्ञान",
    categoryEn: "Mantras",
    titleNe: "गायत्री मन्त्रको अर्थ र जप गर्ने सही विधि",
    titleEn: "Decoding the Gayatri Mantra — Meaning & Practice",
    excerptNe:
      "२४ अक्षरको गायत्री मन्त्र वैदिक परम्पराको मूल आधार हो। पूर्व फर्किएर शान्त चित्तले जप गर्नाले बुद्धि र एकाग्रता बढ्छ।",
    excerptEn:
      "Twenty-four sacred syllables chanted at sunrise to illuminate intellect and align daily life with clarity and truth.",
    author: "Pt. Keshav Acharya",
    readTime: "7 min",
  },
  {
    id: 4,
    img: guphaImg,
    categoryNe: "संस्कृति",
    categoryEn: "Heritage",
    titleNe: "नेवार संस्कृतिमा इही (बेल विवाह) र गुफा परम्परा",
    titleEn: "The Newar Ihi Ceremony & Bel Bibaha Tradition",
    excerptNe:
      "काठमाडौं उपत्यकाको मौलिक इही र बाह्रा संस्कारले बालिकालाई जीवनभर सम्मान, सुरक्षा र आध्यात्मिक शक्ति प्रदान गर्छ।",
    excerptEn:
      "Exploring the centuries-old Kathmandu Valley tradition of Bel Bibaha and the 12-day Surya Darshan coming-of-age ceremony.",
    author: "Pt. Vishnu Dev Pant",
    readTime: "6 min",
  },
  {
    id: 5,
    img: vivahImg,
    categoryNe: "संस्कार",
    categoryEn: "Rituals",
    titleNe: "वैदिक विवाहमा सप्तपदीका सात वचनहरूको अर्थ",
    titleEn: "Seven Sacred Steps: Meaning of Saptapadi in Vivah",
    excerptNe:
      "पवित्र अग्निलाई साक्षी राखेर चालिने सात पाइलाले दाम्पत्य जीवनको मित्रता, विश्वास र साझा धर्मलाई जनाउँछ।",
    excerptEn:
      "Each step around the sacred fire represents a lifelong vow of nourishment, strength, harmony, and shared spiritual growth.",
    author: "Pt. Ram Prasad Sharma",
    readTime: "5 min",
  },
  {
    id: 6,
    img: shraddhaImg,
    categoryNe: "पितृ धर्म",
    categoryEn: "Tradition",
    titleNe: "श्राद्ध र तर्पण: पितृहरूप्रति कृतज्ञताको पर्व",
    titleEn: "Understanding Shraddha & Ancestral Gratitude",
    excerptNe:
      "आफ्ना पुर्खाहरूको सम्झनामा श्रद्धापूर्वक गरिने तर्पण र पिण्डदानले पुस्ताबीचको संस्कारलाई जोगाइराख्छ।",
    excerptEn:
      "How annual Tithi Shraddha and Tarpan honor family lineage with humility, mindfulness, and reverence.",
    author: "Pt. Hari Datta Upadhyay",
    readTime: "5 min",
  },
];

type BlogPost = (typeof blogPosts)[number];

const Blog = () => {
  const { lang } = useLanguage();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="pt-28 pb-12 bg-gradient-warm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2">
            {lang === "ne" ? "वैदिक लेखहरू" : "Sacred Articles"}
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
            {lang === "ne" ? "धर्म, संस्कार र ज्ञान" : "Vedic Wisdom Blog"}
          </h1>
          <p className="text-muted-foreground text-base">
            {lang === "ne"
              ? "नेपाली वैदिक परम्परा, मन्त्र र संस्कारसम्बन्धी संक्षिप्त लेखहरू।"
              : "Concise reflections on Vedic rituals, mantras, and Nepali heritage."}
          </p>
        </div>
      </section>

      <section className="py-14 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => {
              const title = lang === "ne" ? post.titleNe : post.titleEn;
              const excerpt = lang === "ne" ? post.excerptNe : post.excerptEn;
              const category = lang === "ne" ? post.categoryNe : post.categoryEn;

              return (
                <article
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/35 hover:shadow-elevated transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={post.img}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                        {category}
                      </span>
                      <h2 className="font-display text-lg font-bold text-foreground mt-2.5 mb-2 group-hover:text-primary transition-colors">
                        {title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{excerpt}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.readTime}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Dialog open={Boolean(selectedPost)} onOpenChange={(o) => !o && setSelectedPost(null)}>
        <DialogContent className="sm:max-w-xl">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl leading-snug text-left">
                  {lang === "ne" ? selectedPost.titleNe : selectedPost.titleEn}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4 text-xs pt-1">
                  <span>{selectedPost.author}</span>
                  <span>·</span>
                  <span>{selectedPost.readTime}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2 text-sm sm:text-base text-foreground leading-relaxed">
                <img
                  src={selectedPost.img}
                  alt=""
                  className="w-full h-48 object-cover rounded-xl border border-border"
                />
                <p>{lang === "ne" ? selectedPost.excerptNe : selectedPost.excerptEn}</p>
                <div className="pt-2 flex flex-wrap gap-4 text-sm">
                  <Link to="/ask-pandit" className="text-primary font-semibold hover:underline">
                    {lang === "ne" ? "AI पण्डितलाई सोध्नुहोस् →" : "Ask AI Pandit →"}
                  </Link>
                  <Link to="/services#booking" className="text-primary font-semibold hover:underline">
                    {lang === "ne" ? "पूजा बुक गर्नुहोस् →" : "Book a Ceremony →"}
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Blog;
