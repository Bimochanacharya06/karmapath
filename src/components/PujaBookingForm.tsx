import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams } from "react-router-dom";

const ritualOptions = [
  "नामकरण (Namakaran)",
  "ब्रतबन्ध (Bratabandha)",
  "विवाह (Vivah)",
  "श्राद्ध (Shraddha)",
  "सत्यनारायण पूजा (Satyanarayan Puja)",
  "रुद्री पाठ (Rudri Path)",
  "गृह प्रवेश (Griha Pravesh)",
  "नवग्रह शान्ति (Navagraha Puja)",
];

interface Pandit {
  id: string;
  name: string;
  city: string | null;
}

const PujaBookingForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();

  const [ritual, setRitual] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [panditId, setPanditId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pandits, setPandits] = useState<Pandit[]>([]);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const requestedPandit = searchParams.get("pandit");
    supabase
      .from("pandits")
      .select("id, name, city")
      .eq("verified", true)
      .order("rating", { ascending: false })
      .then(({ data }) => {
        const list = data || [];
        setPandits(list);
        if (requestedPandit && list.some((p) => p.id === requestedPandit)) {
          setPanditId(requestedPandit);
        }
      });
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!ritual || !preferredDate || !name.trim() || !phone.trim()) {
      toast({
        title: lang === "ne" ? "विवरण अधुरो छ" : "Missing details",
        description: lang === "ne" ? "कृपया आवश्यक फिल्डहरू भर्नुहोस्।" : "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      ritual_type: ritual,
      preferred_date: preferredDate,
      pandit_id: panditId || null,
      contact_name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || null,
      notes: notes.trim() || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: lang === "ne" ? "🙏 बुकिङ अनुरोध पठाइयो!" : "🙏 Booking Submitted!",
        description:
          lang === "ne"
            ? "हाम्रो टोलीले चाँडै सम्पर्क गरी पक्का गर्नेछ।"
            : "Our team will contact you shortly to confirm.",
      });
      setRitual("");
      setPreferredDate("");
      setPanditId("");
      setName("");
      setPhone("");
      setAddress("");
      setNotes("");
    }
    setSubmitting(false);
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto bg-card rounded-2xl border border-border shadow-card p-8 text-center">
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          {lang === "ne" ? "बुक गर्न साइन इन गर्नुहोस्" : "Sign in to Book"}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {lang === "ne"
            ? "पूजा बुक गर्न र आफ्नो बुकिङ स्थिति हेर्न खाता खोल्नुहोस् वा साइन इन गर्नुहोस्।"
            : "Sign in or create an account to book and manage your ceremonies."}
        </p>
        <Link to="/auth">
          <Button className="rounded-full px-8">
            {lang === "ne" ? "साइन इन / दर्ता" : "Sign In / Sign Up"}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-card rounded-2xl border border-border shadow-card p-6 sm:p-8 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            {lang === "ne" ? "पूजा / संस्कार *" : "Ceremony *"}
          </label>
          <select
            value={ritual}
            onChange={(e) => setRitual(e.target.value)}
            required
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">{lang === "ne" ? "पूजा छान्नुहोस्" : "Select ceremony"}</option>
            {ritualOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            {lang === "ne" ? "अपेक्षित मिति *" : "Preferred Date *"}
          </label>
          <Input
            type="date"
            min={todayStr}
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            {lang === "ne" ? "पूरा नाम *" : "Full Name *"}
          </label>
          <Input
            placeholder={lang === "ne" ? "तपाईंको नाम" : "Your full name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            {lang === "ne" ? "फोन नम्बर *" : "Phone *"}
          </label>
          <Input
            type="tel"
            placeholder="+977 98XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            {lang === "ne" ? "पण्डित छनोट" : "Preferred Pandit"}
          </label>
          <select
            value={panditId}
            onChange={(e) => setPanditId(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
          >
            <option value="">{lang === "ne" ? "स्वतः मिलान (सिफारिस)" : "Auto-match (Recommended)"}</option>
            {pandits.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.city ? `· ${p.city}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">
            {lang === "ne" ? "स्थान / ठेगाना" : "Location / Address"}
          </label>
          <Input
            placeholder={lang === "ne" ? "शहर, टोल" : "City, area"}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">
          {lang === "ne" ? "थप जानकारी (ऐच्छिक)" : "Special Notes (Optional)"}
        </label>
        <Textarea
          placeholder={lang === "ne" ? "कुल परम्परा वा विशेष अनुरोध..." : "Any custom requirements..."}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full rounded-full" size="lg">
        {submitting ? (
          lang === "ne" ? "पठाउँदै..." : "Submitting..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            {lang === "ne" ? "बुकिङ पक्का गर्नुहोस्" : "Confirm Booking"}
          </>
        )}
      </Button>
    </form>
  );
};

export default PujaBookingForm;
