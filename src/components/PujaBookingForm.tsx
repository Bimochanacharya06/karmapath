import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Send, Check, ShieldCheck, PackageCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { SERVICE_PACKAGES, NEPAL_CITIES, type ServicePackageTier } from "@/data/serviceCatalog";
import { supabase } from "@/integrations/supabase/client";
import { emitAdminBookingAlert, buildWhatsAppAdminUrl, type BookingAlertPayload } from "@/lib/adminNotify";
import { Link, useSearchParams } from "react-router-dom";

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

  const [selectedPkgId, setSelectedPkgId] = useState(
    () => searchParams.get("service") || SERVICE_PACKAGES[0].id,
  );
  const [tier, setTier] = useState<ServicePackageTier>(() =>
    searchParams.get("tier") === "pandit" ? "pandit" : "full",
  );
  const [city, setCity] = useState(() => searchParams.get("city") || "Kathmandu");
  const [preferredDate, setPreferredDate] = useState("");
  const [panditId, setPanditId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState<BookingAlertPayload | null>(null);
  const [pandits, setPandits] = useState<Pandit[]>([]);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    const paramService = searchParams.get("service");
    const paramCity = searchParams.get("city");
    const paramTier = searchParams.get("tier");
    if (paramService && SERVICE_PACKAGES.some((p) => p.id === paramService)) {
      setSelectedPkgId(paramService);
    }
    if (paramCity) setCity(paramCity);
    if (paramTier === "full" || paramTier === "pandit") setTier(paramTier);
  }, [searchParams]);

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

  const activePkg = SERVICE_PACKAGES.find((p) => p.id === selectedPkgId) || SERVICE_PACKAGES[0];
  const includes =
    tier === "full"
      ? lang === "ne"
        ? activePkg.includesFullNe
        : activePkg.includesFullEn
      : lang === "ne"
        ? activePkg.includesPanditNe
        : activePkg.includesPanditEn;
  const selectedPandit = pandits.find((p) => p.id === panditId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!preferredDate || !name.trim() || !phone.trim()) {
      toast({
        title: lang === "ne" ? "विवरण अधुरो छ" : "Missing details",
        description: lang === "ne" ? "कृपया नाम, फोन र मिति भर्नुहोस्।" : "Please fill name, phone, and date.",
        variant: "destructive",
      });
      return;
    }

    const tierLabel = tier === "full" ? "Pandit + Samagri Setup" : "Pandit Only";
    const fullAddress = [address.trim(), city].filter(Boolean).join(", ");
    const combinedNotes = [tierLabel, notes.trim()].filter(Boolean).join(" | ");

    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      ritual_type: activePkg.bookingValue,
      preferred_date: preferredDate,
      pandit_id: panditId || null,
      contact_name: name.trim(),
      phone: phone.trim(),
      address: fullAddress || null,
      notes: combinedNotes,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const alertPayload: BookingAlertPayload = {
        ritual_type: activePkg.bookingValue,
        preferred_date: preferredDate,
        contact_name: name.trim(),
        phone: phone.trim(),
        address: fullAddress || null,
      };
      emitAdminBookingAlert(alertPayload);
      setLastSubmitted(alertPayload);

      toast({
        title: lang === "ne" ? "🙏 बुकिङ अनुरोध पठाइयो!" : "🙏 Booking Request Sent!",
        description:
          lang === "ne"
            ? "एडमिन ड्यासबोर्डमा तुरुन्त सूचना पुगेको छ।"
            : "Our admin team has been notified immediately.",
      });
      setPreferredDate("");
      setAddress("");
      setNotes("");
    }
    setSubmitting(false);
  };

  if (!user) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-card p-8 text-center max-w-xl mx-auto">
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          {lang === "ne" ? "बुकिङ गर्न साइन इन गर्नुहोस्" : "Sign in to Book"}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {lang === "ne"
            ? "पूजा बुक गर्न र स्थिति ट्र्याक गर्न खातामा लगइन गर्नुहोस्।"
            : "Sign in to request your ceremony and track confirmation."}
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-7 bg-card rounded-2xl border border-border shadow-card p-6 space-y-4"
      >
        {lastSubmitted && (
          <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-foreground">
              <p className="font-bold text-secondary">
                {lang === "ne" ? "✓ एडमिनलाई सूचना पठाइसकियो!" : "✓ Admin team notified!"}
              </p>
              <p className="text-muted-foreground mt-0.5">
                {lang === "ne"
                  ? "चाहनुहुन्छ भने WhatsApp बाट पनि तुरुन्त जानकारी पठाउन सक्नुहुन्छ।"
                  : "You can also message our coordinator directly on WhatsApp."}
              </p>
            </div>
            <a
              href={buildWhatsAppAdminUrl(lastSubmitted)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold shrink-0 hover:brightness-110"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-muted">
          <button
            type="button"
            onClick={() => setTier("full")}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              tier === "full" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            {lang === "ne" ? "सम्पूर्ण व्यवस्था (पण्डित + सामग्री)" : "Pandit + Samagri Setup"}
          </button>
          <button
            type="button"
            onClick={() => setTier("pandit")}
            className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
              tier === "pandit" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            {lang === "ne" ? "पण्डित मात्र" : "Pandit Only"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {lang === "ne" ? "पूजा छनोट *" : "Ceremony *"}
            </label>
            <select
              value={selectedPkgId}
              onChange={(e) => setSelectedPkgId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              {SERVICE_PACKAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  {lang === "ne" ? p.titleNe : p.titleEn}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {lang === "ne" ? "मिति *" : "Preferred Date *"}
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
              {lang === "ne" ? "शहर *" : "City *"}
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            >
              {NEPAL_CITIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {lang === "ne" ? c.ne : c.en}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {lang === "ne" ? "पण्डित छनोट" : "Pandit Preference"}
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {lang === "ne" ? "टोल / घर ठेगाना" : "Street / Area"}
            </label>
            <Input
              placeholder={lang === "ne" ? "बानेश्वर, वडा १०..." : "Area / street"}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              {lang === "ne" ? "विशेष टिपोट" : "Notes"}
            </label>
            <Textarea
              placeholder={lang === "ne" ? "बिहानको साइत / गोत्र..." : "Morning slot / custom note..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={1}
              className="min-h-[40px]"
            />
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full rounded-xl h-11 text-sm font-semibold">
          {submitting ? (
            lang === "ne" ? "पठाउँदै..." : "Sending..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {lang === "ne" ? "बुकिङ अनुरोध पठाउनुहोस्" : "Submit Booking Request"}
            </>
          )}
        </Button>
      </form>

      {/* Sticky Scope Summary Card (No Price Clutter) */}
      <div className="lg:col-span-5 bg-card rounded-2xl border border-border shadow-card p-6 lg:sticky lg:top-24">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground">
              {lang === "ne" ? "छनोट गरिएको सेवा" : "Selected Ceremony"}
            </p>
            <h3 className="font-display text-xl font-bold text-foreground">
              {lang === "ne" ? activePkg.titleNe : activePkg.titleEn}
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">
            <PackageCheck className="w-3.5 h-3.5" />
            {tier === "full"
              ? lang === "ne"
                ? "पूर्ण व्यवस्था"
                : "Full Setup"
              : lang === "ne"
                ? "पण्डित मात्र"
                : "Pandit Only"}
          </span>
        </div>

        <ul className="space-y-2 mb-5">
          {includes.map((inc) => (
            <li key={inc} className="flex items-center gap-2 text-xs text-foreground">
              <Check className="w-4 h-4 text-secondary shrink-0" />
              <span>{inc}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-2 text-xs text-muted-foreground py-4 border-t border-border">
          <div className="flex justify-between">
            <span>{lang === "ne" ? "समयावधि" : "Duration"}</span>
            <span className="font-medium text-foreground">
              {lang === "ne" ? activePkg.durationNe : activePkg.durationEn}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{lang === "ne" ? "शहर" : "City"}</span>
            <span className="font-medium text-foreground">{city}</span>
          </div>
          <div className="flex justify-between">
            <span>{lang === "ne" ? "पण्डित" : "Pandit"}</span>
            <span className="font-medium text-foreground">
              {selectedPandit ? selectedPandit.name : lang === "ne" ? "स्वतः मिलान" : "Auto-match"}
            </span>
          </div>
        </div>

        <p className="pt-3 border-t border-border flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <span>
            {lang === "ne"
              ? "बुकिङ पठाउनासाथ एडमिन टोलीलाई तुरुन्त सूचना जान्छ र फोनमार्फत साइत तथा दक्षिणा परामर्श गरिन्छ।"
              : "Submitting notifies our admin coordinator immediately to confirm your auspicious timing and details by phone."}
          </span>
        </p>
      </div>
    </div>
  );
};

export default PujaBookingForm;
