import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { resilientSupabaseFetch } from "@/integrations/supabase/localFallback";

describe("resilientSupabaseFetch offline fallback for dead Supabase host", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("completes Sign Up, creates profile, signs out, and Signs In cleanly when Supabase DNS fails", async () => {
    const client = createClient("https://sqpxbgietkuyzvttdlca.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.sig", {
      auth: { persistSession: true, autoRefreshToken: false },
      global: { fetch: resilientSupabaseFetch },
    });

    const signUpRes = await client.auth.signUp({
      email: "bimochan@example.com",
      password: "strongpassword",
      options: {
        data: { full_name: "Bimochan Acharya", phone: "+977 9869667953" },
      },
    });

    expect(signUpRes.error).toBeNull();
    expect(signUpRes.data.session).toBeTruthy();
    expect(signUpRes.data.user?.email).toBe("bimochan@example.com");

    const { data: profile } = await client
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", signUpRes.data.user!.id)
      .maybeSingle();

    expect(profile).toEqual({
      full_name: "Bimochan Acharya",
      phone: "+977 9869667953",
    });

    await client.auth.signOut();

    const badSignIn = await client.auth.signInWithPassword({
      email: "bimochan@example.com",
      password: "wrongpassword",
    });
    expect(badSignIn.error?.message).toMatch(/Invalid login credentials/i);

    const goodSignIn = await client.auth.signInWithPassword({
      email: "bimochan@example.com",
      password: "strongpassword",
    });
    expect(goodSignIn.error).toBeNull();
    expect(goodSignIn.data.session?.user.email).toBe("bimochan@example.com");
  });

  it("returns seeded verified Pandits when remote Supabase host fails to resolve", async () => {
    const client = createClient("https://sqpxbgietkuyzvttdlca.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.sig", {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: resilientSupabaseFetch },
    });

    const { data: pandits, error } = await client
      .from("pandits")
      .select("*")
      .eq("verified", true)
      .order("rating", { ascending: false });

    expect(error).toBeNull();
    expect(pandits?.length).toBeGreaterThanOrEqual(5);
  });
});
