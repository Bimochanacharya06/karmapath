import type { Tables } from "@/integrations/supabase/types";
import vishwaroopImg from "@/assets/hero-krishna-vishwaroop.jpg";
import vivahImg from "@/assets/service-vivah.jpg";
import bratabandhaImg from "@/assets/service-bratabandha.jpg";
import pujaImg from "@/assets/service-puja.jpg";
import guphaImg from "@/assets/service-gupha.jpg";
import shraddhaImg from "@/assets/service-shraddha.jpg";
import templeImg from "@/assets/hero-temple.jpg";
import samagriImg from "@/assets/puja-items.jpg";

export interface BlogCoverPreset {
  key: string;
  value: string;
  labelNe: string;
  labelEn: string;
  src: string;
}

export const BLOG_COVER_PRESETS: BlogCoverPreset[] = [
  {
    key: "vishwaroop",
    value: "preset:vishwaroop",
    labelNe: "श्रीकृष्ण विश्वरूप",
    labelEn: "Krishna Vishwaroop",
    src: vishwaroopImg,
  },
  {
    key: "puja",
    value: "preset:puja",
    labelNe: "वैदिक हवन र पूजा",
    labelEn: "Vedic Havan & Puja",
    src: pujaImg,
  },
  {
    key: "bratabandha",
    value: "preset:bratabandha",
    labelNe: "ब्रतबन्ध र गायत्री",
    labelEn: "Bratabandha & Gayatri",
    src: bratabandhaImg,
  },
  {
    key: "gupha",
    value: "preset:gupha",
    labelNe: "नेवार संस्कृति र इही",
    labelEn: "Newar Heritage",
    src: guphaImg,
  },
  {
    key: "vivah",
    value: "preset:vivah",
    labelNe: "वैदिक विवाह संस्कार",
    labelEn: "Vedic Vivah",
    src: vivahImg,
  },
  {
    key: "shraddha",
    value: "preset:shraddha",
    labelNe: "पितृ कार्य र तर्पण",
    labelEn: "Shraddha & Tarpan",
    src: shraddhaImg,
  },
  {
    key: "temple",
    value: "preset:temple",
    labelNe: "पशुपतिनाथ सन्ध्या आरती",
    labelEn: "Temple Aarti",
    src: templeImg,
  },
  {
    key: "samagri",
    value: "preset:samagri",
    labelNe: "पवित्र पूजा सामग्री",
    labelEn: "Sacred Samagri",
    src: samagriImg,
  },
];

export const resolveBlogCover = (imageUrl?: string | null): string => {
  if (!imageUrl) return vishwaroopImg;
  if (imageUrl.startsWith("preset:")) {
    const found = BLOG_COVER_PRESETS.find((p) => p.value === imageUrl);
    return found ? found.src : vishwaroopImg;
  }
  return imageUrl;
};

