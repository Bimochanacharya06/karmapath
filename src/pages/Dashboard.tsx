import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, CheckCircle, XCircle, Plus, LogOut, User, ShoppingBag } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Booking {
  id: string;
  ritual_type: string;
  preferred_date: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  contact_name: string;
  address: string | null;
  notes: string | null;
  created_at: string;
  pandit_id: string | null;
}

const statusSteps: { key: Booking["status"]; ne: string; en: string }[] = [
  { key: "pending", ne: "अनुरोध पठाइयो", en: "Requested" },
  { key: "confirmed", ne: "पण्डित पक्का", en: "Pandit Assigned" },
  { key: "completed", ne: "पूजा सम्पन्न", en: "Completed" },
];

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; phone: string | null } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [{ data: bookingsData }, { data: profileData }] = await Promise.all([
        supabase.from("bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("full_name, phone").eq("user_id", user.id).maybeSingle(),
      ]);
      setBookings((bookingsData as Booking[]) || []);
      setProfile(profileData);
      setLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const inserted = payload.new as Booking;
            setBookings((prev) => (prev.some((b) => b.id === inserted.id) ? prev : [inserted, ...prev]));
          } else if (payload.eventType === "UPDATE") {
            setBookings((prev) =>
              prev.map((b) => (b.id === (payload.new as Booking).id ? (payload.new as Booking) : b)),
            );
          } else if (payload.eventType === "DELETE") {
            setBookings((prev) => prev.filter((b) => b.id !== (payload.old as { id?: string }).id));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleCancelBooking = async (id: string) => {
    if (!user) return;
    setCancellingId(id);
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("user_id", user.id);
    setCancellingId(null);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
    toast({
      title: lang === "ne" ? "बुकिङ रद्द गरियो" : "Booking cancelled",
    });
  };

  if (authLoading || !user) return null;

  const displayName =
    profile?.full_name ||
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
    (lang === "ne" ? "भक्तजन" : "Devotee");

  const stats = [
    { label: lang === "ne" ? "जम्मा बुकिङ" : "Total", value: bookings.length },
    { label: lang === "ne" ? "प्रतीक्षामा" : "Pending", value: bookings.filter((b) => b.status === "pending").length },
    { label: lang === "ne" ? "पक्का भएको" : "Confirmed", value: bookings.filter((b) => b.status === "confirmed").length },
    { label: lang === "ne" ? "सम्पन्न" : "Completed", value: bookings.filter((b) => b.status === "completed").length },
  ];

  const getStepIndex = (status: Booking["status"]) => {
    if (status === "pending") return 0;
    if (status === "confirmed") return 1;
    if (status === "completed") return 2;
    return -1;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-gradient-warm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                🙏 {lang === "ne" ? `नमस्ते, ${displayName}` : `Namaste, ${displayName}`}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {lang === "ne"
                  ? "तपाईंका पूजा प्याकेज र सेवा ट्र्याकिङ"
                  : "Track your ceremony packages and assigned Pandits"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link to="/services">
                <Button size="sm" className="rounded-full">
                  <Plus className="w-4 h-4 mr-1" /> {lang === "ne" ? "नयाँ सेवा बुक" : "Book Package"}
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="outline" size="sm" className="rounded-full">
                  <ShoppingBag className="w-4 h-4 mr-1" /> {lang === "ne" ? "सामग्री किट" : "Samagri Kit"}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="rounded-full" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-1" /> {lang === "ne" ? "साइन आउट" : "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-card rounded-2xl p-4 border border-border">
                <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <h2 className="font-bold text-lg text-foreground mb-4">
            {lang === "ne" ? "मेरा सेवा बुकिङहरू" : "My Ceremony Bookings"}
          </h2>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {lang === "ne" ? "लोड हुँदैछ..." : "Loading..."}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-14 bg-card rounded-2xl border border-border">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-bold text-lg text-foreground mb-1">
                {lang === "ne" ? "अहिलेसम्म कुनै बुकिङ छैन" : "No bookings yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                {lang === "ne"
                  ? "पण्डित र पूजा सामग्री किट एकै क्लिकमा बुक गर्नुहोस्।"
                  : "Book your first all-inclusive puja package in minutes."}
              </p>
              <Link to="/services">
                <Button className="rounded-full">
                  <Plus className="w-4 h-4 mr-1" /> {lang === "ne" ? "प्याकेज छान्नुहोस्" : "Browse Packages"}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const stepIdx = getStepIndex(booking.status);
                return (
                  <div
                    key={booking.id}
                    className="bg-card rounded-2xl p-5 border border-border shadow-card space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-base text-foreground">{booking.ritual_type}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {format(parseISO(booking.preferred_date), "PPP")}
                          </span>
                          {booking.address && <span>📍 {booking.address}</span>}
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" /> {booking.contact_name}
                          </span>
                        </div>
                        {booking.notes && (
                          <p className="text-xs text-secondary font-medium mt-1.5">{booking.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {booking.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-xs h-8"
                            disabled={cancellingId === booking.id}
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            {cancellingId === booking.id
                              ? "..."
                              : lang === "ne"
                                ? "रद्द गर्नुहोस्"
                                : "Cancel"}
                          </Button>
                        )}
                        {booking.status === "cancelled" && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            {lang === "ne" ? "रद्द भएको" : "Cancelled"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Service Progress Stepper */}
                    {booking.status !== "cancelled" && (
                      <div className="pt-3 border-t border-border grid grid-cols-3 gap-2">
                        {statusSteps.map((st, idx) => {
                          const active = idx <= stepIdx;
                          return (
                            <div key={st.key} className="flex items-center gap-2">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  active
                                    ? "bg-secondary text-secondary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {active ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                              </div>
                              <span
                                className={`text-xs font-medium truncate ${
                                  active ? "text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {lang === "ne" ? st.ne : st.en}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
