import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Users, Mail, CheckCircle, XCircle, Eye } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [bookings, setBookings] = useState<Tables<"bookings">[]>([]);
  const [messages, setMessages] = useState<Tables<"contact_messages">[]>([]);
  const [pandits, setPandits] = useState<Tables<"pandits">[]>([]);
  const [activeTab, setActiveTab] = useState<"bookings" | "messages" | "pandits">("bookings");

  const fetchData = useCallback(async () => {
    const [{ data: b }, { data: m }, { data: p }] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("pandits").select("*").order("created_at", { ascending: false }),
    ]);
    setBookings(b || []);
    setMessages(m || []);
    setPandits(p || []);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) {
      supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => {
        if (data && data.length > 0) {
          setIsAdmin(true);
          fetchData();
        } else {
          navigate("/dashboard");
        }
        setChecking(false);
      });
    }
  }, [user, authLoading, navigate, fetchData]);

  const updateBookingStatus = async (id: string, status: "pending" | "confirmed" | "completed" | "cancelled") => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const markMessageRead = async (id: string) => {
    const { error } = await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
  };

  if (authLoading || checking || !isAdmin) return null;

  const tabs = [
    { key: "bookings" as const, label: "Bookings", icon: Calendar, count: bookings.length },
    { key: "messages" as const, label: "Messages", icon: Mail, count: messages.filter((m) => !m.is_read).length },
    { key: "pandits" as const, label: "Pandits", icon: Users, count: pandits.length },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-8 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            🔧 Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage bookings, messages, and pandits</p>
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-warm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Bookings */}
          {activeTab === "bookings" && (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="bg-card rounded-xl p-5 border border-border">
                  <div className="flex flex-col md:flex-row justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground">{b.ritual_type}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {b.contact_name} · {format(parseISO(b.preferred_date), "PPP")}
                        {b.phone && ` · ${b.phone}`}
                      </p>
                      {b.address && <p className="text-sm text-muted-foreground">📍 {b.address}</p>}
                      {b.notes && <p className="text-sm text-muted-foreground italic mt-1">"{b.notes}"</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {b.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => updateBookingStatus(b.id, "confirmed")}>
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirm
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateBookingStatus(b.id, "cancelled")}>
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                          </Button>
                        </>
                      )}
                      {b.status === "confirmed" && (
                        <Button size="sm" onClick={() => updateBookingStatus(b.id, "completed")}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Complete
                        </Button>
                      )}
                      <Badge variant={b.status === "pending" ? "secondary" : b.status === "confirmed" ? "default" : "outline"}>
                        {b.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && <p className="text-center text-muted-foreground py-12">No bookings yet</p>}
            </div>
          )}

          {/* Messages */}
          {activeTab === "messages" && (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`bg-card rounded-xl p-5 border ${m.is_read ? "border-border" : "border-primary/30 bg-primary/5"}`}>
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-display font-semibold text-foreground">{m.subject}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{m.name} · {m.email}</p>
                      <p className="text-sm text-foreground mt-2">{m.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{format(new Date(m.created_at), "PPP p")}</p>
                    </div>
                    {!m.is_read && (
                      <Button size="sm" variant="outline" onClick={() => markMessageRead(m.id)}>
                        <Eye className="w-3.5 h-3.5 mr-1" /> Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-muted-foreground py-12">No messages</p>}
            </div>
          )}

          {/* Pandits */}
          {activeTab === "pandits" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pandits.map((p) => (
                <div key={p.id} className="bg-card rounded-xl p-5 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-lg">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-foreground">{p.name}</h3>
                      <p className="text-sm text-primary">{p.city} · {p.experience_years} yrs exp</p>
                      <p className="text-sm text-muted-foreground mt-1">{p.bio?.substring(0, 100)}...</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {p.specializations?.slice(0, 3).map((s: string) => (
                          <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <span>⭐ {p.rating}</span>
                        <span className="text-muted-foreground">{p.total_ceremonies} ceremonies</span>
                        <Badge variant={p.verified ? "default" : "secondary"}>{p.verified ? "Verified" : "Pending"}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Admin;