export const DEFAULT_BLOG_POSTS: Tables<"blog_posts">[] = [
  {
    id: "22222222-2222-4222-8222-222222222201",
    image_url: "preset:vishwaroop",
    category_ne: "शास्त्र कथा",
    category_en: "Stories",
    title_ne: "कुरुक्षेत्रमा श्रीकृष्णको विश्वरूप दर्शन र यसको सन्देश",
    title_en: "Why Lord Krishna Revealed His Vishwaroop to Arjuna",
    excerpt_ne:
      "श्रीमद्भगवद्गीताको ११ औं अध्यायमा भगवान् श्रीकृष्णले अर्जुनलाई देखाउनुभएको विश्वरूपले कर्म, समर्पण र धर्मको गहिरो अर्थ सिकाउँछ।",
    excerpt_en:
      "On the battlefield of Kurukshetra, Krishna unveiled His Vishwaroop — teaching surrender, perspective, and fearless dharma without attachment to outcome.",
    content_ne:
      "श्रीमद्भगवद्गीताको ११ औं अध्यायमा अर्जुनको जिज्ञासा र भक्तिपछि भगवान् श्रीकृष्णले दिव्य चक्षु प्रदान गरी आफ्नो अनन्त विश्वरूप दर्शन गराउनुभयो।\n\nयस दर्शनको मुख्य सन्देश केवल चमत्कार होइन, बरु अहंकार त्याग गरी फलाशारहित स्वधर्म पालन गर्नु हो। जब मानिसले सम्पूर्ण सृष्टिमा एउटै परमात्माको उपस्थिति देख्छ, तब डर र द्विविधा स्वतः समाप्त हुन्छ।",
    content_en:
      "In the eleventh chapter of the Bhagavad Gita, Lord Krishna grants Arjuna divine vision to witness the infinite cosmic form encompassing time, creation, and dissolution.\n\nThe core lesson of Vishwaroop Darshan is humility and Nishkama Karma — acting with courage and devotion while surrendering attachment to personal ego and anxiety.",
    author: "Pt. Ram Prasad Sharma",
    read_time: "6 min",
    published: true,
    created_at: "2026-04-06T09:00:00.000Z",
    updated_at: "2026-04-06T09:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222202",
    image_url: "preset:puja",
    category_ne: "पूजा विज्ञान",
    category_en: "Rituals",
    title_ne: "हवनमा शुद्ध घिउ र जडीबुटी आहुति दिनुको महत्व",
    title_en: "The Sacred Science Behind Vedic Havan & Herbs",
    excerpt_ne:
      "हवनमा प्रयोग हुने श्रीखण्ड, गुग्गुल, कपुर र घिउको आहुतिले वातावरण शुद्ध राख्नुका साथै मनमा गहिरो शान्ति प्रदान गर्छ।",
    excerpt_en:
      "Sandalwood, camphor, sesame, and pure cow ghee offered into Agni purify the home atmosphere while centering the family's focus.",
    content_ne:
      "वैदिक यज्ञ र हवनमा अग्निदेवलाई दूत मानिन्छ। गाईको शुद्ध घिउ, कालो तिल, जौ, श्रीखण्ड र सुगन्धित जडीबुटी 'स्वाहा' उच्चारणसहित अर्पण गर्दा सूक्ष्म सुगन्ध र सकारात्मक ऊर्जा घरभरि फैलिन्छ।\n\nसामूहिक रूपमा मन्त्र उच्चारण र हवन गर्दा परिवारका सदस्यहरूमा एकाग्रता, कृतज्ञता र आपसी सद्भाव प्रगाढ बन्छ।",
    content_en:
      "In Vedic tradition, Agni serves as the sacred messenger carrying offerings and intentions. Pure cow ghee, black sesame, barley, and herbal charu create a purifying aromatic environment.\n\nSitting together around the Havan kund aligns breath, mantra rhythm, and family gratitude during milestone ceremonies.",
    author: "Dr. Anjali Pant",
    read_time: "5 min",
    published: true,
    created_at: "2026-04-05T09:00:00.000Z",
    updated_at: "2026-04-05T09:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222203",
    image_url: "preset:bratabandha",
    category_ne: "मन्त्र ज्ञान",
    category_en: "Mantras",
    title_ne: "गायत्री मन्त्रको अर्थ र जप गर्ने सही विधि",
    title_en: "Decoding the Gayatri Mantra — Meaning & Practice",
    excerpt_ne:
      "२४ अक्षरको गायत्री मन्त्र वैदिक परम्पराको मूल आधार हो। पूर्व फर्किएर शान्त चित्तले जप गर्नाले बुद्धि र एकाग्रता बढ्छ।",
    excerpt_en:
      "Twenty-four sacred syllables chanted at sunrise to illuminate intellect and align daily life with clarity and truth.",
    content_ne:
      "गायत्री मन्त्रमा सृष्टिकर्ता सविता देवको तेजको ध्यान गरिन्छ र हाम्रो बुद्धिलाई सत्मार्गमा प्रेरित गर्न प्रार्थना गरिन्छ।\n\nबिहान सूर्योदयको समयमा स्नान गरी पूर्व वा उत्तर फर्किएर कुशको आसनमा बसी ११, २१ वा १०८ पटक शान्त श्वासका साथ जप गर्नु उत्तम मानिन्छ।",
    content_en:
      "Composed of twenty-four syllables in the Gayatri meter, this timeless Vedic prayer invokes divine radiance to awaken discernment (Medha and Dhi).\n\nPractitioners traditionally sit facing East at sunrise on a clean mat, chanting 11, 21, or 108 repetitions with steady posture and calm awareness.",
    author: "Pt. Keshav Acharya",
    read_time: "7 min",
    published: true,
    created_at: "2026-04-04T09:00:00.000Z",
    updated_at: "2026-04-04T09:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222204",
    image_url: "preset:gupha",
    category_ne: "संस्कृति",
    category_en: "Heritage",
    title_ne: "नेवार संस्कृतिमा इही (बेल विवाह) र गुफा परम्परा",
    title_en: "The Newar Ihi Ceremony & Bel Bibaha Tradition",
    excerpt_ne:
      "काठमाडौं उपत्यकाको मौलिक इही र बाह्रा संस्कारले बालिकालाई जीवनभर सम्मान, सुरक्षा र आध्यात्मिक शक्ति प्रदान गर्छ।",
    excerpt_en:
      "Exploring the centuries-old Kathmandu Valley tradition of Bel Bibaha and the 12-day Surya Darshan coming-of-age ceremony.",
    content_ne:
      "नेवार समुदायमा बाल्यकालमा सुवर्ण कुमार र बेल फललाई साक्षी राखी गरिने इही संस्कार र त्यसपछिको बाह्रा (सूर्य दर्शन) अत्यन्त गरिमामय सांस्कृतिक धरोहर हुन्।\n\nयी संस्कारहरूले नारीको आत्मसम्मान, स्वतन्त्रता र पारिवारिक आशीर्वादलाई पुस्तौंदेखि जीवित राखेका छन्।",
    content_en:
      "Unique to the Newar heritage of Kathmandu Valley, Ihi (Bel Bibaha) and Bahra (12-day seclusion concluding in Surya Darshan) celebrate girlhood with sacred dignity and community blessing.",
    author: "Pt. Vishnu Dev Pant",
    read_time: "6 min",
    published: true,
    created_at: "2026-04-03T09:00:00.000Z",
    updated_at: "2026-04-03T09:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222205",
    image_url: "preset:vivah",
    category_ne: "संस्कार",
    category_en: "Rituals",
    title_ne: "वैदिक विवाहमा सप्तपदीका सात वचनहरूको अर्थ",
    title_en: "Seven Sacred Steps: Meaning of Saptapadi in Vivah",
    excerpt_ne:
      "पवित्र अग्निलाई साक्षी राखेर चालिने सात पाइलाले दाम्पत्य जीवनको मित्रता, विश्वास र साझा धर्मलाई जनाउँछ।",
    excerpt_en:
      "Each step around the sacred fire represents a lifelong vow of nourishment, strength, harmony, and shared spiritual growth.",
    content_ne:
      "वैदिक विवाहको सबैभन्दा महत्वपूर्ण चरण सप्तपदी हो। अग्नि कुण्डको वरिपरि चालिने सात पाइलाले अन्न-समृद्धि, स्वास्थ्य, सद्बुद्धि, पारिवारिक सुख, सन्तति कल्याण र आजीवन मित्रताको प्रतिज्ञा जनाउँछन्।",
    content_en:
      "Saptapadi seals the Vedic wedding covenant. With each of the seven steps before Agni, the couple pledges mutual respect, shared sustenance, resilience, and lifelong companionship.",
    author: "Pt. Ram Prasad Sharma",
    read_time: "5 min",
    published: true,
    created_at: "2026-04-02T09:00:00.000Z",
    updated_at: "2026-04-02T09:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222206",
    image_url: "preset:shraddha",
    category_ne: "पितृ धर्म",
    category_en: "Tradition",
    title_ne: "श्राद्ध र तर्पण: पितृहरूप्रति कृतज्ञताको पर्व",
    title_en: "Understanding Shraddha & Ancestral Gratitude",
    excerpt_ne:
      "आफ्ना पुर्खाहरूको सम्झनामा श्रद्धापूर्वक गरिने तर्पण र पिण्डदानले पुस्ताबीचको संस्कारलाई जोगाइराख्छ।",
    excerpt_en:
      "How annual Tithi Shraddha and Tarpan honor family lineage with humility, mindfulness, and reverence.",
    content_ne:
      "'श्रद्धया इदं श्राद्धम्' अर्थात् पूर्ण श्रद्धाका साथ गरिने कार्य नै श्राद्ध हो। कुश, कालो तिल र जलद्वारा तर्पण तथा पिण्डदान गर्नाले पुर्खाहरूको त्याग र आशीर्वादप्रति कृतज्ञता प्रकट हुन्छ।",
    content_en:
      "Rooted in the Sanskrit word Shraddha (sincere reverence), annual Tithi rituals and Pitru Paksha Tarpan connect present generations with the memory and values of their ancestors.",
    author: "Pt. Hari Datta Upadhyay",
    read_time: "5 min",
    published: true,
    created_at: "2026-04-01T09:00:00.000Z",
    updated_at: "2026-04-01T09:00:00.000Z",
  },
];
