import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, Loader2, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface SamagriItem {
  name: string;
  nameNepali: string;
  category: string;
  description: string;
  quantity: string;
  estimatedPriceNPR: number;
  essential: boolean;
  whereToFind: string;
}

const pujaPresets = [
  { value: "Satyanarayan Puja", labelNe: "सत्यनारायण पूजा", labelEn: "Satyanarayan Puja" },
  { value: "Griha Pravesh Puja", labelNe: "गृह प्रवेश", labelEn: "Griha Pravesh" },
  { value: "Bratabandha", labelNe: "ब्रतबन्ध", labelEn: "Bratabandha" },
  { value: "Vivah (Wedding)", labelNe: "विवाह", labelEn: "Vivah" },
  { value: "Namakaran Sanskar", labelNe: "नामकरण", labelEn: "Namakaran" },
  { value: "Rudri Path", labelNe: "रुद्री पाठ", labelEn: "Rudri Path" },
  { value: "Shraddha Karma", labelNe: "श्राद्ध कर्म", labelEn: "Shraddha" },
];

const Marketplace = () => {
  const { lang } = useLanguage();
  const [searchParams] = useSearchParams();
  const [selectedPuja, setSelectedPuja] = useState("");
  const [customPuja, setCustomPuja] = useState("");
  const [items, setItems] = useState<SamagriItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runSearchForPuja = async (puja: string) => {
    if (!puja) return;
    setLoading(true);
    setError("");
    setItems([]);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("recommend-samagri", {
        body: { pujaType: puja },
      });
      if (fnError) throw fnError;
      if (Array.isArray(data)) {
        setItems(data);
      } else if (data?.error) {
        setError(data.error);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load samagri list.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const requestedPuja = searchParams.get("puja");
    if (requestedPuja) {
      if (pujaPresets.some((p) => p.value === requestedPuja)) {
        setSelectedPuja(requestedPuja);
        setCustomPuja("");
      } else {
        setCustomPuja(requestedPuja);
        setSelectedPuja("");
      }
      void runSearchForPuja(requestedPuja);
    }
  }, [searchParams]);

  const handleSearch = async () => {
    const puja = customPuja.trim() || selectedPuja;
    await runSearchForPuja(puja);
  };

  const totalEstimate = items.reduce((sum, i) => sum + (Number(i.estimatedPriceNPR) || 0), 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="pt-28 pb-12 bg-gradient-warm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2">
            {lang === "ne" ? "पूजा सामग्री" : "Samagri Checklist"}
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
            {lang === "ne" ? "पूजा सामग्री सूची" : "Puja Samagri Guide"}
          </h1>
          <p className="text-muted-foreground text-base">
            {lang === "ne"
              ? "पूजा छान्नुहोस् र आवश्यक सामग्री, परिमाण र अनुमानित मूल्य हेर्नुहोस्।"
              : "Pick a ceremony to get the required items, quantities, and estimated prices."}
          </p>
        </div>
      </section>

      <section className="py-12 flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {pujaPresets.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setSelectedPuja(p.value);
                    setCustomPuja("");
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    selectedPuja === p.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang === "ne" ? p.labelNe : p.labelEn}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={
                    lang === "ne" ? "वा अन्य पूजाको नाम लेख्नुहोस्..." : "Or type another ritual name..."
                  }
                  value={customPuja}
                  onChange={(e) => {
                    setCustomPuja(e.target.value);
                    setSelectedPuja("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) handleSearch();
                  }}
                  className="w-full pl-10 pr-4 h-11 rounded-full border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || (!selectedPuja && !customPuja.trim())}
                className="rounded-full px-6 h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {lang === "ne" ? "तयार हुँदैछ..." : "Loading..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {lang === "ne" ? "सूची हेर्नुहोस्" : "Get List"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-center text-destructive bg-destructive/10 rounded-xl p-4 mb-6 text-sm">
              {error}
            </div>
          )}

          {items.length > 0 && (
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <div className="px-6 py-4 bg-muted/40 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">
                    {customPuja.trim() || selectedPuja}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {items.length} {lang === "ne" ? "सामग्रीहरू" : "items"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {lang === "ne" ? "अनुमानित जम्मा" : "Est. Total"}
                  </p>
                  <p className="font-display text-xl font-bold text-primary">
                    रू {totalEstimate.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div key={item.name} className="px-6 py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            item.essential ? "text-primary" : "text-muted-foreground/50"
                          }`}
                        />
                        <p className="font-medium text-sm text-foreground truncate">
                          {lang === "ne" ? item.nameNepali : item.name}
                        </p>
                        <span className="text-xs text-muted-foreground hidden sm:inline">
                          ({lang === "ne" ? item.name : item.nameNepali})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-sm">
                      <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                        {item.quantity}
                      </span>
                      <span className="font-semibold text-foreground w-20 text-right">
                        रू {(Number(item.estimatedPriceNPR) || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Marketplace;
