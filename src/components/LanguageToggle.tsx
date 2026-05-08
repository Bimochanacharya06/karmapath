import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = ({ compact = false }: { compact?: boolean }) => {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "ne" : "en")}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 backdrop-blur-sm hover:bg-muted transition-colors ${
        compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"
      } font-medium text-foreground`}
      title={lang === "en" ? "नेपालीमा हेर्नुहोस्" : "View in English"}
      aria-label="Toggle language"
    >
      <Languages className="w-3.5 h-3.5" />
      <span className={lang === "en" ? "text-primary font-semibold" : "text-muted-foreground"}>EN</span>
      <span className="text-muted-foreground">/</span>
      <span className={lang === "ne" ? "text-primary font-semibold" : "text-muted-foreground"}>नेपाली</span>
    </button>
  );
};

export default LanguageToggle;
