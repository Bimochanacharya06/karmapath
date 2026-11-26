import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle, XCircle, Plus, LogOut, User } from "lucide-react";
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
  created_at: string;
  pandit_id: string | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-3.5 h-3.5" />,
  confirmed: <CheckCircle className="w-3.5 h-3.5" />,
  completed: <CheckCircle className="w-3.5 h-3.5" />,
  cancelled: <XCircle className="w-3.5 h-3.5" />,
};

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

    // Real-time subscription
    const channel = supabase
      .channel("bookings-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === "INSERT") {
          const inserted = payload.new as Booking;
          setBookings((prev) => (prev.some((b) => b.id === inserted.id) ? prev : [inserted, ...prev]));
        } else if (payload.eventType === "UPDATE") {
          setBookings((prev) => prev.map((b) => (b.id === (payload.new as Booking).id ? (payload.new as Booking) : b)));
        } else if (payload.eventType === "DELETE") {
          setBookings((prev) => prev.filter((b) => b.id !== (payload.old as { id?: string }).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
      toast({ title: "Could not cancel booking", description: error.message, variant: "destructive" });
      return;
    }

    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
    toast({ title: "Booking cancelled", description: "Your ceremony request has been cancelled." });
  };

  if (authLoading || !user) return null;

  const displayName =
    profile?.full_name ||
    (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") ||
    "Devotee";

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-8 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                🙏 {lang === "ne" ? `नमस्ते, ${displayName}` : `Namaste, ${displayName}`}
              </h1>
              <p className="text-muted-foreground mt-1">
                {lang === "ne" ? "तपाईंका पूजा बुकिङहरूको विवरण" : "Manage your ceremony bookings"}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/services#booking">
                <Button size="sm" className="rounded-full">
                  <Plus className="w-4 h-4 mr-1" /> {lang === "ne" ? "नयाँ बुकिङ" : "New Booking"}
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="rounded-full" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-1" /> {lang === "ne" ? "साइन आउट" : "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Bookings", value: stats.total, color: "text-foreground" },
              { label: "Pending", value: stats.pending, color: "text-yellow-600" },
              { label: "Confirmed", value: stats.confirmed, color: "text-green-600" },
              { label: "Completed", value: stats.completed, color: "text-blue-600" },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl p-5 border border-border text-center">
                <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bookings List */}
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Your Bookings</h2>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">Book your first puja ceremony to get started</p>
              <Link to="/services#booking">
                <Button><Plus className="w-4 h-4 mr-1" /> Book a Puja</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl p-5 border border-border hover:shadow-card transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-semibold text-foreground">{booking.ritual_type}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(parseISO(booking.preferred_date), "PPP")}
                        </span>
                        {booking.address && (
                          <span className="flex items-center gap-1">📍 {booking.address}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {booking.contact_name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={cancellingId === booking.id}
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                        </Button>
                      )}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status]}`}>
                        {statusIcons[booking.status]}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
