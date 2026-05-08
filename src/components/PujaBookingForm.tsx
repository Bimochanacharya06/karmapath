import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Send, Check, ChevronLeft, ChevronRight, Sparkles, MapPin, User as UserIcon, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const ritualOptions = [
  { value: "Namakaran (नामकरण)", icon: "👶", desc: "Sacred naming ceremony, 11th day after birth" },
  { value: "Bratabandha (ब्रतबन्ध)", icon: "🧵", desc: "Sacred thread / Upanayana initiation" },
  { value: "Vivah (विवाह)", icon: "💍", desc: "Vedic wedding with Saptapadi" },
  { value: "Shraddha (श्राद्ध)", icon: "🪔", desc: "Pitru rituals & Pinda Daan" },
  { value: "Satyanarayan Puja", icon: "🕉️", desc: "Auspicious puja with Katha" },
  { value: "Rudri Path", icon: "🔱", desc: "Lord Shiva chanting & havan" },
  { value: "Griha Pravesh", icon: "🏠", desc: "House-warming Vastu puja" },
  { value: "Navagraha Puja", icon: "✨", desc: "Nine-planet shanti puja" },
];

interface Pandit {
  id: string;
  name: string;
  city: string | null;
  experience_years: number | null;
  rating: number | null;
  specializations: string[] | null;
}

const steps = ["Ritual", "Date & Address", "Pandit", "Review"];

const PujaBookingForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [date, setDate] = useState<Date>();
  const [ritual, setRitual] = useState("");
  const [panditId, setPanditId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pandits, setPandits] = useState<Pandit[]>([]);

  useEffect(() => {
    supabase
      .from("pandits")
      .select("id, name, city, experience_years, rating, specializations")
      .eq("verified", true)
      .order("rating", { ascending: false })
      .then(({ data }) => setPandits(data || []));
  }, []);

  const selectedPandit = pandits.find((p) => p.id === panditId);

  const canNext = () => {
    if (step === 0) return !!ritual;
    if (step === 1) return !!date && !!name && !!phone;
    return true;
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      ritual_type: ritual,
      preferred_date: format(date!, "yyyy-MM-dd"),
      pandit_id: panditId || null,
      contact_name: name,
      phone,
      address: address || null,
      notes: notes || null,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "🙏 Booking Submitted!",
        description: `Your ${ritual} ceremony has been requested for ${format(date!, "PPP")}.`,
      });
      setStep(0);
      setRitual(""); setDate(undefined); setPanditId("");
      setName(""); setPhone(""); setAddress(""); setNotes("");
    }
    setSubmitting(false);
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-2xl border border-border shadow-elevated p-8 md:p-10 text-center">
        <h3 className="font-display text-2xl font-bold text-foreground mb-3">Sign in to Book</h3>
        <p className="text-muted-foreground mb-6">Create an account or sign in to book a puja ceremony and track your bookings.</p>
        <Link to="/auth">
          <Button size="lg" className="px-8">Sign In / Sign Up</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-border shadow-elevated p-6 md:p-10">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all shrink-0",
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                "bg-muted text-muted-foreground"
              )}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("h-1 flex-1 mx-2 rounded-full transition-all",
                  i < step ? "bg-primary" : "bg-muted")} />
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs">
          {steps.map((s, i) => (
            <span key={s} className={cn("font-medium", i === step ? "text-primary" : "text-muted-foreground")}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Step 0: Ritual */}
      {step === 0 && (
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">Choose your ritual</h3>
          <p className="text-sm text-muted-foreground mb-6">Pick the ceremony you want to book.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ritualOptions.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRitual(r.value)}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                  ritual === r.value
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                )}
              >
                <span className="text-2xl">{r.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{r.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
                {ritual === r.value && <Check className="w-4 h-4 text-primary shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Date & Address */}
      {step === 1 && (
        <div className="space-y-5">
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">Date & contact</h3>
          <p className="text-sm text-muted-foreground -mt-2 mb-4">Pick an auspicious date and how we reach you.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name *</label>
              <Input placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone *</label>
              <Input placeholder="+977 98XXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Preferred Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick an auspicious date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">Our Jyotish will confirm the most auspicious Muhurta near this date.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Address</label>
            <Input placeholder="Ceremony location (city, area)" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Special Notes</label>
            <Textarea placeholder="Any specific requirements, family customs, or questions..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
      )}

      {/* Step 2: Pandit */}
      {step === 2 && (
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">Choose your Pandit</h3>
          <p className="text-sm text-muted-foreground mb-6">Pick a verified Pandit, or skip and we'll assign the best match.</p>

          <button
            type="button"
            onClick={() => setPanditId("")}
            className={cn(
              "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all mb-3",
              panditId === ""
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border hover:border-primary/40"
            )}
          >
            <Sparkles className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">Auto-match (Recommended)</p>
              <p className="text-xs text-muted-foreground">We'll assign the best Pandit for your ritual & location.</p>
            </div>
            {panditId === "" && <Check className="w-4 h-4 text-primary" />}
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {pandits.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPanditId(p.id)}
                className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                  panditId === p.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold shrink-0">
                  {p.name.split(" ").pop()?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3" />{p.city}
                    <span>·</span>
                    <span>{p.experience_years}y</span>
                    <span>·</span>
                    <Star className="w-3 h-3 fill-primary text-primary" />{p.rating}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground mb-2">Review & confirm</h3>
          <p className="text-sm text-muted-foreground mb-6">Please verify everything looks right.</p>

          <div className="space-y-3">
            <ReviewRow label="Ritual" value={ritual} />
            <ReviewRow label="Date" value={date ? format(date, "PPP") : "—"} />
            <ReviewRow label="Name" value={name} />
            <ReviewRow label="Phone" value={phone} />
            {address && <ReviewRow label="Address" value={address} />}
            <ReviewRow label="Pandit" value={selectedPandit ? `${selectedPandit.name} · ${selectedPandit.city}` : "Auto-match"} />
            {notes && <ReviewRow label="Notes" value={notes} />}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-foreground">
            🙏 After submitting, our team will contact you within 24 hours to confirm Muhurta, samagri list, and final details.
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div className="flex items-center justify-between mt-8 gap-3">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
          className="gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>

        {step < steps.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="gap-1">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="gap-1">
            {submitting ? "Submitting..." : (<><Send className="w-4 h-4" /> Confirm Booking</>)}
          </Button>
        )}
      </div>
    </div>
  );
};

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground shrink-0">{label}</span>
    <span className="text-sm font-medium text-foreground text-right">{value}</span>
  </div>
);

export default PujaBookingForm;
