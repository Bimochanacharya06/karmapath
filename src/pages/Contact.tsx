import { useState } from "react";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contact = () => {
  const { toast } = useToast();
  const { lang } = useLanguage();
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: lang === "ne" ? "सबै विवरण भर्नुहोस्" : "Missing fields",
        description: lang === "ne" ? "कृपया सबै खाली ठाउँहरू भर्नुहोस्।" : "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert(formData);

    if (error) {
      toast({
        title: lang === "ne" ? "त्रुटि भयो" : "Error",
        description: lang === "ne" ? "सन्देश पठाउन सकिएन।" : "Failed to send message.",
        variant: "destructive",
      });
    } else {
      toast({
        title: lang === "ne" ? "🙏 सन्देश पठाइयो!" : "🙏 Message Sent!",
        description: lang === "ne" ? "हामी चाँडै सम्पर्क गर्नेछौं।" : "We'll get back to you within 24 hours.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="pt-28 pb-12 bg-gradient-warm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2">
            {lang === "ne" ? "सम्पर्क" : "Contact"}
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
            {lang === "ne" ? "हामीलाई सम्पर्क गर्नुहोस्" : "Get in Touch"}
          </h1>
          <p className="text-muted-foreground text-base">
            {lang === "ne"
              ? "पूजा वा पण्डित बुकिङ सम्बन्धी कुनै जिज्ञासा भए लेख्नुहोस्।"
              : "Questions about ceremonies or booking a Pandit? Send us a note."}
          </p>
        </div>
      </section>

      <section className="py-14 flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-5 gap-8 items-start">
            <div className="md:col-span-2 bg-card rounded-2xl border border-border p-6 space-y-5">
              {[
                {
                  icon: MapPin,
                  label: lang === "ne" ? "ठेगाना" : "Location",
                  value: lang === "ne" ? "बागबजार, काठमाडौं, नेपाल" : "Bagbazar, Kathmandu, Nepal",
                },
                {
                  icon: Phone,
                  label: lang === "ne" ? "फोन" : "Phone",
                  value: "+977 9869667953",
                },
                {
                  icon: Mail,
                  label: lang === "ne" ? "इमेल" : "Email",
                  value: "namaste@karmapath.com",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSubmit}
              className="md:col-span-3 bg-card rounded-2xl border border-border shadow-card p-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    {lang === "ne" ? "पूरा नाम *" : "Full Name *"}
                  </label>
                  <Input
                    placeholder={lang === "ne" ? "तपाईंको नाम" : "Your name"}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">
                    {lang === "ne" ? "इमेल *" : "Email *"}
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  {lang === "ne" ? "विषय *" : "Subject *"}
                </label>
                <Input
                  placeholder={lang === "ne" ? "पूजा बुकिङ / जिज्ञासा" : "How can we help?"}
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  {lang === "ne" ? "सन्देश *" : "Message *"}
                </label>
                <Textarea
                  placeholder={lang === "ne" ? "आफ्नो सन्देश लेख्नुहोस्..." : "Your message..."}
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={sending} className="w-full rounded-full" size="lg">
                {sending ? (
                  lang === "ne" ? "पठाउँदै..." : "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {lang === "ne" ? "सन्देश पठाउनुहोस्" : "Send Message"}
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
