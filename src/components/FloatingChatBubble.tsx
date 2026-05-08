import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import AIPanditChat from "./AIPanditChat";

const FloatingChatBubble = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Hide on dedicated chat page and auth page
  if (location.pathname === "/ask-pandit" || location.pathname === "/auth") return null;

  return (
    <>
      {/* Bubble */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center hover:brightness-110 transition-all",
          open && "scale-90"
        )}
        aria-label={open ? "Close AI Pandit" : "Open AI Pandit"}
      >
        {open ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
        {!open && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-saffron rounded-full animate-pulse" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-[400px] h-[min(600px,calc(100vh-8rem))] rounded-2xl border border-border shadow-elevated overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          <AIPanditChat variant="panel" onClose={() => setOpen(false)} />
        </div>
      )}
    </>
  );
};

export default FloatingChatBubble;
