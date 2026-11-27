import imgVivah from "@/assets/service-vivah.jpg";
import imgBratabandha from "@/assets/service-bratabandha.jpg";
import imgNamakaran from "@/assets/service-namakaran.jpg";
import imgGupha from "@/assets/service-gupha.jpg";
import imgPuja from "@/assets/service-puja.jpg";
import imgShraddha from "@/assets/service-shraddha.jpg";
import imgPujaItems from "@/assets/puja-items.jpg";

export type ServiceCategory = "home" | "milestone" | "ancestral";
export type ServicePackageTier = "full" | "pandit";

export interface ServicePackageItem {
  id: string;
  bookingValue: string;
  samagriQuery: string;
  category: ServiceCategory;
  featured?: boolean;
  image: string;
  titleNe: string;
  titleEn: string;
  taglineNe: string;
  taglineEn: string;
  durationNe: string;
  durationEn: string;
  rating: number;
  includesFullNe: string[];
  includesFullEn: string[];
  includesPanditNe: string[];
  includesPanditEn: string[];
}

export const SERVICE_PACKAGES: ServicePackageItem[] = [
  {
    id: "vivah",
    bookingValue: "विवाह (Vivah)",
    samagriQuery: "Vivah (Wedding)",
    category: "milestone",
    featured: true,
    image: imgVivah,
    titleNe: "वैदिक विवाह संस्कार",
    titleEn: "Vedic Vivah (Wedding)",
    taglineNe: "स्वयम्भर, कन्यादान, लाजा होम र सप्तपदी वचनसहित पूर्ण वैदिक विवाह।",
    taglineEn: "Sacred Hindu marriage ceremony with Kanyadaan, Laja Homa & Saptapadi vows.",
    durationNe: "१–२ दिन",
    durationEn: "1–2 days",
    rating: 5.0,
    includesFullNe: ["प्रमुख र सहायक आचार्य", "सप्तपदी र हवन सामग्री व्यवस्था", "कुण्डली र लग्न परामर्श"],
    includesFullEn: ["Lead & Co-Pandit", "Wedding Havan Samagri Setup", "Kundali & Lagna Guidance"],
    includesPanditNe: ["प्रमुख वैदिक आचार्य", "लग्न परामर्श", "सम्पूर्ण विवाह विधि"],
    includesPanditEn: ["Lead Vedic Acharya", "Lagna Guidance", "Complete Wedding Rites"],
  },
  {
    id: "bratabandha",
    bookingValue: "ब्रतबन्ध (Bratabandha)",
    samagriQuery: "Bratabandha",
    category: "milestone",
    featured: true,
    image: imgBratabandha,
    titleNe: "ब्रतबन्ध (उपनयन संस्कार)",
    titleEn: "Bratabandha Ceremony",
    taglineNe: "यज्ञोपवीत धारण, गायत्री दीक्षा, अग्नि हवन र भिक्षा विधि।",
    taglineEn: "Sacred Janai initiation, Gayatri Mantra Diksha & Agni Homa.",
    durationNe: "पूरा दिन",
    durationEn: "Full day",
    rating: 4.9,
    includesFullNe: ["वैदिक आचार्य", "जनै, दण्ड र पूर्ण सामग्री सेट", "हवन कुण्ड व्यवस्था"],
    includesFullEn: ["Vedic Acharya", "Janai & Full Samagri Setup", "Havan Kund Arrangement"],
    includesPanditNe: ["वैदिक आचार्य", "साइत मिलान", "सम्पूर्ण उपनयन विधि"],
    includesPanditEn: ["Vedic Acharya", "Muhurta Matching", "Complete Upanayana Vidhi"],
  },
  {
    id: "satyanarayan",
    bookingValue: "सत्यनारायण पूजा (Satyanarayan Puja)",
    samagriQuery: "Satyanarayan Puja",
    category: "home",
    image: imgPuja,
    titleNe: "सत्यनारायण पूजा",
    titleEn: "Satyanarayan Puja",
    taglineNe: "परिवारको सुख, शान्ति र समृद्धिका लागि ५ अध्याय कथा तथा हवन।",
    taglineEn: "Complete Vishnu worship, 5-chapter Katha, Havan & Prasad vidhi.",
    durationNe: "२.५ घण्टा",
    durationEn: "2.5 hrs",
    rating: 4.9,
    includesFullNe: ["प्रमाणित पण्डित", "पूजा र हवन सामग्री सेट", "कलश र प्रसाद विधि"],
    includesFullEn: ["Verified Pandit", "Complete Samagri Set", "Kalash & Prasad Vidhi"],
    includesPanditNe: ["प्रमाणित पण्डित", "मुहूर्त परामर्श", "पूरा कथा र आरती"],
    includesPanditEn: ["Verified Pandit", "Muhurta Guidance", "Full Katha & Aarti"],
  },
  {
    id: "griha-pravesh",
    bookingValue: "गृह प्रवेश (Griha Pravesh)",
    samagriQuery: "Griha Pravesh Puja",
    category: "home",
    image: imgPujaItems,
    titleNe: "गृह प्रवेश र वास्तु शान्ति",
    titleEn: "Griha Pravesh & Vastu Puja",
    taglineNe: "नयाँ घर प्रवेशमा मङ्गल कलश, वास्तु पुरुष होम र नवग्रह शान्ति।",
    taglineEn: "New home sanctification with Mangal Kalash, Navagraha & Vastu Homa.",
    durationNe: "३–४ घण्टा",
    durationEn: "3–4 hrs",
    rating: 4.95,
    includesFullNe: ["वरिष्ठ आचार्य", "वास्तु र हवन सामग्री सेट", "हवन कुण्ड र समिधा"],
    includesFullEn: ["Senior Acharya", "Vastu & Havan Samagri", "Havan Kund & Samidha"],
    includesPanditNe: ["वरिष्ठ आचार्य", "शुभ लग्न निर्धारण", "वास्तु शान्ति हवन"],
    includesPanditEn: ["Senior Acharya", "Auspicious Lagna", "Vastu Shanti Havan"],
  },
  {
    id: "namakaran",
    bookingValue: "नामकरण (Namakaran)",
    samagriQuery: "Namakaran Sanskar",
    category: "milestone",
    image: imgNamakaran,
    titleNe: "नामकरण (न्वारन) र चिना",
    titleEn: "Namakaran & Janam Kundali",
    taglineNe: "शिशुको जन्म नक्षत्र अनुसार शुभ नाम र जन्म कुण्डली निर्माण।",
    taglineEn: "11th-day baby naming ceremony with Panchang Kundali preparation.",
    durationNe: "२.५ घण्टा",
    durationEn: "2.5 hrs",
    rating: 4.85,
    includesFullNe: ["ज्योतिष पण्डित", "न्वारन र हवन सामग्री", "जन्म कुण्डली (चिना)"],
    includesFullEn: ["Jyotish Pandit", "Naming & Havan Kit", "Janam Kundali Chart"],
    includesPanditNe: ["ज्योतिष पण्डित", "राशि नाम छनोट", "जन्म कुण्डली निर्माण"],
    includesPanditEn: ["Jyotish Pandit", "Nakshatra Name", "Janam Kundali Chart"],
  },
  {
    id: "gupha-ihi",
    bookingValue: "गुफा राख्ने / इही (Ihi & Bahra)",
    samagriQuery: "Ihi Bel Bibaha Puja",
    category: "milestone",
    image: imgGupha,
    titleNe: "गुफा राख्ने / इही संस्कार",
    titleEn: "Newar Ihi & Bahra",
    taglineNe: "मौलिक नेवार परम्परा अनुसार सुवर्ण कुमार बेल विवाह र सूर्य दर्शन।",
    taglineEn: "Authentic Newar Bel Bibaha & Surya Darshan ritual by local Guruju.",
    durationNe: "३–४ घण्टा",
    durationEn: "3–4 hrs",
    rating: 4.9,
    includesFullNe: ["अनुभवी नेवार गुरुजु", "बेल र परम्परागत सामग्री", "सूर्य अर्घ्य सेट"],
    includesFullEn: ["Experienced Guruju", "Bel & Traditional Kit", "Surya Arghya Setup"],
    includesPanditNe: ["अनुभवी गुरुजु", "साइत निर्धारण", "सम्पूर्ण परम्परागत विधि"],
    includesPanditEn: ["Experienced Guruju", "Auspicious Timing", "Traditional Vidhi"],
  },
  {
    id: "rudri",
    bookingValue: "रुद्री पाठ (Rudri Path)",
    samagriQuery: "Rudri Path",
    category: "home",
    image: imgPuja,
    titleNe: "रुद्री पाठ र महामृत्युञ्जय",
    titleEn: "Rudri Path & Shiva Abhishek",
    taglineNe: "आरोग्य, ग्रह शान्ति र मनोकामना सिद्धिका लागि रुद्राभिषेक तथा हवन।",
    taglineEn: "Sacred Rudrabhishek chanting, Panchamrit snan & peace Havan.",
    durationNe: "३ घण्टा",
    durationEn: "3 hrs",
    rating: 4.9,
    includesFullNe: ["यजुर्वेद पण्डित", "बेलपत्र, पञ्चामृत र रुद्री सेट", "हवन सामग्री"],
    includesFullEn: ["Yajurveda Pandit", "Belpatra & Abhishek Set", "Havan Samagri"],
    includesPanditNe: ["यजुर्वेद पण्डित", "संकल्प र रुद्राभिषेक", "शान्ति पाठ"],
    includesPanditEn: ["Yajurveda Pandit", "Sankalpa & Abhishek", "Shanti Path"],
  },
  {
    id: "shraddha",
    bookingValue: "श्राद्ध (Shraddha)",
    samagriQuery: "Shraddha Karma",
    category: "ancestral",
    image: imgShraddha,
    titleNe: "वार्षिक श्राद्ध र तर्पण",
    titleEn: "Shraddha & Pitru Tarpan",
    taglineNe: "पितृ उद्धार र आशीर्वादका लागि विधिपूर्वक तिल तर्पण तथा पिण्डदान।",
    taglineEn: "Dignified Tithi Shraddha, Til Tarpan & Pinda Daan ancestral rites.",
    durationNe: "२.५ घण्टा",
    durationEn: "2.5 hrs",
    rating: 4.9,
    includesFullNe: ["पितृ कर्म विशेषज्ञ गुरु", "कुश, कालो तिल र पिण्ड सामग्री", "तर्पण पात्र सेट"],
    includesFullEn: ["Pitru Karma Acharya", "Kush, Til & Pinda Kit", "Tarpan Vessel Set"],
    includesPanditNe: ["अनुभवी पुरोहित", "तिथि र संकल्प विधि", "सम्पूर्ण तर्पण र पिण्डदान"],
    includesPanditEn: ["Senior Purohit", "Tithi Sankalpa", "Full Tarpan & Pinda Daan"],
  },
];

export const NEPAL_CITIES = [
  { value: "Kathmandu", ne: "काठमाडौं", en: "Kathmandu" },
  { value: "Lalitpur", ne: "ललितपुर", en: "Lalitpur" },
  { value: "Bhaktapur", ne: "भक्तपुर", en: "Bhaktapur" },
  { value: "Pokhara", ne: "पोखरा", en: "Pokhara" },
  { value: "Chitwan", ne: "चितवन", en: "Chitwan" },
  { value: "Butwal", ne: "बुटवल", en: "Butwal" },
  { value: "Biratnagar", ne: "विराटनगर", en: "Biratnagar" },
];
