import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { emitAdminBookingAlert, subscribeToAdminAlerts } from "@/lib/adminNotify";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import Resources from "@/pages/Resources";
import Services from "@/pages/Services";
import Auth from "@/pages/Auth";
import Blog from "@/pages/Blog";
import Admin from "@/pages/Admin";

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
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({}),
    })),
    removeChannel: vi.fn(),
    from: vi.fn(() => {
      const builder = {
        select: vi.fn(() => builder),
        eq: vi.fn(() => builder),
        order: vi.fn(() => builder),
        limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        update: vi.fn(() => builder),
        insert: vi.fn(() => builder),
        delete: vi.fn(() => builder),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
        then: (resolve: (val: { data: never[]; error: null }) => unknown) =>
          Promise.resolve({ data: [], error: null }).then(resolve),
      };
      return builder;
    }),
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

describe("KarmaPath split hero, price-free services, blog & secured admin gate", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it("renders side-by-side text + image Hero in Nepali first and toggles to English", () => {
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
    expect(screen.getByAltText(/पशुपतिनाथ सन्ध्या आरती/)).toBeInTheDocument();
    expect(screen.queryByText(/Calendar/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /toggle language/i })[0]);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Samagri")).toBeInTheDocument();
    expect(screen.getByText(/Rituals & Samskaras/)).toBeInTheDocument();
    expect(screen.getByAltText(/Pashupatinath evening aarti/i)).toBeInTheDocument();
  });

  it("blocks unauthenticated visitors on /admin with Two-Step Secure Admin Login gate", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <LanguageProvider>
          <Admin />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("सुरक्षित एडमिन लग-इन")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("admin@karmapath.com")).toBeInTheDocument();
    expect(screen.queryByText("एडमिन कन्ट्रोल प्यानल")).not.toBeInTheDocument();
  });

  it("shows no rupee price numbers on Services while switching Pandit+Samagri vs Pandit-Only scope", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/services"]}>
        <LanguageProvider>
          <Services />
        </LanguageProvider>
      </MemoryRouter>,
    );

    expect(container.textContent).not.toMatch(/रू\s*\d/);
    expect(screen.getByText("सप्तपदी र हवन सामग्री व्यवस्था")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /पण्डित मात्र/i }));
    expect(screen.getByText("सम्पूर्ण विवाह विधि")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/रू\s*\d/);
  });

  it("notifies subscribed Admin listeners immediately when a puja booking alert is emitted", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToAdminAlerts(listener);

    emitAdminBookingAlert({
      ritual_type: "सत्यनारायण पूजा (Satyanarayan Puja)",
      preferred_date: "2026-12-05",
      contact_name: "Aarav Sharma",
      phone: "+977 9841223344",
    });

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        contact_name: "Aarav Sharma",
        ritual_type: "सत्यनारायण पूजा (Satyanarayan Puja)",
      }),
    );
    unsubscribe();
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
  });

  it("uses Supabase OAuth with origin redirect on non-Lovable hosts", async () => {
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
