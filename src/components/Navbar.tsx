import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, Sparkles, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { subscribeToAdminAlerts } from "@/lib/adminNotify";
import LanguageToggle from "@/components/LanguageToggle";
import logo from "@/assets/karmapath-logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t, lang } = useLanguage();

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.services"), href: "/services" },
    { label: t("nav.marketplace"), href: "/marketplace" },
    { label: t("nav.resources"), href: "/resources" },
    { label: t("nav.blog"), href: "/blog" },
    { label: t("nav.contact"), href: "/contact" },
  ];

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const refreshAdminCounts = useCallback(async () => {
    const [{ data: bookings }, { data: messages }] = await Promise.all([
      supabase.from("bookings").select("id").eq("status", "pending"),
      supabase.from("contact_messages").select("id").eq("is_read", false),
    ]);
    setPendingCount((bookings?.length || 0) + (messages?.length || 0));
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setPendingCount(0);
      return;
    }

    let active = true;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .then(({ data }) => {
        if (!active) return;
        const admin = Boolean(data && data.length > 0);
        setIsAdmin(admin);
        if (admin) {
          void refreshAdminCounts();
        }
      });

    return () => {
      active = false;
    };
  }, [user, refreshAdminCounts]);

  useEffect(() => {
    if (!isAdmin) return;

    const unsubLocal = subscribeToAdminAlerts(() => {
      void refreshAdminCounts();
    });

    const channel = supabase
      .channel("navbar-admin-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        void refreshAdminCounts();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_messages" }, () => {
        void refreshAdminCounts();
      })
      .subscribe();

    return () => {
      unsubLocal();
      supabase.removeChannel(channel);
    };
  }, [isAdmin, refreshAdminCounts, location.pathname]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src={logo} alt="KarmaPath" className="w-8 h-8" />
            <span className="font-display text-xl font-bold text-foreground tracking-tight">
              Karma<span className="text-primary">Path</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <LanguageToggle compact />

            {isAdmin && (
              <Link
                to="/admin"
                className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-all ${
                  location.pathname === "/admin"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/60 text-foreground hover:border-primary/40"
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-primary" />
                <span>{lang === "ne" ? "एडमिन" : "Admin"}</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )}

            <Link
              to="/services#booking"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:brightness-110 transition-all shadow-warm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {lang === "ne" ? "पूजा बुक" : "Book Puja"}
            </Link>

            {user ? (
              <div className="flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border bg-card text-foreground text-xs sm:text-sm font-semibold hover:border-primary/40 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-primary" /> {t("nav.dashboard")}
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                  title={t("nav.signout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-card text-foreground text-xs sm:text-sm font-semibold hover:border-primary/40 hover:text-primary transition-all"
              >
                <User className="w-3.5 h-3.5" /> {t("nav.signin")}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageToggle compact />
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="p-2 text-foreground"
              aria-label="Toggle navigation menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-card border-b border-border">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className={`block text-sm font-medium ${
                  location.pathname === link.href ? "text-primary font-semibold" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold"
                >
                  <span className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4" /> {lang === "ne" ? "एडमिन प्यानल" : "Admin Panel"}
                  </span>
                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              )}
              <Link
                to="/services#booking"
                onClick={() => setOpen(false)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
              >
                {lang === "ne" ? "पूजा बुक गर्नुहोस्" : "Book Puja"}
              </Link>
              {user ? (
                <div className="flex items-center justify-between pt-1">
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm font-semibold text-primary">
                    {t("nav.dashboard")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      setOpen(false);
                    }}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {t("nav.signout")}
                  </button>
                </div>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)} className="text-center py-2 text-sm font-semibold text-foreground">
                  {t("nav.signinFull")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
