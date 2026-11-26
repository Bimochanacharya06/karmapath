import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = ({ compact = false }: { compact?: boolean }) => {
  const { lang, setLang } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => setLang(lang === "ne" ? "en" : "ne")}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 hover:bg-muted transition-colors ${
        compact ? "px-3 py-1.5 text-xs" : "px-3.5 py-2 text-sm"
      } font-medium text-foreground`}
      title={lang === "ne" ? "Switch to English" : "नेपालीमा हेर्नुहोस्"}
      aria-label="Toggle language"
    >
      <Languages className="w-3.5 h-3.5 text-primary" />
      <span className={lang === "ne" ? "text-primary font-semibold" : "text-muted-foreground"}>
        नेपाली
      </span>
      <span className="text-muted-foreground/50">/</span>
      <span className={lang === "en" ? "text-primary font-semibold" : "text-muted-foreground"}>
        EN
      </span>
    </button>
  );
};

export default LanguageToggle;
