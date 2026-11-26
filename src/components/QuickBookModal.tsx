import { useState } from "react";
import { format } from "date-fns";
import { Send, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface QuickBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ritual: string;
}

const QuickBookModal = ({ open, onOpenChange, ritual }: QuickBookModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const reset = () => {
    setName("");
    setPhone("");
    setPreferredDate("");
    setDone(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim() || !phone.trim() || !preferredDate) {
      toast({
        title: lang === "ne" ? "विवरण भर्नुहोस्" : "Missing info",
        description: lang === "ne" ? "नाम, फोन र मिति आवश्यक छ।" : "Please fill name, phone and date.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      ritual_type: ritual,
      contact_name: name.trim(),
      phone: phone.trim(),
      preferred_date: preferredDate,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    toast({
      title: lang === "ne" ? "बुकिङ प्राप्त भयो 🙏" : "Booking received 🙏",
      description: lang === "ne" ? "हामी चाँडै सम्पर्क गर्नेछौं।" : "Our team will call you to confirm.",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setTimeout(reset, 250);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {lang === "ne" ? "तुरुन्त बुकिङ" : "Quick Book"}
          </DialogTitle>
          <DialogDescription>
            <span className="text-foreground font-medium">{ritual}</span>
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground mb-1">
              {lang === "ne" ? "अनुरोध पठाइयो" : "Request received"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {lang === "ne" ? "हामी २४ घण्टाभित्र फोनमार्फत पक्का गर्नेछौं।" : "We will call within 24 hours."}
            </p>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full rounded-full">
              {lang === "ne" ? "बन्द गर्नुहोस्" : "Close"}
            </Button>
          </div>
        ) : !user ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm mb-4">
              {lang === "ne" ? "बुक गर्न कृपया साइन इन गर्नुहोस्।" : "Please sign in to send a booking request."}
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center w-full h-10 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all"
            >
              {lang === "ne" ? "साइन इन गर्नुहोस्" : "Sign in to continue"}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                {lang === "ne" ? "पूरा नाम" : "Your name"}
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === "ne" ? "तपाईंको नाम" : "Full name"}
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                {lang === "ne" ? "फोन नम्बर" : "Phone"}
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+977 98XXXXXXXX"
                type="tel"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                {lang === "ne" ? "अपेक्षित मिति" : "Preferred date"}
              </label>
              <Input
                type="date"
                min={todayStr}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full rounded-full">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {lang === "ne" ? "पठाउँदै…" : "Sending…"}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {lang === "ne" ? "बुकिङ पठाउनुहोस्" : "Send request"}
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickBookModal;
