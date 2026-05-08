import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sparkles, Loader2, Flower2, Wheat, Droplets, Shirt, Coins, Apple, Flame, Package, Search, MapPin, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
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

const categoryIcons: Record<string, any> = {
  flowers: Flower2, grains: Wheat, oils: Droplets, fabrics: Shirt,
  metals: Coins, fruits: Apple, spices: Flame, sacred: Sparkles, other: Package,
};

const categoryColors: Record<string, string> = {
  flowers: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  grains: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  oils: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  fabrics: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  metals: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  fruits: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  spices: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  sacred: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
};

const pujaTypes = [
  "Satyanarayan Puja", "Griha Pravesh Puja", "Rudri Path", "Navgraha Shanti",
  "Ganesh Puja", "Lakshmi Puja", "Durga Puja", "Namakaran Sanskar",
  "Bratabandha", "Vivah (Wedding)", "Shraddha Karma", "Satyanarayana Vrat Katha",
  "Mahamrityunjay Jaap", "Vastu Shanti", "Kaal Sarp Dosh Nivaran",
];

const Marketplace = () => {
  const [selectedPuja, setSelectedPuja] = useState("");
  const [customPuja, setCustomPuja] = useState("");
  const [items, setItems] = useState<SamagriItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    const puja = customPuja.trim() || selectedPuja;
    if (!puja) return;
    setLoading(true);
    setError("");
    setItems([]);
    setSearched(true);

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
    } catch (e: any) {
      setError(e.message || "Failed to get recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalEstimate = items.reduce((sum, i) => sum + i.estimatedPriceNPR, 0);
  const essentialItems = items.filter((i) => i.essential);
  const optionalItems = items.filter((i) => !i.essential);

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-24 pb-12 bg-gradient-warm">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" /> AI-Powered Samagri Guide
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Puja <span className="text-gradient-saffron">Samagri</span> Marketplace
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Select any puja and our AI Purohit will give you the <strong>complete shopping checklist</strong> — with Nepali names, quantities, prices, and where to buy each item.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto bg-card rounded-2xl border border-border shadow-elevated p-6 md:p-8 mb-12"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">कुन पूजाको सामग्री चाहिन्छ? (Select a Puja)</label>
                <div className="flex flex-wrap gap-2">
                  {pujaTypes.map((p) => (
                    <button key={p} onClick={() => { setSelectedPuja(p); setCustomPuja(""); }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedPuja === p ? "bg-primary text-primary-foreground shadow-warm" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm">or</span>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Type any ritual name (e.g., Nag Puja, Saraswati Puja)..."
                    value={customPuja} onChange={(e) => { setCustomPuja(e.target.value); setSelectedPuja(""); }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
              <Button onClick={handleSearch} disabled={loading || (!selectedPuja && !customPuja.trim())}
                className="w-full py-6 text-base" size="lg"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> AI Purohit is preparing your list...</>
                ) : (
                  <><Sparkles className="w-5 h-5 mr-2" /> Get Complete Samagri List</>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto text-center text-destructive bg-destructive/10 rounded-xl p-4 mb-8"
              >
                {error}
              </motion.div>
            )}

            {items.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Summary */}
                <div className="max-w-3xl mx-auto bg-card rounded-2xl border border-primary/20 shadow-warm p-6 mb-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground">
                        {customPuja.trim() || selectedPuja} — Shopping Checklist
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {essentialItems.length} essential + {optionalItems.length} optional items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Estimated Total</p>
                      <p className="font-display text-2xl font-bold text-primary">रू {totalEstimate.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-primary/5 flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Prices are estimates based on Nepal market rates. Actual prices may vary by location and season. 
                      You can find most items at your nearest <strong>पूजा पसल</strong> (puja shop).
                    </p>
                  </div>
                </div>

                {/* Essential Items */}
                {essentialItems.length > 0 && (
                  <div className="max-w-5xl mx-auto mb-8">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-primary" /> अनिवार्य सामग्री — Essential Items ({essentialItems.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {essentialItems.map((item, i) => {
                        const Icon = categoryIcons[item.category] || Package;
                        return (
                          <motion.div key={item.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="bg-card rounded-xl border border-primary/10 p-5 hover:shadow-elevated transition-all"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={`w-10 h-10 rounded-lg ${categoryColors[item.category] || "bg-gray-100"} flex items-center justify-center`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Must Have
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-foreground">{item.name}</h4>
                            <p className="text-primary text-sm font-medium">{item.nameNepali}</p>
                            <p className="text-muted-foreground text-xs mt-2 leading-relaxed">{item.description}</p>
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Qty:</span>
                                <span className="font-medium text-foreground">{item.quantity}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-display font-bold text-primary">रू {item.estimatedPriceNPR.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" /> {item.whereToFind}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Optional Items */}
                {optionalItems.length > 0 && (
                  <div className="max-w-5xl mx-auto mb-12">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-muted-foreground" /> वैकल्पिक — Optional Items ({optionalItems.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {optionalItems.map((item, i) => {
                        const Icon = categoryIcons[item.category] || Package;
                        return (
                          <motion.div key={item.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="bg-card rounded-xl border border-border/60 p-5 hover:shadow-card transition-all"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className={`w-10 h-10 rounded-lg ${categoryColors[item.category] || "bg-gray-100"} flex items-center justify-center`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <Badge variant="secondary" className="text-xs">Optional</Badge>
                            </div>
                            <h4 className="font-semibold text-foreground">{item.name}</h4>
                            <p className="text-primary text-sm font-medium">{item.nameNepali}</p>
                            <p className="text-muted-foreground text-xs mt-2 leading-relaxed">{item.description}</p>
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Qty:</span>
                                <span className="font-medium text-foreground">{item.quantity}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-display font-bold text-foreground">रू {item.estimatedPriceNPR.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" /> {item.whereToFind}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {searched && !loading && items.length === 0 && !error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto text-center py-12"
              >
                <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No items found. Try a different puja type.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Marketplace;
