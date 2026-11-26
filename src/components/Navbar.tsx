import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown, Sparkles, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import logo from "@/assets/karmapath-logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.services"), href: "/services" },
    {
      label: t("nav.explore"),
      href: "#",
      children: [
        { label: t("nav.marketplace"), href: "/marketplace", icon: ShoppingBag, desc: t("nav.marketplaceDesc") },
        { label: t("nav.askPandit"), href: "/ask-pandit", icon: Sparkles, desc: t("nav.askPanditDesc") },
      ],
    },
    { label: t("nav.blog"), href: "/blog" },
    { label: t("nav.resources"), href: "/resources" },
    { label: t("nav.contact"), href: "/contact" },
  ];

  useEffect(() => {
    setOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="KarmaPath" className="w-9 h-9" />
            <span className="font-display text-xl font-bold text-foreground">
              Karma<span className="text-primary">Path</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                      dropdownOpen || link.children.some((c) => c.href === location.pathname)
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {link.label} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-card rounded-xl border border-border shadow-elevated p-2 z-50">
                      {link.children.map((child) => (
                        <Link key={child.href} to={child.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <child.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{child.label}</p>
                            <p className="text-xs text-muted-foreground">{child.desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={link.href} to={link.href}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
            <LanguageToggle compact />
            {user ? (
              <div className="flex items-center gap-3 ml-2">
                <Link to="/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> {t("nav.dashboard")}
                </Link>
                <button onClick={signOut} className="p-2 text-muted-foreground hover:text-primary transition-colors" title={t("nav.signout")}>
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all shadow-warm"
              >
                <User className="w-3.5 h-3.5" /> {t("nav.signin")}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageToggle compact />
            <button onClick={() => setOpen(!open)} className="p-2 text-foreground">
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-background border-b border-border">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{link.label}</p>
                  {link.children.map((child) => (
                    <Link key={child.href} to={child.href} onClick={() => setOpen(false)}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary pl-2 py-1"
                    >
                      <child.icon className="w-4 h-4" /> {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link key={link.href} to={link.href} onClick={() => setOpen(false)}
                  className={`block text-sm font-medium transition-colors ${
                    location.pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-sm font-medium text-primary">{t("nav.dashboard")}</Link>
                <button onClick={() => { signOut(); setOpen(false); }} className="block text-sm font-medium text-muted-foreground hover:text-primary">{t("nav.signout")}</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="block text-sm font-semibold text-primary">{t("nav.signinFull")}</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
