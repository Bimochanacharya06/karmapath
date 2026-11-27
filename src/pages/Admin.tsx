import { useCallback, useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Mail,
  BookOpen,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Bell,
  BellRing,
  Phone,
  MessageCircle,
  ShieldAlert,
  ShieldCheck,
  Lock,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  KeyRound,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { hashSecret } from "@/integrations/supabase/localFallback";
import { BLOG_COVER_PRESETS, resolveBlogCover } from "@/data/blogCatalog";
import {
  isDesktopNotifyEnabled,
  requestDesktopNotifyPermission,
  subscribeToAdminAlerts,
} from "@/lib/adminNotify";
import type { Tables } from "@/integrations/supabase/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ADMIN_SESSION_KEY = "karmapath_admin_gate_v1";
const ADMIN_LOCKOUT_KEY = "karmapath_admin_lockout_v1";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds
const EXPECTED_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || "Karma@2083";

const cleanPhoneDigits = (raw?: string | null) => (raw || "").replace(/\D/g, "");

interface PanditFormState {
  name: string;
  city: string;
  phone: string;
  experience_years: string;
  rating: string;
  total_ceremonies: string;
  specializationsText: string;
  photo_url: string;
  bio: string;
  verified: boolean;
}

const emptyPanditForm: PanditFormState = {
  name: "",
  city: "Kathmandu",
  phone: "",
  experience_years: "15",
  rating: "4.9",
  total_ceremonies: "500",
  specializationsText: "Vivah, Bratabandha, Satyanarayan Puja, Griha Pravesh",
  photo_url: "",
  bio: "",
  verified: true,
};

interface BlogFormState {
  title_ne: string;
  title_en: string;
  category_ne: string;
  category_en: string;
  author: string;
  read_time: string;
  coverChoice: string;
  customImageUrl: string;
  excerpt_ne: string;
  excerpt_en: string;
  content_ne: string;
  content_en: string;
  published: boolean;
}

const emptyBlogForm: BlogFormState = {
  title_ne: "",
  title_en: "",
  category_ne: "वैदिक ज्ञान",
  category_en: "Vedic Wisdom",
  author: "Pt. Ram Prasad Sharma",
  read_time: "5 min",
  coverChoice: "preset:vishwaroop",
  customImageUrl: "",
  excerpt_ne: "",
  excerpt_en: "",
  content_ne: "",
  content_en: "",
  published: true,
};

const readUnlockedSession = (userId?: string | null): boolean => {
  if (!userId || typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { userId?: string; expiresAt?: number };
    if (parsed.userId === userId && typeof parsed.expiresAt === "number" && Date.now() < parsed.expiresAt) {
      return true;
    }
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    return false;
  } catch {
    return false;
  }
};

const grantUnlockedSession = (userId: string) => {
  sessionStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({ userId, expiresAt: Date.now() + SESSION_TTL_MS }),
  );
};

