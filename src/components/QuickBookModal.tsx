import { useState } from "react";
import { format } from "date-fns";
import { Send, Check, Loader2, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { emitAdminBookingAlert, buildWhatsAppAdminUrl, type BookingAlertPayload } from "@/lib/adminNotify";
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
  const [donePayload, setDonePayload] = useState<BookingAlertPayload | null>(null);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const reset = () => {
    setName("");
    setPhone("");
    setPreferredDate("");
    setDonePayload(null);
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

    const payload: BookingAlertPayload = {
      ritual_type: ritual,
      preferred_date: preferredDate,
      contact_name: name.trim(),
      phone: phone.trim(),
    };
    emitAdminBookingAlert(payload);
    setDonePayload(payload);

    toast({
      title: lang === "ne" ? "बुकिङ प्राप्त भयो 🙏" : "Booking received 🙏",
      description: lang === "ne" ? "एडमिनलाई तुरुन्त जानकारी पठाइयो।" : "Admin notified immediately.",
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
            {lang === "ne" ? "तुरुन्त पूजा बुकिङ" : "Quick Ceremony Booking"}
          </DialogTitle>
          <DialogDescription>
            <span className="text-foreground font-semibold">{ritual}</span>
          </DialogDescription>
        </DialogHeader>

        {donePayload ? (
          <div className="py-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground mb-1">
                {lang === "ne" ? "बुकिङ अनुरोध दर्ता भयो!" : "Booking Request Recorded!"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {lang === "ne"
                  ? "एडमिन प्यानलमा सूचना पठाइसकिएको छ। तुरुन्त कुरा गर्न WhatsApp प्रयोग गर्न सक्नुहुन्छ।"
                  : "Our admin dashboard has been alerted. You can also ping us on WhatsApp below."}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={buildWhatsAppAdminUrl(donePayload)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full h-10 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold hover:brightness-110"
              >
                <MessageCircle className="w-4 h-4" />
                {lang === "ne" ? "WhatsApp मा जानकारी पठाउनुहोस्" : "Send on WhatsApp"}
              </a>
              <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full rounded-full">
                {lang === "ne" ? "बन्द गर्नुहोस्" : "Close"}
              </Button>
            </div>
          </div>
        ) : !user ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm mb-4">
              {lang === "ne" ? "बुक गर्न कृपया साइन इन गर्नुहोस्।" : "Please sign in to confirm your booking."}
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center w-full h-10 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all"
            >
              {lang === "ne" ? "साइन इन / दर्ता गर्नुहोस्" : "Sign in to continue"}
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
                {lang === "ne" ? "मिति" : "Preferred date"}
              </label>
              <Input
                type="date"
                min={todayStr}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full rounded-full h-11">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {lang === "ne" ? "पठाउँदै…" : "Sending…"}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {lang === "ne" ? "बुकिङ पठाउनुहोस्" : "Submit Request"}
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
