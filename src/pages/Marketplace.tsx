import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Sparkles, Loader2, Search, CheckSquare, Square, ArrowRight, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { SERVICE_PACKAGES } from "@/data/serviceCatalog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface SamagriItem {
  name: string;
  nameNepali: string;
  category: string;
  quantity: string;
  essential: boolean;
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
  const [selectedPuja, setSelectedPuja] = useState("Satyanarayan Puja");
  const [customPuja, setCustomPuja] = useState("");
  const [items, setItems] = useState<SamagriItem[]>([]);
  const [ownedNames, setOwnedNames] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runSearchForPuja = async (puja: string) => {
    if (!puja) return;
    setLoading(true);
    setError("");
    setOwnedNames({});

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
    const requestedPuja = searchParams.get("puja") || "Satyanarayan Puja";
    if (pujaPresets.some((p) => p.value === requestedPuja)) {
      setSelectedPuja(requestedPuja);
      setCustomPuja("");
    } else {
      setCustomPuja(requestedPuja);
      setSelectedPuja("");
    }
    void runSearchForPuja(requestedPuja);
  }, [searchParams]);

  const handleSearch = async () => {
    const puja = customPuja.trim() || selectedPuja;
    await runSearchForPuja(puja);
  };

  const toggleOwned = (name: string) => {
    setOwnedNames((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const activePujaLabel = customPuja.trim() || selectedPuja;
  const matchedPkg = SERVICE_PACKAGES.find((p) => p.samagriQuery === activePujaLabel);
  const readyCount = items.filter((i) => ownedNames[i.name]).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="pt-24 pb-8 bg-gradient-warm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-1.5">
            {lang === "ne" ? "पूजा सामग्री चेकलिस्ट" : "Samagri Checklist"}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            {lang === "ne" ? "आवश्यक पूजा सामग्री सूची" : "Puja Samagri Preparation List"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {lang === "ne"
              ? "तयार भइसकेका सामग्रीमा टिक लगाउनुहोस् वा पण्डितसहित सामग्री व्यवस्था बुक गर्नुहोस्।"
              : "Tick off items as you prepare them, or request full Pandit + Samagri setup."}
          </p>
        </div>
      </section>

      <section className="py-10 flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {pujaPresets.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setSelectedPuja(p.value);
                    setCustomPuja("");
                    void runSearchForPuja(p.value);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedPuja === p.value && !customPuja
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang === "ne" ? p.labelNe : p.labelEn}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={lang === "ne" ? "अन्य पूजा खोज्नुहोस्..." : "Search custom puja..."}
                  value={customPuja}
                  onChange={(e) => {
                    setCustomPuja(e.target.value);
                    setSelectedPuja("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !loading) handleSearch();
                  }}
                  className="w-full pl-10 pr-4 h-10 rounded-full border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || (!selectedPuja && !customPuja.trim())}
                className="rounded-full px-6 h-10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {lang === "ne" ? "खोजिँदैछ..." : "Loading..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    {lang === "ne" ? "सूची हेर्नुहोस्" : "Show List"}
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
              <div className="px-6 py-4 bg-muted/40 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">{activePujaLabel}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === "ne"
                      ? `${readyCount} / ${items.length} सामग्री तयार`
                      : `${readyCount} of ${items.length} items ready`}
                  </p>
                </div>

                <Link
                  to={
                    matchedPkg
                      ? `/services?service=${matchedPkg.id}&tier=full#booking`
                      : "/services?tier=full#booking"
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:brightness-110 transition-all self-start sm:self-auto"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  {lang === "ne" ? "पण्डित + सामग्री बुक गर्नुहोस्" : "Book Pandit + Samagri"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-border">
                {items.map((item) => {
                  const isOwned = Boolean(ownedNames[item.name]);
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => toggleOwned(item.name)}
                      className={`w-full px-6 py-3.5 flex items-center justify-between gap-4 text-left hover:bg-muted/30 transition-colors ${
                        isOwned ? "opacity-55 bg-muted/20" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isOwned ? (
                          <CheckSquare className="w-4 h-4 text-secondary shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <div className="min-w-0">
                          <span className={`font-medium text-sm text-foreground ${isOwned ? "line-through" : ""}`}>
                            {lang === "ne" ? item.nameNepali : item.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                            ({lang === "ne" ? item.name : item.nameNepali})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.essential && (
                          <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {lang === "ne" ? "अनिवार्य" : "Essential"}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                    </button>
                  );
                })}
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
