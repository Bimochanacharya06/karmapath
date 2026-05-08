import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send, Clock, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contact = () => {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    setSending(true);
    const { error } = await supabase.from("contact_messages").insert(formData);

    if (error) {
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "🙏 Message Sent!", description: "We'll get back to you within 24 hours." });
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-24 pb-16 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-primary font-display text-sm tracking-widest uppercase mb-2">
            सम्पर्क
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
            Get in <span className="text-gradient-saffron">Touch</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have questions about rituals, need a Pandit, or want to collaborate? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">Contact Information</h2>
                <div className="space-y-6">
                  {[
                    { icon: MapPin, label: "Address", value: "Bagbazar, Kathmandu, Nepal" },
                    { icon: Phone, label: "Phone", value: "+977 01-4XXXXXX" },
                    { icon: Mail, label: "Email", value: "namaste@karmapath.com" },
                    { icon: Clock, label: "Hours", value: "Sun-Fri: 6:00 AM - 8:00 PM" },
                    { icon: MessageSquare, label: "Response Time", value: "Within 24 hours" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="font-medium text-foreground">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-xl bg-card border border-border">
                <p className="font-display text-lg font-semibold text-foreground mb-2">🙏 ॐ सर्वे भवन्तु सुखिनः</p>
                <p className="text-sm text-muted-foreground italic">"May all beings be happy, may all beings be free from illness, may all see goodness, may none suffer."</p>
              </div>

              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="font-display font-semibold text-foreground mb-2">🕉️ Emergency Puja Services</h3>
                <p className="text-sm text-muted-foreground">For urgent ceremonies (Shraddha, last rites), call our 24/7 helpline for immediate Pandit assistance.</p>
              </div>
            </div>

            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border shadow-elevated p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name *</label>
                    <Input placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email *</label>
                    <Input type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Subject *</label>
                  <Input placeholder="How can we help?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Message *</label>
                  <Textarea placeholder="Your message..." rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
                </div>
                <Button type="submit" disabled={sending} className="w-full py-6" size="lg">
                  {sending ? "Sending..." : (<><Send className="w-4 h-4 mr-2" /> Send Message</>)}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
