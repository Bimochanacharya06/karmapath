import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIPanditChat from "@/components/AIPanditChat";
import { Sparkles } from "lucide-react";

const AskPandit = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="flex-1 pt-20 pb-12 bg-gradient-warm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Vedic Guide
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Ask the <span className="text-gradient-saffron">AI Pandit</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Get authentic guidance on rituals, samagri, mantras, and festivals — anytime, in English or नेपाली.
            </p>
          </div>

          <div className="flex-1 min-h-[600px] max-h-[calc(100vh-16rem)]">
            <AIPanditChat variant="page" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AskPandit;
