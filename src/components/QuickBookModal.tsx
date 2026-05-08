import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Send, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface QuickBookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ritual: string;
  ritualSubtitle?: string;
}

const QuickBookModal = ({ open, onOpenChange, ritual, ritualSubtitle }: QuickBookModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<Date>();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setName(""); setPhone(""); setDate(undefined); setDone(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to book a ceremony.", variant: "destructive" });
      return;
    }
    if (!name || !phone || !date) {
      toast({ title: "Missing info", description: "Please fill name, phone and date.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      ritual_type: ritual,
      contact_name: name,
      phone,
      preferred_date: format(date, "yyyy-MM-dd"),
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
      return;
    }
    setDone(true);
    toast({ title: "Booking received 🙏", description: "Our team will contact you to confirm details." });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setTimeout(reset, 250); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Quick Book</DialogTitle>
          <DialogDescription>
            <span className="text-foreground font-medium">{ritual}</span>
            {ritualSubtitle && <span className="text-muted-foreground"> — {ritualSubtitle}</span>}
            <br />Just the essentials — we'll confirm the rest by phone.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-6 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">Request received</h3>
            <p className="text-sm text-muted-foreground mb-4">A KarmaPath coordinator will call you within 24 hours.</p>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full">Close</Button>
          </div>
        ) : !user ? (
          <div className="py-4 text-center">
            <p className="text-muted-foreground text-sm mb-4">Please sign in to send a booking request.</p>
            <Link to="/auth" className="inline-flex items-center justify-center w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all">
              Sign in to continue
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Your name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+977 98XXXXXXXX" type="tel" required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Preferred date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date()} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : <><Send className="w-4 h-4 mr-2" /> Send booking request</>}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Need more options? <Link to="/services#booking" className="text-primary hover:underline">Use full booking form</Link>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QuickBookModal;
