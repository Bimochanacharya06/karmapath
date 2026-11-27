import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_ADMIN_EMAIL, resilientSupabaseFetch } from "@/integrations/supabase/localFallback";

describe("resilientSupabaseFetch offline fallback, admin security & CRUD", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("assigns strictly non-admin role to normal signups while provisioning dedicated Admin account", async () => {
    const client = createClient(
      "https://sqpxbgietkuyzvttdlca.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.sig",
      {
        auth: { persistSession: true, autoRefreshToken: false },
        global: { fetch: resilientSupabaseFetch },
      },
    );

    const signUpRes = await client.auth.signUp({
      email: "devotee@example.com",
      password: "strongpassword",
      options: {
        data: { full_name: "Bimochan Acharya", phone: "+977 9869667953" },
      },
    });

    expect(signUpRes.error).toBeNull();
    expect(signUpRes.data.user?.email).toBe("devotee@example.com");

    // Regular signup must NOT get admin role
    const { data: devoteeAdminRole } = await client
      .from("user_roles")
      .select("role")
      .eq("user_id", signUpRes.data.user!.id)
      .eq("role", "admin");
    expect(devoteeAdminRole).toEqual([]);

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

    // Dedicated admin account can sign in and holds role = "admin"
    const adminSignIn = await client.auth.signInWithPassword({
      email: DEFAULT_ADMIN_EMAIL,
      password: "KarmaAdmin@2026",
    });
    expect(adminSignIn.error).toBeNull();
    expect(adminSignIn.data.user?.email).toBe(DEFAULT_ADMIN_EMAIL);

    const { data: adminRole } = await client
      .from("user_roles")
      .select("role")
      .eq("user_id", adminSignIn.data.user!.id)
      .eq("role", "admin");
    expect(adminRole).toHaveLength(1);
  });

  it("supports Pandit Add/Edit and Blog Post creation in resilient storage", async () => {
    const client = createClient(
      "https://sqpxbgietkuyzvttdlca.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.sig",
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { fetch: resilientSupabaseFetch },
      },
    );

    const { data: addedPandit, error: addErr } = await client
      .from("pandits")
      .insert({
        name: "Pt. Madhav Bhattarai",
        city: "Lalitpur",
        experience_years: 22,
        specializations: ["Vivah", "Rudri Path"],
        verified: true,
      })
      .select("*")
      .single();

    expect(addErr).toBeNull();
    expect(addedPandit.name).toBe("Pt. Madhav Bhattarai");

    const { data: editedPandit, error: editErr } = await client
      .from("pandits")
      .update({ city: "Pokhara", experience_years: 24 })
      .eq("id", addedPandit.id)
      .select("id, city, experience_years")
      .single();

    expect(editErr).toBeNull();
    expect(editedPandit).toEqual({
      id: addedPandit.id,
      city: "Pokhara",
      experience_years: 24,
    });

    const { data: createdBlog, error: blogErr } = await client
      .from("blog_posts")
      .insert({
        title_ne: "रुद्री पाठको विधि र आध्यात्मिक लाभ",
        title_en: "Method & Spiritual Benefits of Rudri Path",
        excerpt_ne: "भगवान् आशुतोष शिवको प्रसन्नताका लागि गरिने रुद्राभिषेकको संक्षिप्त परिचय।",
        excerpt_en: "A concise guide to Rudrabhishek and Yajurveda Rudri Path.",
        published: true,
      })
      .select("*")
      .single();

    expect(blogErr).toBeNull();
    expect(createdBlog.title_ne).toBe("रुद्री पाठको विधि र आध्यात्मिक लाभ");

    const { data: allBlogs } = await client
      .from("blog_posts")
      .select("*")
      .eq("published", true);
    expect((allBlogs || []).length).toBeGreaterThanOrEqual(7);
  });
});