const readLockoutState = (): { count: number; lockedUntil: number } => {
  try {
    const raw = sessionStorage.getItem(ADMIN_LOCKOUT_KEY);
    if (!raw) return { count: 0, lockedUntil: 0 };
    const parsed = JSON.parse(raw) as { count?: number; lockedUntil?: number };
    return { count: parsed.count || 0, lockedUntil: parsed.lockedUntil || 0 };
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
};

const recordFailedAttempt = (): number => {
  const current = readLockoutState();
  const nextCount = current.count + 1;
  const lockedUntil = nextCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : 0;
  sessionStorage.setItem(
    ADMIN_LOCKOUT_KEY,
    JSON.stringify({ count: nextCount >= MAX_FAILED_ATTEMPTS ? 0 : nextCount, lockedUntil }),
  );
  return lockedUntil;
};

const clearFailedAttempts = () => {
  sessionStorage.removeItem(ADMIN_LOCKOUT_KEY);
};

const verifyAdminPasscode = async (candidate: string): Promise<boolean> => {
  const [a, b] = await Promise.all([
    hashSecret(candidate.trim()),
    hashSecret(EXPECTED_PASSCODE),
  ]);
  return a === b;
};

const Admin = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { lang } = useLanguage();
  const { toast } = useToast();

  // Security & Auth State
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const [sessionUnlocked, setSessionUnlocked] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [showSecrets, setShowSecrets] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Dashboard Data State
  const [desktopAlerts, setDesktopAlerts] = useState(() => isDesktopNotifyEnabled());
  const [bookings, setBookings] = useState<Tables<"bookings">[]>([]);
  const [messages, setMessages] = useState<Tables<"contact_messages">[]>([]);
  const [pandits, setPandits] = useState<Tables<"pandits">[]>([]);
  const [blogPosts, setBlogPosts] = useState<Tables<"blog_posts">[]>([]);
  const [activeTab, setActiveTab] = useState<"bookings" | "pandits" | "blogs" | "messages">("bookings");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "confirmed" | "completed">("all");

  // Pandit CRUD Modal State
  const [panditDialogOpen, setPanditDialogOpen] = useState(false);
  const [editingPanditId, setEditingPanditId] = useState<string | null>(null);
  const [panditForm, setPanditForm] = useState<PanditFormState>(emptyPanditForm);
  const [savingPandit, setSavingPandit] = useState(false);

  // Blog Post CRUD Modal State
  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState<BlogFormState>(emptyBlogForm);
  const [savingBlog, setSavingBlog] = useState(false);

  const fetchData = useCallback(async () => {
    const [{ data: b }, { data: m }, { data: p }, { data: posts }] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      supabase.from("pandits").select("*").order("created_at", { ascending: false }),
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
    ]);
    setBookings(b || []);
    setMessages(m || []);
    setPandits(p || []);
    setBlogPosts(posts || []);
  }, []);

  // Verify user_roles whenever auth user changes
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setSessionUnlocked(false);
      setCheckingRole(false);
      return;
    }

    let active = true;
    setCheckingRole(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .then(({ data }) => {
        if (!active) return;
        const hasAdminRole = Boolean(data && data.length > 0);
        setIsAdmin(hasAdminRole);
        const unlocked = hasAdminRole && readUnlockedSession(user.id);
        setSessionUnlocked(unlocked);
        if (unlocked) {
          void fetchData();
        }
        setCheckingRole(false);
      });

    return () => {
      active = false;
    };
  }, [user, authLoading, fetchData]);

  // Real-time booking & message notifications when unlocked
  useEffect(() => {
    if (!isAdmin || !sessionUnlocked) return;

    const unsubLocal = subscribeToAdminAlerts((payload) => {
      void fetchData();
      if (payload) {
        toast({
          title: lang === "ne" ? "🔔 नयाँ पूजा बुकिङ प्राप्त भयो!" : "🔔 New Ceremony Booking!",
          description: `${payload.contact_name} — ${payload.ritual_type} (${payload.preferred_date})`,
        });
      }
    });

    const channel = supabase
      .channel("admin-live-bookings")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (payload) => {
        const b = payload.new as Tables<"bookings">;
        setBookings((prev) => (prev.some((x) => x.id === b.id) ? prev : [b, ...prev]));
        toast({
          title: lang === "ne" ? "🔔 नयाँ पूजा बुकिङ प्राप्त भयो!" : "🔔 New Ceremony Booking!",
          description: `${b.contact_name} — ${b.ritual_type}`,
        });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings" }, (payload) => {
        const b = payload.new as Tables<"bookings">;
        setBookings((prev) => prev.map((x) => (x.id === b.id ? b : x)));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contact_messages" }, (payload) => {
        const m = payload.new as Tables<"contact_messages">;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [m, ...prev]));
        toast({
          title: lang === "ne" ? "📩 नयाँ सन्देश प्राप्त भयो!" : "📩 New Contact Message!",
          description: `${m.name}: ${m.subject}`,
        });
      })
      .subscribe();

    return () => {
      unsubLocal();
      supabase.removeChannel(channel);
    };
  }, [isAdmin, sessionUnlocked, fetchData, toast, lang]);

  // --- Security Gate Handlers ---
  const handleAdminFullLogin = async (e: FormEvent) => {
    e.preventDefault();
    const { lockedUntil } = readLockoutState();
    if (lockedUntil > Date.now()) {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
      toast({
        title: lang === "ne" ? "अस्थायी रूपमा लक गरियो" : "Too many failed attempts",
        description:
          lang === "ne"
            ? `कृपया ${secs} सेकेन्डपछि पुनः प्रयास गर्नुहोस्।`
            : `Please wait ${secs} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }

    setAuthSubmitting(true);
    try {
      const passcodeOk = await verifyAdminPasscode(passcode);
      if (!passcodeOk) {
        recordFailedAttempt();
        toast({
          title: lang === "ne" ? "अमान्य एडमिन सुरक्षा कोड" : "Invalid Security Passcode",
          description:
            lang === "ne"
              ? "कृपया सही एडमिन सुरक्षा कोड प्रविष्ट गर्नुहोस्।"
              : "Please enter the valid Admin Security Passcode.",
          variant: "destructive",
        });
        return;
      }

      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });

      if (signInErr || !signInData.user) {
        recordFailedAttempt();
        toast({
          title: lang === "ne" ? "प्रमाणीकरण असफल" : "Authentication Failed",
          description: signInErr?.message || "Invalid admin credentials.",
          variant: "destructive",
        });
        return;
      }

      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", signInData.user.id)
        .eq("role", "admin");

      if (!roleRows || roleRows.length === 0) {
        recordFailedAttempt();
        await signOut();
        toast({
          title: lang === "ne" ? "एडमिन अनुमति अस्वीकृत" : "Access Denied",
          description:
            lang === "ne"
              ? "यो खातालाई एडमिन प्यानल खोल्ने अधिकार छैन।"
              : "This account is not authorized for Administrator access.",
          variant: "destructive",
        });
        return;
      }

      clearFailedAttempts();
      grantUnlockedSession(signInData.user.id);
      setIsAdmin(true);
      setSessionUnlocked(true);
      setPasscode("");
      setLoginPassword("");
      await fetchData();
      toast({
        title: lang === "ne" ? "एडमिन प्यानल अनलक भयो" : "Admin Portal Unlocked",
      });
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handlePasscodeUnlockOnly = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { lockedUntil } = readLockoutState();
    if (lockedUntil > Date.now()) {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
      toast({
        title: lang === "ne" ? "अस्थायी रूपमा लक गरियो" : "Temporarily Locked",
        description: `Please wait ${secs}s before retrying.`,
        variant: "destructive",
      });
      return;
    }

    setAuthSubmitting(true);
    try {
      const ok = await verifyAdminPasscode(passcode);
      if (!ok) {
        recordFailedAttempt();
        toast({
          title: lang === "ne" ? "अमान्य एडमिन सुरक्षा कोड" : "Invalid Security Passcode",
          variant: "destructive",
        });
        return;
      }
      clearFailedAttempts();
      grantUnlockedSession(user.id);
      setSessionUnlocked(true);
      setPasscode("");
      await fetchData();
      toast({
        title: lang === "ne" ? "एडमिन सेसन सक्रिय भयो" : "Admin Session Unlocked",
      });
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLockPanel = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setSessionUnlocked(false);
    setPasscode("");
    toast({
      title: lang === "ne" ? "🔒 एडमिन प्यानल लक गरियो" : "🔒 Admin Panel Locked",
    });
  };

  const handleAdminSignOut = async () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setSessionUnlocked(false);
    await signOut();
  };

  const handleEnableDesktopAlerts = async () => {
    const granted = await requestDesktopNotifyPermission();
    setDesktopAlerts(granted);
    toast({
      title: granted
        ? lang === "ne"
          ? "🔔 डेस्कटप अलर्ट सक्रिय भयो"
          : "🔔 Desktop alerts enabled"
        : lang === "ne"
          ? "अनुमति अस्वीकार गरियो"
          : "Notification permission blocked",
    });
  };

  // --- Booking & Message Handlers ---
  const updateBookingStatus = async (
    id: string,
    status: "pending" | "confirmed" | "completed" | "cancelled",
  ) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    toast({
      title: lang === "ne" ? "बुकिङ स्थिति अद्यावधिक भयो" : "Booking status updated",
    });
  };

  const assignPandit = async (bookingId: string, panditId: string) => {
    const val = panditId || null;
    const { error } = await supabase.from("bookings").update({ pandit_id: val }).eq("id", bookingId);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, pandit_id: val } : b)));
    toast({
      title: lang === "ne" ? "पण्डित तोकियो" : "Pandit assigned",
    });
  };

  const markMessageRead = async (id: string) => {
    const { error } = await supabase.from("contact_messages").update({ is_read: true }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)));
  };

  // --- Pandit Add / Edit / Verify / Delete Handlers ---
  const openAddPanditModal = () => {
    setEditingPanditId(null);
    setPanditForm(emptyPanditForm);
    setPanditDialogOpen(true);
  };

  const openEditPanditModal = (p: Tables<"pandits">) => {
    setEditingPanditId(p.id);
    setPanditForm({
      name: p.name || "",
      city: p.city || "Kathmandu",
      phone: p.phone || "",
      experience_years: String(p.experience_years ?? 15),
      rating: String(p.rating ?? 4.9),
      total_ceremonies: String(p.total_ceremonies ?? 500),
      specializationsText: (p.specializations || []).join(", "),
      photo_url: p.photo_url || "",
      bio: p.bio || "",
      verified: Boolean(p.verified),
    });
    setPanditDialogOpen(true);
  };

  const handleSavePandit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = panditForm.name.trim();
    if (!cleanName) {
      toast({
        title: lang === "ne" ? "पण्डितको नाम आवश्यक छ" : "Pandit name is required",
        variant: "destructive",
      });
      return;
    }

    setSavingPandit(true);
    const specializations = panditForm.specializationsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const parsedExp = Math.max(0, Number(panditForm.experience_years) || 0);
    const parsedRating = Math.min(5, Math.max(1, Number(panditForm.rating) || 4.9));
    const parsedCeremonies = Math.max(0, Number(panditForm.total_ceremonies) || 0);

    const payload = {
      name: cleanName,
      city: panditForm.city.trim() || "Kathmandu",
      phone: panditForm.phone.trim() || null,
      experience_years: parsedExp,
      rating: Number(parsedRating.toFixed(2)),
      total_ceremonies: parsedCeremonies,
      specializations,
      photo_url: panditForm.photo_url.trim() || null,
      bio: panditForm.bio.trim() || null,
      verified: panditForm.verified,
    };

    try {
      if (editingPanditId) {
        const { data, error } = await supabase
          .from("pandits")
          .update(payload)
          .eq("id", editingPanditId)
          .select("*")
          .single();

        if (error) {
          toast({ title: "Failed to update Pandit", description: error.message, variant: "destructive" });
          return;
        }
        setPandits((prev) => prev.map((p) => (p.id === editingPanditId ? data : p)));
        toast({
          title: lang === "ne" ? "पण्डित विवरण अद्यावधिक भयो" : "Pandit details updated",
        });
      } else {
        const { data, error } = await supabase
          .from("pandits")
          .insert(payload)
          .select("*")
          .single();

        if (error) {
          toast({ title: "Failed to add Pandit", description: error.message, variant: "destructive" });
          return;
        }
        setPandits((prev) => [data, ...prev]);
        toast({
          title: lang === "ne" ? "नयाँ पण्डित सफलतापूर्वक थपियो" : "New Pandit added",
        });
      }
      setPanditDialogOpen(false);
    } finally {
      setSavingPandit(false);
    }
  };

  const togglePanditVerified = async (p: Tables<"pandits">) => {
    const nextVal = !p.verified;
    const { error } = await supabase.from("pandits").update({ verified: nextVal }).eq("id", p.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setPandits((prev) => prev.map((item) => (item.id === p.id ? { ...item, verified: nextVal } : item)));
    toast({
      title: nextVal
        ? lang === "ne"
          ? "पण्डित प्रमाणित गरियो"
          : "Pandit marked Verified"
        : lang === "ne"
          ? "प्रमाणित चिन्ह हटाइयो"
          : "Pandit marked Unverified",
    });
  };

  const handleDeletePandit = async (p: Tables<"pandits">) => {
    const { error } = await supabase.from("pandits").delete().eq("id", p.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setPandits((prev) => prev.filter((item) => item.id !== p.id));
    setBookings((prev) => prev.map((b) => (b.pandit_id === p.id ? { ...b, pandit_id: null } : b)));
    toast({
      title: lang === "ne" ? "पण्डित सूचीबाट हटाइयो" : "Pandit removed",
    });
  };

  // --- Blog Post Add / Edit / Publish / Delete Handlers ---
  const openAddBlogModal = () => {
    setEditingBlogId(null);
    setBlogForm(emptyBlogForm);
    setBlogDialogOpen(true);
  };

  const openEditBlogModal = (post: Tables<"blog_posts">) => {
    const isPreset = Boolean(post.image_url?.startsWith("preset:"));
    setEditingBlogId(post.id);
    setBlogForm({
      title_ne: post.title_ne || "",
      title_en: post.title_en || "",
      category_ne: post.category_ne || "वैदिक ज्ञान",
      category_en: post.category_en || "Vedic Wisdom",
      author: post.author || "Pt. Ram Prasad Sharma",
      read_time: post.read_time || "5 min",
      coverChoice: isPreset && post.image_url ? post.image_url : post.image_url ? "custom" : "preset:vishwaroop",
      customImageUrl: !isPreset && post.image_url ? post.image_url : "",
      excerpt_ne: post.excerpt_ne || "",
      excerpt_en: post.excerpt_en || "",
      content_ne: post.content_ne || "",
      content_en: post.content_en || "",
      published: Boolean(post.published),
    });
    setBlogDialogOpen(true);
  };

  const handleSaveBlogPost = async (e: FormEvent) => {
    e.preventDefault();
    const titleNe = blogForm.title_ne.trim() || blogForm.title_en.trim();
    const titleEn = blogForm.title_en.trim() || titleNe;
    const excerptNe = blogForm.excerpt_ne.trim() || blogForm.excerpt_en.trim();
    const excerptEn = blogForm.excerpt_en.trim() || excerptNe;

    if (!titleNe || !excerptNe) {
      toast({
        title: lang === "ne" ? "शीर्षक र संक्षिप्त विवरण आवश्यक छ" : "Title and excerpt are required",
        variant: "destructive",
      });
      return;
    }

    setSavingBlog(true);
    const resolvedImage =
      blogForm.coverChoice === "custom"
        ? blogForm.customImageUrl.trim() || "preset:vishwaroop"
        : blogForm.coverChoice;

    const payload = {
      title_ne: titleNe,
      title_en: titleEn,
      category_ne: blogForm.category_ne.trim() || "वैदिक ज्ञान",
      category_en: blogForm.category_en.trim() || "Vedic Wisdom",
      author: blogForm.author.trim() || "Pt. Ram Prasad Sharma",
      read_time: blogForm.read_time.trim() || "5 min",
      image_url: resolvedImage,
      excerpt_ne: excerptNe,
      excerpt_en: excerptEn,
      content_ne: blogForm.content_ne.trim() || blogForm.content_en.trim() || null,
      content_en: blogForm.content_en.trim() || blogForm.content_ne.trim() || null,
      published: blogForm.published,
    };

    try {
      if (editingBlogId) {
        const { data, error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", editingBlogId)
          .select("*")
          .single();

        if (error) {
          toast({ title: "Failed to update post", description: error.message, variant: "destructive" });
          return;
        }
        setBlogPosts((prev) => prev.map((p) => (p.id === editingBlogId ? data : p)));
        toast({
          title: lang === "ne" ? "ब्लग पोस्ट अद्यावधिक भयो" : "Blog post updated",
        });
      } else {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(payload)
          .select("*")
          .single();

        if (error) {
          toast({ title: "Failed to publish post", description: error.message, variant: "destructive" });
          return;
        }
        setBlogPosts((prev) => [data, ...prev]);
        toast({
          title: lang === "ne" ? "नयाँ ब्लग पोस्ट प्रकाशित भयो" : "New blog post published",
        });
      }
      setBlogDialogOpen(false);
    } finally {
      setSavingBlog(false);
    }
  };

  const toggleBlogPublished = async (post: Tables<"blog_posts">) => {
    const nextVal = !post.published;
    const { error } = await supabase.from("blog_posts").update({ published: nextVal }).eq("id", post.id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setBlogPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, published: nextVal } : p)));
    toast({
      title: nextVal
        ? lang === "ne"
          ? "ब्लग प्रकाशित गरियो"
          : "Post published"
        : lang === "ne"
          ? "ड्राफ्टमा सारियो"
          : "Moved to draft",
    });
  };

  const handleDeleteBlogPost = async (post: Tables<"blog_posts">) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    setBlogPosts((prev) => prev.filter((p) => p.id !== post.id));
    toast({
      title: lang === "ne" ? "ब्लग पोस्ट हटाइयो" : "Blog post deleted",
    });
  };

  // --- Loading State ---
  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // --- Security Gate: Unauthenticated, Non-Admin, or Locked Session ---
  if (!user || !isAdmin || !sessionUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-warm flex flex-col">
        <Navbar />

        <main className="flex-1 flex items-center justify-center px-4 pt-24 pb-16">
          <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-elevated p-6 sm:p-8">
            {/* Case 1: Signed in as a non-admin regular account */}
            {user && !isAdmin ? (
              <div className="text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    {lang === "ne" ? "एडमिन अनुमति आवश्यक" : "Administrator Access Only"}
                  </h1>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lang === "ne"
                      ? `तपाईं हाल सामान्य खाता (${user.email}) बाट साइन इन हुनुहुन्छ। एडमिन प्यानल खोल्न आधिकारिक एडमिन खाताबाट लग-इन गर्नुहोस्।`
                      : `You are signed in as ${user.email}, which does not have administrator privileges.`}
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 pt-2">
                  <Button type="button" onClick={handleAdminSignOut} className="w-full rounded-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    {lang === "ne" ? "एडमिन खाताबाट साइन इन गर्नुहोस्" : "Switch to Admin Account"}
                  </Button>
                  <Link
                    to="/"
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground py-2"
                  >
                    {lang === "ne" ? "← गृहपृष्ठमा फर्कनुहोस्" : "← Return to Home"}
                  </Link>
                </div>
              </div>
            ) : user && isAdmin && !sessionUnlocked ? (
              /* Case 2: Signed in as Admin, requires Session Security Passcode */
              <form onSubmit={handlePasscodeUnlockOnly} className="space-y-5">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <h1 className="font-display text-2xl font-bold text-foreground">
                    {lang === "ne" ? "एडमिन सुरक्षा प्रमाणीकरण" : "Unlock Admin Session"}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {user.email}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    {lang === "ne" ? "एडमिन सुरक्षा कोड (Passcode)" : "Admin Security Passcode"}
                  </label>
                  <div className="relative">
                    <Input
                      type={showSecrets ? "text" : "password"}
                      required
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="••••••••••"
                      aria-label="Admin Security Passcode"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecrets((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle secret visibility"
                    >
                      {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={authSubmitting} className="w-full rounded-full">
                  <Lock className="w-4 h-4 mr-2" />
                  {authSubmitting
                    ? lang === "ne"
                      ? "जाँच हुँदैछ..."
                      : "Verifying..."
                    : lang === "ne"
                      ? "प्यानल अनलक गर्नुहोस्"
                      : "Unlock Admin Panel"}
                </Button>

                <button
                  type="button"
                  onClick={handleAdminSignOut}
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  {lang === "ne" ? "साइन आउट गर्नुहोस्" : "Sign Out"}
                </button>
              </form>
            ) : (
              /* Case 3: Unauthenticated — Dedicated Two-Factor Admin Login */
              <form onSubmit={handleAdminFullLogin} className="space-y-4">
                <div className="text-center mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                    {lang === "ne" ? "दुई-तह सुरक्षा" : "Two-Step Protected"}
                  </p>
                  <h1 className="font-display text-2xl font-bold text-foreground mt-0.5">
                    {lang === "ne" ? "सुरक्षित एडमिन लग-इन" : "Secure Admin Login"}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lang === "ne"
                      ? "आधिकारिक एडमिन इमेल, पासवर्ड र सुरक्षा कोड प्रविष्ट गर्नुहोस्।"
                      : "Enter authorized administrator credentials and security passcode."}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {lang === "ne" ? "एडमिन इमेल" : "Admin Email"}
                  </label>
                  <Input
                    type="email"
                    required
                    autoComplete="username"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@karmapath.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {lang === "ne" ? "पासवर्ड" : "Password"}
                  </label>
                  <div className="relative">
                    <Input
                      type={showSecrets ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecrets((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Toggle password visibility"
                    >
                      {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    {lang === "ne" ? "एडमिन सुरक्षा कोड (Passcode)" : "Security Passcode"}
                  </label>
                  <Input
                    type={showSecrets ? "text" : "password"}
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••••"
                  />
                </div>

                <Button type="submit" disabled={authSubmitting} className="w-full rounded-full mt-2">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {authSubmitting
                    ? lang === "ne"
                      ? "प्रमाणीकरण हुँदैछ..."
                      : "Authenticating..."
                    : lang === "ne"
                      ? "सुरक्षित साइन इन गर्नुहोस्"
                      : "Sign In to Admin Portal"}
                </Button>
              </form>
            )}
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // --- Unlocked Admin Control Panel ---
  const pendingBookingsCount = bookings.filter((b) => b.status === "pending").length;
  const unreadMessagesCount = messages.filter((m) => !m.is_read).length;

  const visibleBookings =
    statusFilter === "all" ? bookings : bookings.filter((b) => b.status === statusFilter);

  const tabs = [
    {
      key: "bookings" as const,
      label: lang === "ne" ? "पूजा बुकिङहरू" : "Bookings",
      icon: Calendar,
      badge: pendingBookingsCount,
    },
    {
      key: "pandits" as const,
      label: lang === "ne" ? "पण्डित व्यवस्थापन" : "Pandits",
      icon: Users,
      badge: 0,
    },
    {
      key: "blogs" as const,
      label: lang === "ne" ? "ब्लग पोस्ट" : "Blog Posts",
      icon: BookOpen,
      badge: 0,
    },
    {
      key: "messages" as const,
      label: lang === "ne" ? "सन्देशहरू" : "Messages",
      icon: Mail,
      badge: unreadMessagesCount,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-gradient-warm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-secondary text-xs font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {lang === "ne" ? "सुरक्षित एडमिन सेसन सक्रिय" : "Verified Admin Session"} · {user.email}
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {lang === "ne" ? "एडमिन कन्ट्रोल प्यानल" : "Admin Control Center"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={desktopAlerts ? "secondary" : "outline"}
              size="sm"
              onClick={handleEnableDesktopAlerts}
              className="rounded-full"
            >
              {desktopAlerts ? (
                <>
                  <BellRing className="w-3.5 h-3.5 mr-1.5" />
                  {lang === "ne" ? "लाइभ अलर्ट अन" : "Alerts On"}
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 mr-1.5" />
                  {lang === "ne" ? "अलर्ट अन गर्नुहोस्" : "Enable Alerts"}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLockPanel}
              className="rounded-full"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              {lang === "ne" ? "लक" : "Lock"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAdminSignOut}
              className="rounded-full text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              {lang === "ne" ? "साइन आउट" : "Sign Out"}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pending Bookings Banner */}
          {pendingBookingsCount > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BellRing className="w-5 h-5 text-primary shrink-0 animate-pulse" />
                <p className="text-sm font-semibold text-foreground">
                  {lang === "ne"
                    ? `${pendingBookingsCount} नयाँ पूजा बुकिङ पक्का गर्न बाँकी छ!`
                    : `You have ${pendingBookingsCount} pending ceremony booking(s) awaiting confirmation!`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("bookings");
                  setStatusFilter("pending");
                }}
                className="text-xs font-bold text-primary hover:underline shrink-0"
              >
                {lang === "ne" ? "तुरुन्त हेर्नुहोस् →" : "Review now →"}
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-warm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.key
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: BOOKINGS */}
          {activeTab === "bookings" && (
            <div>
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { key: "all" as const, ne: "सबै", en: "All" },
                  { key: "pending" as const, ne: "नयाँ अनुरोध", en: "Pending" },
                  { key: "confirmed" as const, ne: "पक्का भएको", en: "Confirmed" },
                  { key: "completed" as const, ne: "सम्पन्न", en: "Completed" },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setStatusFilter(f.key)}
                    className={`px-3.5 py-1 rounded-full text-xs font-semibold ${
                      statusFilter === f.key
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lang === "ne" ? f.ne : f.en}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {visibleBookings.map((b) => {
                  const digits = cleanPhoneDigits(b.phone);
                  return (
                    <div
                      key={b.id}
                      className={`bg-card rounded-2xl p-5 border shadow-card ${
                        b.status === "pending" ? "border-primary/35" : "border-border"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-lg font-bold text-foreground">
                              {b.ritual_type}
                            </h3>
                            <Badge
                              variant={
                                b.status === "pending"
                                  ? "default"
                                  : b.status === "confirmed"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {b.status}
                            </Badge>
                          </div>

                          <p className="text-xs sm:text-sm text-foreground font-medium">
                            👤 {b.contact_name} · 📅 {format(parseISO(b.preferred_date), "PPP")}
                            {b.phone && ` · 📞 ${b.phone}`}
                          </p>
                          {b.address && <p className="text-xs text-muted-foreground">📍 {b.address}</p>}
                          {b.notes && <p className="text-xs text-secondary font-medium">📝 {b.notes}</p>}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            aria-label="Assign Pandit"
                            value={b.pandit_id || ""}
                            onChange={(e) => assignPandit(b.id, e.target.value)}
                            className="h-9 rounded-full border border-input bg-background px-3 text-xs text-foreground"
                          >
                            <option value="">
                              {lang === "ne" ? "पण्डित तोक्नुहोस्..." : "Assign Pandit..."}
                            </option>
                            {pandits.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>

                          {b.phone && (
                            <a
                              href={`tel:${b.phone}`}
                              className="inline-flex items-center gap-1 px-3 h-9 rounded-full border border-border text-xs font-medium text-foreground hover:border-primary/40"
                            >
                              <Phone className="w-3.5 h-3.5 text-primary" />
                              {lang === "ne" ? "कल" : "Call"}
                            </a>
                          )}
                          {digits.length >= 7 && (
                            <a
                              href={`https://wa.me/${digits.startsWith("977") ? digits : `977${digits}`}?text=${encodeURIComponent(`नमस्ते ${b.contact_name} जी, तपाईंको ${b.ritual_type} बुकिङ KarmaPath मा प्राप्त भयो।`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 h-9 rounded-full border border-border text-xs font-medium text-secondary hover:border-secondary/40"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp
                            </a>
                          )}

                          {b.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="rounded-full h-9"
                                onClick={() => updateBookingStatus(b.id, "confirmed")}
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                {lang === "ne" ? "पक्का गर्नुहोस्" : "Confirm"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-full h-9"
                                onClick={() => updateBookingStatus(b.id, "cancelled")}
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                {lang === "ne" ? "रद्द" : "Cancel"}
                              </Button>
                            </>
                          )}
                          {b.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="rounded-full h-9"
                              onClick={() => updateBookingStatus(b.id, "completed")}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              {lang === "ne" ? "सम्पन्न चिन्ह" : "Mark Completed"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {visibleBookings.length === 0 && (
                  <p className="text-center text-muted-foreground py-12 text-sm">
                    {lang === "ne" ? "कुनै बुकिङ भेटिएन।" : "No bookings in this view."}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PANDITS ADD & EDIT MENU */}
          {activeTab === "pandits" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {lang === "ne" ? "पण्डित दर्ता र सम्पादन" : "Manage Vedic Pandits"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {lang === "ne"
                      ? `कुल ${pandits.length} गुरु सूचीबद्ध — प्रमाणित पण्डितहरू गृहपृष्ठ र बुकिङ फारममा तुरुन्त देखिन्छन्।`
                      : `${pandits.length} listed — Verified Pandits appear automatically on Home and Booking forms.`}
                  </p>
                </div>

                <Button type="button" onClick={openAddPanditModal} className="rounded-full self-start sm:self-auto">
                  <Plus className="w-4 h-4 mr-1.5" />
                  {lang === "ne" ? "नयाँ पण्डित थप्नुहोस्" : "Add New Pandit"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pandits.map((p) => (
                  <div
                    key={p.id}
                    className="bg-card rounded-2xl p-5 border border-border shadow-card flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {p.photo_url ? (
                        <img
                          src={p.photo_url}
                          alt={p.name}
                          className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-lg shrink-0">
                          {p.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display font-bold text-foreground truncate">{p.name}</h3>
                          <Badge variant={p.verified ? "secondary" : "outline"}>
                            {p.verified
                              ? lang === "ne"
                                ? "प्रमाणित"
                                : "Verified"
                              : lang === "ne"
                                ? "ड्राफ्ट"
                                : "Hidden"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          📍 {p.city || "Kathmandu"} · {p.experience_years ?? 0} yrs · ⭐ {p.rating ?? 4.9}
                        </p>
                        {p.phone && <p className="text-xs text-foreground mt-1">📞 {p.phone}</p>}
                        {p.specializations && p.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {p.specializations.slice(0, 4).map((sp) => (
                              <span
                                key={sp}
                                className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted text-foreground"
                              >
                                {sp}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-border">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full h-8 text-xs"
                        onClick={() => openEditPanditModal(p)}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        {lang === "ne" ? "सम्पादन" : "Edit"}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full h-8 text-xs"
                        onClick={() => togglePanditVerified(p)}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1 text-secondary" />
                        {p.verified
                          ? lang === "ne"
                            ? "लुकाउनुहोस्"
                            : "Unverify"
                          : lang === "ne"
                            ? "प्रमाणित गर्नुहोस्"
                            : "Verify"}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="rounded-full h-8 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeletePandit(p)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        {lang === "ne" ? "हटाउनुहोस्" : "Delete"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BLOG POSTS MANAGEMENT MENU */}
          {activeTab === "blogs" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {lang === "ne" ? "ब्लग लेख व्यवस्थापन" : "Manage Blog Articles"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {lang === "ne"
                      ? "यहाँबाट नयाँ धार्मिक लेख थप्नुहोस् वा सम्पादन गर्नुहोस् — प्रकाशित लेख ब्लग पृष्ठमा तुरुन्त देखिन्छ।"
                      : "Create, edit, or unpublish articles displayed on the public Blog page."}
                  </p>
                </div>

                <Button type="button" onClick={openAddBlogModal} className="rounded-full self-start sm:self-auto">
                  <Plus className="w-4 h-4 mr-1.5" />
                  {lang === "ne" ? "नयाँ ब्लग पोस्ट" : "New Blog Post"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blogPosts.map((post) => {
                  const title = lang === "ne" ? post.title_ne : post.title_en;
                  const excerpt = lang === "ne" ? post.excerpt_ne : post.excerpt_en;
                  const cat = lang === "ne" ? post.category_ne : post.category_en;
                  const coverSrc = resolveBlogCover(post.image_url);

                  return (
                    <div
                      key={post.id}
                      className="bg-card rounded-2xl p-4 border border-border shadow-card flex flex-col justify-between gap-3"
                    >
                      <div className="flex gap-4">
                        <img
                          src={coverSrc}
                          alt={title}
                          className="w-24 h-20 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                              {cat}
                            </span>
                            <Badge variant={post.published ? "secondary" : "outline"}>
                              {post.published
                                ? lang === "ne"
                                  ? "प्रकाशित"
                                  : "Published"
                                : lang === "ne"
                                  ? "ड्राफ्ट"
                                  : "Draft"}
                            </Badge>
                          </div>
                          <h3 className="font-display font-bold text-foreground text-base line-clamp-1">
                            {title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{excerpt}</p>
                          <p className="text-[11px] text-muted-foreground mt-1.5">
                            ✍️ {post.author} · ⏱ {post.read_time}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-border">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full h-8 text-xs"
                          onClick={() => openEditBlogModal(post)}
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1" />
                          {lang === "ne" ? "सम्पादन" : "Edit"}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full h-8 text-xs"
                          onClick={() => toggleBlogPublished(post)}
                        >
                          {post.published
                            ? lang === "ne"
                              ? "ड्राफ्टमा राख्नुहोस्"
                              : "Unpublish"
                            : lang === "ne"
                              ? "प्रकाशित गर्नुहोस्"
                              : "Publish"}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="rounded-full h-8 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteBlogPost(post)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          {lang === "ne" ? "हटाउनुहोस्" : "Delete"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: MESSAGES */}
          {activeTab === "messages" && (
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`bg-card rounded-2xl p-5 border ${
                    m.is_read ? "border-border" : "border-primary/35 bg-primary/5"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-bold text-foreground">{m.subject}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {m.name} · {m.email}
                      </p>
                      <p className="text-sm text-foreground mt-2">{m.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(m.created_at), "PPP p")}
                      </p>
                    </div>
                    {!m.is_read && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => markMessageRead(m.id)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        {lang === "ne" ? "पढियो" : "Mark Read"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-muted-foreground py-12 text-sm">
                  {lang === "ne" ? "कुनै सन्देश छैन।" : "No messages."}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* DIALOG 1: ADD / EDIT PANDIT */}
      <Dialog open={panditDialogOpen} onOpenChange={setPanditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingPanditId
                ? lang === "ne"
                  ? "पण्डित विवरण सम्पादन गर्नुहोस्"
                  : "Edit Pandit Profile"
                : lang === "ne"
                  ? "नयाँ पण्डित थप्नुहोस्"
                  : "Add New Pandit"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {lang === "ne"
                ? "प्रमाणित पण्डितको नाम, शहर, अनुभव र विशेषज्ञता प्रविष्ट गर्नुहोस्।"
                : "Enter Pandit details, Vedic specializations, and verification status."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePandit} className="space-y-3.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "पण्डितको नाम *" : "Pandit Name *"}
                </label>
                <Input
                  required
                  value={panditForm.name}
                  onChange={(e) => setPanditForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Pt. Damodar Acharya"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "शहर" : "City"}
                </label>
                <Input
                  value={panditForm.city}
                  onChange={(e) => setPanditForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="Kathmandu"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "फोन नम्बर" : "Phone"}
                </label>
                <Input
                  value={panditForm.phone}
                  onChange={(e) => setPanditForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+977 9841XXXXXX"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "अनुभव (वर्ष)" : "Experience (Yrs)"}
                </label>
                <Input
                  type="number"
                  min={0}
                  max={80}
                  value={panditForm.experience_years}
                  onChange={(e) => setPanditForm((f) => ({ ...f, experience_years: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "रेटिङ (1–5)" : "Rating (1–5)"}
                </label>
                <Input
                  type="number"
                  step="0.05"
                  min={1}
                  max={5}
                  value={panditForm.rating}
                  onChange={(e) => setPanditForm((f) => ({ ...f, rating: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {lang === "ne" ? "विशेषज्ञता (अल्पविरामले छुट्याउनुहोस्)" : "Specializations (comma-separated)"}
              </label>
              <Input
                value={panditForm.specializationsText}
                onChange={(e) => setPanditForm((f) => ({ ...f, specializationsText: e.target.value }))}
                placeholder="Vivah, Bratabandha, Satyanarayan Puja, Rudri Path"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {lang === "ne" ? "तस्वीर URL (ऐच्छिक)" : "Photo URL (optional)"}
              </label>
              <Input
                value={panditForm.photo_url}
                onChange={(e) => setPanditForm((f) => ({ ...f, photo_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {lang === "ne" ? "संक्षिप्त परिचय" : "Short Bio"}
              </label>
              <Textarea
                rows={3}
                value={panditForm.bio}
                onChange={(e) => setPanditForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder={
                  lang === "ne"
                    ? "वैदिक कर्मकाण्ड, ज्योतिष र संस्कारमा अनुभव..."
                    : "Vedic Karmakanda background and ceremonial expertise..."
                }
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={panditForm.verified}
                onChange={(e) => setPanditForm((f) => ({ ...f, verified: e.target.checked }))}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <span>
                {lang === "ne"
                  ? "प्रमाणित गुरु (गृहपृष्ठ र बुकिङमा देखाउनुहोस्)"
                  : "Verified Pandit (display on Home & Booking forms)"}
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPanditDialogOpen(false)}
                className="rounded-full"
              >
                {lang === "ne" ? "रद्द" : "Cancel"}
              </Button>
              <Button type="submit" disabled={savingPandit} className="rounded-full">
                {savingPandit
                  ? lang === "ne"
                    ? "सेभ हुँदैछ..."
                    : "Saving..."
                  : editingPanditId
                    ? lang === "ne"
                      ? "परिवर्तन सेभ गर्नुहोस्"
                      : "Save Changes"
                    : lang === "ne"
                      ? "पण्डित थप्नुहोस्"
                      : "Add Pandit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: ADD / EDIT BLOG POST */}
      <Dialog open={blogDialogOpen} onOpenChange={setBlogDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingBlogId
                ? lang === "ne"
                  ? "ब्लग पोस्ट सम्पादन गर्नुहोस्"
                  : "Edit Blog Post"
                : lang === "ne"
                  ? "नयाँ ब्लग पोस्ट सिर्जना गर्नुहोस्"
                  : "Create New Blog Post"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {lang === "ne"
                ? "नेपाली वा अङ्ग्रेजीमा लेख लेख्नुहोस् — खाली छोडिएको भाषामा स्वतः अर्को भाषाको पाठ प्रयोग हुन्छ।"
                : "Write in Nepali, English, or both — blank language fields automatically fall back."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBlogPost} className="space-y-3.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "शीर्षक (नेपाली) *" : "Title (Nepali) *"}
                </label>
                <Input
                  value={blogForm.title_ne}
                  onChange={(e) => setBlogForm((f) => ({ ...f, title_ne: e.target.value }))}
                  placeholder="सत्यनारायण पूजाको महत्व र विधि"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "शीर्षक (English)" : "Title (English)"}
                </label>
                <Input
                  value={blogForm.title_en}
                  onChange={(e) => setBlogForm((f) => ({ ...f, title_en: e.target.value }))}
                  placeholder="Significance & Method of Satyanarayan Puja"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "विधा (नेपाली)" : "Category (NE)"}
                </label>
                <Input
                  value={blogForm.category_ne}
                  onChange={(e) => setBlogForm((f) => ({ ...f, category_ne: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "विधा (EN)" : "Category (EN)"}
                </label>
                <Input
                  value={blogForm.category_en}
                  onChange={(e) => setBlogForm((f) => ({ ...f, category_en: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "लेखक" : "Author"}
                </label>
                <Input
                  value={blogForm.author}
                  onChange={(e) => setBlogForm((f) => ({ ...f, author: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "पढ्ने समय" : "Read Time"}
                </label>
                <Input
                  value={blogForm.read_time}
                  onChange={(e) => setBlogForm((f) => ({ ...f, read_time: e.target.value }))}
                  placeholder="5 min"
                />
              </div>
            </div>

            {/* Cover Image Selector */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {lang === "ne" ? "कभर तस्वीर छनोट" : "Cover Artwork"}
              </label>
              <select
                value={blogForm.coverChoice}
                onChange={(e) => setBlogForm((f) => ({ ...f, coverChoice: e.target.value }))}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground"
              >
                {BLOG_COVER_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {lang === "ne" ? preset.labelNe : preset.labelEn}
                  </option>
                ))}
                <option value="custom">
                  {lang === "ne" ? "आफ्नै तस्वीर URL (Custom URL)" : "Custom Image URL"}
                </option>
              </select>

              {blogForm.coverChoice === "custom" && (
                <Input
                  className="mt-2"
                  value={blogForm.customImageUrl}
                  onChange={(e) => setBlogForm((f) => ({ ...f, customImageUrl: e.target.value }))}
                  placeholder="https://example.com/sacred-photo.jpg"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "संक्षिप्त सारांश (नेपाली) *" : "Short Excerpt (Nepali) *"}
                </label>
                <Textarea
                  rows={2}
                  value={blogForm.excerpt_ne}
                  onChange={(e) => setBlogForm((f) => ({ ...f, excerpt_ne: e.target.value }))}
                  placeholder="कार्डमा देखिने २ लाइनको संक्षिप्त सार..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "संक्षिप्त सारांश (English)" : "Short Excerpt (English)"}
                </label>
                <Textarea
                  rows={2}
                  value={blogForm.excerpt_en}
                  onChange={(e) => setBlogForm((f) => ({ ...f, excerpt_en: e.target.value }))}
                  placeholder="Two-line summary shown on blog cards..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "पूरा लेख (नेपाली)" : "Full Article Content (Nepali)"}
                </label>
                <Textarea
                  rows={4}
                  value={blogForm.content_ne}
                  onChange={(e) => setBlogForm((f) => ({ ...f, content_ne: e.target.value }))}
                  placeholder="पूरा लेख यहाँ लेख्नुहोस्..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  {lang === "ne" ? "पूरा लेख (English)" : "Full Article Content (English)"}
                </label>
                <Textarea
                  rows={4}
                  value={blogForm.content_en}
                  onChange={(e) => setBlogForm((f) => ({ ...f, content_en: e.target.value }))}
                  placeholder="Full article body..."
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={blogForm.published}
                onChange={(e) => setBlogForm((f) => ({ ...f, published: e.target.checked }))}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <span>
                {lang === "ne" ? "तुरुन्त ब्लग पृष्ठमा प्रकाशित गर्नुहोस्" : "Publish immediately on Blog page"}
              </span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBlogDialogOpen(false)}
                className="rounded-full"
              >
                {lang === "ne" ? "रद्द" : "Cancel"}
              </Button>
              <Button type="submit" disabled={savingBlog} className="rounded-full">
                {savingBlog
                  ? lang === "ne"
                    ? "सेभ हुँदैछ..."
                    : "Saving..."
                  : editingBlogId
                    ? lang === "ne"
                      ? "पोस्ट अद्यावधिक गर्नुहोस्"
                      : "Update Post"
                    : lang === "ne"
                      ? "पोस्ट प्रकाशित गर्नुहोस्"
                      : "Publish Post"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Admin;
