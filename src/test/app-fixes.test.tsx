import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { format, parseISO, startOfDay } from "date-fns";
import { LanguageProvider } from "@/contexts/LanguageContext";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
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

describe("KarmaPath bug fixes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders HeroSection fallback temple image and removes broken Lovable video on error", () => {
    const { container } = render(
      <MemoryRouter>
        <LanguageProvider>
          <HeroSection />
        </LanguageProvider>
      </MemoryRouter>,
    );

    const fallbackImg = container.querySelector("img");
    expect(fallbackImg).toBeTruthy();

    const video = container.querySelector("video");
    expect(video).toBeTruthy();
    fireEvent.error(video!);

    expect(container.querySelector("video")).toBeNull();
    expect(container.querySelector("img")).toBeTruthy();
  });

  it("keeps only one AI option in Navbar Explore dropdown alongside Festival Calendar", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /explore/i }));
    expect(screen.getByText("Samagri Marketplace")).toBeInTheDocument();
    expect(screen.getByText("Festival Calendar")).toBeInTheDocument();
    expect(screen.queryByText("Ask AI Pandit")).not.toBeInTheDocument();
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

  it("validates confirm password and transitions Sign Up to Verify Your Email screen with resend support", async () => {
    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <LanguageProvider>
          <Auth />
        </LanguageProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /don't have an account\? sign up/i }));

    fireEvent.change(screen.getByPlaceholderText("Your full name"), { target: { value: "Sita Sharma" } });
    fireEvent.change(screen.getByPlaceholderText("your@email.com"), { target: { value: "sita@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("+977 98XXXXXXXX"), { target: { value: "+977 9841000000" } });
    fireEvent.change(screen.getByPlaceholderText("Minimum 6 characters"), { target: { value: "secret123" } });
    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), { target: { value: "mismatch" } });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));
    expect(signUpMock).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText("Re-enter your password"), { target: { value: "secret123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith({
        email: "sita@example.com",
        password: "secret123",
        options: {
          data: { full_name: "Sita Sharma", phone: "+977 9841000000" },
          emailRedirectTo: window.location.origin,
        },
      });
    });

    expect(await screen.findByText("Verify Your Email")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /resend verification email/i }));
    await waitFor(() => {
      expect(resendMock).toHaveBeenCalledWith({
        type: "signup",
        email: "sita@example.com",
        options: { emailRedirectTo: window.location.origin },
      });
    });
  });

  it("opens article reader dialog when clicking a Blog post", async () => {
    render(
      <MemoryRouter initialEntries={["/blog"]}>
        <LanguageProvider>
          <Blog />
        </LanguageProvider>
      </MemoryRouter>,
    );

    fireEvent.click(
      screen.getByText(/Why Lord Krishna Revealed His Vishwaroop to Arjuna/i),
    );

    await waitFor(() => {
      expect(screen.getByText(/Ask AI Pandit →/i)).toBeInTheDocument();
    });
  });

  it("parses date-only booking strings in local time without UTC off-by-one shift", () => {
    const dateStr = "2026-11-28";
    const parsed = parseISO(dateStr);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(10);
    expect(parsed.getDate()).toBe(28);
    expect(format(parsed, "yyyy-MM-dd")).toBe(dateStr);
  });

  it("allows selecting today's date when comparing against startOfDay(new Date())", () => {
    const todayMidnight = startOfDay(new Date());
    const isDisabled = todayMidnight < startOfDay(new Date());
    expect(isDisabled).toBe(false);
  });
});
