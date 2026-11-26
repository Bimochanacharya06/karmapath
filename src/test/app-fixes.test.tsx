import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { LanguageProvider } from "@/contexts/LanguageContext";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import Resources from "@/pages/Resources";
import Auth from "@/pages/Auth";
import Blog from "@/pages/Blog";

const { signInWithOAuthMock, signUpMock, resendMock, lovableOAuthMock } = vi.hoisted(() => ({
  signInWithOAuthMock: vi.fn().mockResolvedValue({ data: {}, error: null }),
  signUpMock: vi.fn().mockResolvedValue({
    data: { user: { id: "u1", identities: [{ id: "i1" }] }, session: null },
    error: null,
  }),
  resendMock: vi.fn().mockResolvedValue({ data: {}, error: null }),
  lovableOAuthMock: vi.fn().mockResolvedValue({ error: null, redirected: true }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    isPasswordRecovery: false,
    clearPasswordRecovery: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithOAuth: signInWithOAuthMock,
      signInWithPassword: vi.fn(),
      signUp: signUpMock,
      resend: resendMock,
      resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

vi.mock("@/integrations/lovable/index", () => ({
  lovable: {
    auth: {
      signInWithOAuth: lovableOAuthMock,
    },
  },
}));

vi.mock("@/integrations/supabase/localFallback", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/integrations/supabase/localFallback")>();
  return {
    ...actual,
    checkSupabaseCloudOnline: vi.fn().mockResolvedValue(true),
  };
});

describe("KarmaPath Nepali-first & streamlined UI", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("defaults to Nepali first and switches to English when clicking the language toggle", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LanguageProvider>
          <Navbar />
          <HeroSection />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("गृहपृष्ठ")).toBeInTheDocument();
    expect(screen.getByText("पूजा सामग्री")).toBeInTheDocument();
    expect(screen.getByText(/वैदिक पूजा र संस्कार/)).toBeInTheDocument();
    expect(screen.queryByText(/Calendar/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /toggle language/i }));

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Samagri")).toBeInTheDocument();
    expect(screen.getByText(/Rituals & Samskaras/)).toBeInTheDocument();
  });

  it("renders concise Resources guides in Nepali without any Festival Calendar", () => {
    render(
      <MemoryRouter initialEntries={["/resources"]}>
        <LanguageProvider>
          <Resources />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText("सरल पूजा विधि र मन्त्र")).toBeInTheDocument();
    expect(screen.queryByText(/Festival Calendar/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/चाडपर्व पात्रो/i)).not.toBeInTheDocument();
  });

  it("uses Supabase OAuth with origin redirect instead of Lovable /~oauth/initiate proxy on non-Lovable hosts", async () => {
    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <LanguageProvider>
          <Auth />
        </LanguageProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));

    await waitFor(() => {
      expect(signInWithOAuthMock).toHaveBeenCalledWith({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
    });
    expect(lovableOAuthMock).not.toHaveBeenCalled();
  });

  it("validates confirm password and transitions Sign Up to Verify Your Email screen", async () => {
    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <LanguageProvider>
          <Auth />
        </LanguageProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    fireEvent.change(screen.getByPlaceholderText("Your full name"), { target: { value: "Sita Sharma" } });
    fireEvent.change(screen.getByPlaceholderText("your@email.com"), { target: { value: "sita@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("+977 98XXXXXXXX"), { target: { value: "+977 9841000000" } });
    fireEvent.change(screen.getByPlaceholderText("Minimum 6 characters"), { target: { value: "secret123" } });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), { target: { value: "secret123" } });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText("Verify Your Email")).toBeInTheDocument();
  });

  it("opens article reader dialog in Nepali by default when clicking a Blog post", async () => {
    render(
      <MemoryRouter initialEntries={["/blog"]}>
        <LanguageProvider>
          <Blog />
        </LanguageProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText(/कुरुक्षेत्रमा श्रीकृष्णको विश्वरूप दर्शन/));

    await waitFor(() => {
      expect(screen.getByText(/AI पण्डितलाई सोध्नुहोस् →/)).toBeInTheDocument();
    });
  });

  it("parses date-only booking strings in local time without UTC off-by-one shift", () => {
    const dateStr = "2026-11-28";
    const parsed = parseISO(dateStr);
    expect(format(parsed, "yyyy-MM-dd")).toBe(dateStr);
  });
});
