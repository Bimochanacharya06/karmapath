import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isPasswordRecovery: false,
  clearPasswordRecovery: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const syncUserProfileMetadata = async (user: User) => {
  const metaName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  const metaPhone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone.trim() : "";
  if (!metaName && !metaPhone) return;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    await supabase.from("profiles").insert({
      user_id: user.id,
      full_name: metaName || null,
      phone: metaPhone || null,
    });
    return;
  }

  const updates: { full_name?: string; phone?: string } = {};
  if (!existing.full_name && metaName) updates.full_name = metaName;
  if (!existing.phone && metaPhone) updates.phone = metaPhone;

  if (Object.keys(updates).length > 0) {
    await supabase.from("profiles").update(updates).eq("user_id", user.id);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === "PASSWORD_RECOVERY") {
          setIsPasswordRecovery(true);
        }

        if (event === "SIGNED_IN" && session?.user) {
          void syncUserProfileMetadata(session.user);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const clearPasswordRecovery = () => setIsPasswordRecovery(false);

  return (
    <AuthContext.Provider value={{ session, user, loading, isPasswordRecovery, clearPasswordRecovery, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
