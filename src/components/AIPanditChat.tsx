import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-pandit`;

const SUGGESTIONS = [
  "What samagri do I need for Satyanarayan Puja?",
  "How do I prepare for my son's Bratabandha?",
  "When is the next auspicious day for Griha Pravesh?",
  "What is the Gayatri Mantra and how to chant it?",
];

interface AIPanditChatProps {
  variant?: "panel" | "page";
  onClose?: () => void;
}

const AIPanditChat = ({ variant = "panel", onClose }: AIPanditChatProps) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const userMsg: Msg = { role: "user", content: text.trim() };
    if (!userMsg.content) return;

    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          toast({ title: "Too many requests", description: "Please wait a moment and try again.", variant: "destructive" });
        } else if (resp.status === 402) {
          toast({ title: "AI credits exhausted", description: "Please add credits in Workspace settings.", variant: "destructive" });
        } else {
          toast({ title: "Error", description: "Could not reach AI Pandit. Please try again.", variant: "destructive" });
        }
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistantSoFar = "";
      let done = false;

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (c) upsert(c);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Connection error", description: "Could not connect to AI Pandit.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const isPage = variant === "page";

  return (
    <div className={cn(
      "flex flex-col bg-card",
      isPage ? "h-full rounded-2xl border border-border shadow-elevated" : "h-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-warm rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground text-sm">AI Pandit</h3>
            <p className="text-xs text-muted-foreground">Ritual guidance · 24/7</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors" aria-label="Close">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center pt-6">
            <div className="text-4xl mb-3">🕉️</div>
            <p className="font-display text-base font-semibold text-foreground mb-1">Namaste 🙏</p>
            <p className="text-xs text-muted-foreground mb-5 max-w-xs mx-auto">
              Ask me about any ritual, samagri, mantra, festival, or Vedic ceremony.
            </p>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-muted/60 hover:bg-muted text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm"
            )}>
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0 prose-strong:text-foreground">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-muted-foreground text-xs">AI Pandit is thinking…</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); if (!loading) send(input); }}
        className="p-3 border-t border-border bg-background/50 rounded-b-2xl"
      >
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about any ritual..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIPanditChat;
