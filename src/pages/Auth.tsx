import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle2, RefreshCw, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import omSymbol from "@/assets/om-symbol.png";

const isLovableHosted = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com") ||
    host.endsWith(".lovable.dev")
  );
};

type AuthView = "login" | "signup" | "verify-email" | "forgot-password" | "update-password";

const formatAuthError = (rawMessage: string): string => {
  const lower = rawMessage.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many email requests sent recently. Please wait a few minutes or check your inbox and spam folder.";
  }
  if (lower.includes("provider is not enabled") || lower.includes("unsupported provider")) {
    return "Google Sign-In is not enabled on this Supabase project yet. Please continue with email below.";
  }
  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Please sign in instead.";
  }
  return rawMessage;
};

const Auth = () => {
  const [view, setView] = useState<AuthView>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();
  const { user, loading: authLoading, isPasswordRecovery, clearPasswordRecovery } = useAuth();
  const navigate = useNavigate();

  // Inspect URL hash/search for auth callback errors (e.g., expired confirmation link)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(window.location.search);
    const errorDesc = hashParams.get("error_description") || searchParams.get("error_description");
    if (errorDesc) {
      toast({
        title: "Verification link issue",
        description: decodeURIComponent(errorDesc.replace(/\+/g, " ")),
        variant: "destructive",
      });
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [toast]);

  useEffect(() => {
    if (isPasswordRecovery) {
      setView("update-password");
      return;
    }
    if (!authLoading && user && view !== "update-password") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, isPasswordRecovery, view, navigate]);

  const switchView = (nextView: AuthView) => {
    setView(nextView);
    setPassword("");
    setConfirmPassword("");
    setUnconfirmedEmail("");
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const redirectUrl = window.location.origin;
      if (isLovableHosted()) {
        const result = await lovable.auth.signInWithOAuth("google", {
          redirect_uri: redirectUrl,
        });
        if (result.error) {
          toast({ title: "Error", description: formatAuthError(String(result.error)), variant: "destructive" });
          return;
        }
        if (result.redirected) return;
        toast({ title: "🙏 Welcome!", description: "Signed in with Google successfully." });
        navigate("/dashboard");
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });
      if (error) throw error;
    } catch (error: unknown) {
      const raw = error instanceof Error ? error.message : "Google sign-in failed.";
      toast({ title: "Sign-In Notice", description: formatAuthError(raw), variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResendVerification = async (targetEmail: string) => {
    const cleanEmail = targetEmail.trim();
    if (!cleanEmail) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      toast({
        title: "Verification email sent",
        description: `We sent a fresh confirmation link to ${cleanEmail}. Check your inbox and spam folder.`,
      });
    } catch (error: unknown) {
      const raw = error instanceof Error ? error.message : "Could not resend verification email.";
      toast({ title: "Error", description: formatAuthError(raw), variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast({
        title: "Password reset email sent",
        description: `Check ${trimmedEmail} for a link to set a new password.`,
      });
      switchView("login");
    } catch (error: unknown) {
      const raw = error instanceof Error ? error.message : "Could not send password reset email.";
      toast({ title: "Error", description: formatAuthError(raw), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please make sure both password fields match.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      clearPasswordRecovery();
      toast({ title: "🙏 Password updated!", description: "Your new password has been saved." });
      navigate("/dashboard", { replace: true });
    } catch (error: unknown) {
      const raw = error instanceof Error ? error.message : "Failed to update password.";
      toast({ title: "Error", description: formatAuthError(raw), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnconfirmedEmail("");
    const trimmedEmail = email.trim();

    if (view === "login") {
      setLoading(true);
      try {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (error) {
          if (error.message.toLowerCase().includes("email not confirmed")) {
            setUnconfirmedEmail(trimmedEmail);
            toast({
              title: "Email not verified yet",
              description: "Please click the verification link in your email, or resend it below.",
              variant: "destructive",
            });
            return;
          }
          throw error;
        }
        toast({ title: "🙏 Welcome back!", description: "You have been signed in successfully." });
        navigate("/dashboard");
      } catch (error: unknown) {
        const raw = error instanceof Error ? error.message : "Something went wrong.";
        toast({ title: "Error", description: formatAuthError(raw), variant: "destructive" });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Sign Up validation
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      toast({ title: "Full name required", description: "Please enter your full name (at least 2 characters).", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please confirm your password accurately.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: { full_name: trimmedName, phone: trimmedPhone || null },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;

      if (data.user?.identities && data.user.identities.length === 0) {
        toast({
          title: "Account already exists",
          description: "An account with this email already exists. Please sign in instead.",
          variant: "destructive",
        });
        switchView("login");
        return;
      }

      if (data.session) {
        await supabase
          .from("profiles")
          .upsert(
            { user_id: data.session.user.id, full_name: trimmedName, phone: trimmedPhone || null },
            { onConflict: "user_id" },
          );
        toast({ title: "🙏 Welcome to KarmaPath!", description: "Your account has been created." });
        navigate("/dashboard");
      } else {
        setPassword("");
        setConfirmPassword("");
        setView("verify-email");
        toast({ title: "🙏 Account Created!", description: `Verification link sent to ${trimmedEmail}.` });
      }
    } catch (error: unknown) {
      const raw = error instanceof Error ? error.message : "Something went wrong.";
      toast({ title: "Sign-Up Error", description: formatAuthError(raw), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-20 bg-gradient-warm min-h-screen flex items-center">
        <div className="max-w-md mx-auto px-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border shadow-elevated p-8"
          >
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center p-2">
                <img src={omSymbol} alt="Om" className="w-full h-full object-contain" />
              </div>
            </div>

            {view === "verify-email" ? (
              <div className="text-center space-y-5">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    Verify Your Email
                  </h1>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We sent a confirmation link to{" "}
                    <strong className="text-foreground">{email}</strong>. Click the link in your inbox (or spam folder) to activate your KarmaPath account.
                  </p>
                </div>
                <div className="space-y-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={resending}
                    onClick={() => handleResendVerification(email)}
                    className="w-full"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${resending ? "animate-spin" : ""}`} />
                    {resending ? "Sending..." : "Resend verification email"}
                  </Button>
                  <Button type="button" onClick={() => switchView("login")} className="w-full">
                    Continue to Sign In
                  </Button>
                </div>
              </div>
            ) : view === "forgot-password" ? (
              <div>
                <div className="text-center mb-6">
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    Reset Password
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Enter your email and we'll send you a secure password reset link.
                  </p>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full py-6" size="lg">
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => switchView("login")}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                </div>
              </div>
            ) : view === "update-password" ? (
              <div>
                <div className="text-center mb-6">
                  <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                    Set New Password
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Choose a strong new password for your KarmaPath account.
                  </p>
                </div>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full py-6" size="lg">
                    {loading ? "Updating..." : "Save New Password"}
                  </Button>
                </form>
              </div>
            ) : (
              <>
                <div className="text-center mb-7">
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                    {view === "login" ? "Welcome Back" : "Join KarmaPath"}
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    {view === "login"
                      ? "Sign in to manage your bookings and ceremonies"
                      : "Create an account to book pujas and connect with Pandits"}
                  </p>
                </div>

                {/* Google Sign In */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full py-6 mb-6 text-base font-medium border-border hover:bg-muted"
                  size="lg"
                >
                  {googleLoading ? (
                    "Connecting..."
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                {unconfirmedEmail && (
                  <div className="mb-4 p-3.5 rounded-xl bg-primary/10 border border-primary/25 text-sm space-y-2">
                    <p className="text-foreground font-medium">Your email hasn't been verified yet.</p>
                    <button
                      type="button"
                      disabled={resending}
                      onClick={() => handleResendVerification(unconfirmedEmail)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                      {resending ? "Sending link..." : "Resend confirmation email"}
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {view === "signup" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          autoComplete="name"
                          required
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  {view === "signup" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="+977 98XXXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Password *</label>
                      {view === "login" && (
                        <button
                          type="button"
                          onClick={() => switchView("forgot-password")}
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={view === "signup" ? "Minimum 6 characters" : "••••••••"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        autoComplete={view === "login" ? "current-password" : "new-password"}
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {view === "signup" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Re-enter your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                          autoComplete="new-password"
                          minLength={6}
                          required
                        />
                      </div>
                    </div>
                  )}
                  <Button type="submit" disabled={loading} className="w-full py-6" size="lg">
                    {loading ? "Please wait..." : view === "login" ? "Sign In" : "Create Account"}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => switchView(view === "login" ? "signup" : "login")}
                    className="text-sm text-primary hover:underline"
                  >
                    {view === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Auth;
