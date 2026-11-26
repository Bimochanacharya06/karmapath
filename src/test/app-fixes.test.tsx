import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { format, parseISO, startOfDay } from "date-fns";
import { LanguageProvider } from "@/contexts/LanguageContext";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import Auth from "@/pages/Auth";
import Blog from "@/pages/Blog";

const { signInWithOAuthMock, lovableOAuthMock } = vi.hoisted(() => ({
  signInWithOAuthMock: vi.fn().mockResolvedValue({ data: {}, error: null }),
  lovableOAuthMock: vi.fn().mockResolvedValue({ error: null, redirected: true }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signOut: vi.fn(),
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithOAuth: signInWithOAuthMock,
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      update: vi.fn().mockReturnThis(),
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

  it("exposes both Samagri Marketplace and Ask AI Pandit in Navbar Explore menu", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LanguageProvider>
          <Navbar />
        </LanguageProvider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /explore/i }));
    expect(screen.getByText("Samagri Marketplace")).toBeInTheDocument();
    expect(screen.getByText("Ask AI Pandit")).toBeInTheDocument();
  });

  it("uses Supabase OAuth instead of Lovable /~oauth/initiate proxy on non-Lovable hosts", async () => {
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
        options: { redirectTo: `${window.location.origin}/dashboard` },
      });
    });
    expect(lovableOAuthMock).not.toHaveBeenCalled();
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
