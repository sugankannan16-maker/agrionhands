import { useCallback, useEffect, useRef, useState } from "react";
import { useSite, type ChatMessage } from "@/site/SiteProvider";
import { langMeta } from "@/site/content";
import { MicIcon, StopIcon, SendIcon, LeafIcon } from "@/components/site/Icons";
import { useSpeechRecognition } from "@/hooks/useSpeech";
import { logActivity } from "@/lib/activity";

const uid = () => Math.random().toString(36).slice(2, 10);

/** Persistent bottom-right AI chat widget, shared history with /assistant. */
export default function FloatingChat() {
  const { c, lang, messages, setMessages, clearMessages } = useSite();
  const locale = langMeta[lang].speech;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || busy) return;
      setError(null);
      setInput("");
      const userMsg: ChatMessage = { id: uid(), role: "user", content: clean, at: Date.now() };
      const assistantId = uid();
      const history = [...messages, userMsg];
      setMessages([...history, { id: assistantId, role: "assistant", content: "", at: Date.now() }]);
      setBusy(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang, messages: history.map((m) => ({ role: m.role, content: m.content })) }),
        });
        if (!res.ok || !res.body) throw new Error("fail");
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)));
        }
        void logActivity({ category: "chat", title: clean, detail: full.slice(0, 800), link: "/assistant" });
      } catch {
        setError(c.assistant.error);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [messages, setMessages, lang, busy, c.assistant.error],
  );

  const { supported, listening, interim, start, stop } = useSpeechRecognition(locale, (t) => void send(t));

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, interim, open]);

  return (
    <>
      {open && (
        <div className="mb-3 w-[min(92vw,22rem)] sm:w-96 h-[min(70vh,30rem)] glass rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in slide-in-from-bottom-3 zoom-in-95 duration-300">
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-grass-800/10 bg-white/40">
            <div className="flex items-center gap-2">
              <span className="size-7 rounded-full bg-grass-800 grid place-items-center">
                <LeafIcon className="size-3.5 text-sun-500" />
              </span>
              <span className="text-sm font-semibold text-grass-900">{c.nav.assistant}</span>
              <span className="text-[10px] text-grass-600">{langMeta[lang].flag}</span>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={clearMessages} className="text-[11px] font-semibold rounded-full bg-grass-100 text-grass-800 px-2.5 py-1.5">
                {c.assistant.clear}
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="size-7 grid place-items-center rounded-full bg-grass-100 text-grass-800">
                ✕
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
            {messages.length === 0 && <p className="text-sm text-grass-700 text-center px-4 py-8">{c.assistant.idle}</p>}
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col animate-in fade-in slide-in-from-bottom-1 duration-300 ${m.role === "user" ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-grass-600 mb-0.5">
                  {new Date(m.at).toLocaleTimeString(langMeta[lang].locale, { hour: "2-digit", minute: "2-digit" })}
                </span>
                {m.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-grass-800 text-grass-50 px-3 py-2 text-sm whitespace-pre-wrap">{m.content}</div>
                ) : (
                  <div className="max-w-[92%] text-sm text-grass-900 whitespace-pre-wrap">
                    {m.content || <span className="text-grass-600 animate-pulse">●●●</span>}
                  </div>
                )}
              </div>
            ))}
            {interim && <p className="text-right text-xs italic text-grass-600">{interim}</p>}
            {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="border-t border-grass-800/10 p-2.5 flex items-end gap-2 bg-white/40"
          >
            <button
              type="button"
              onClick={() => (listening ? stop() : start())}
              disabled={!supported}
              aria-label={listening ? c.assistant.stopMic : c.assistant.mic}
              className={`size-10 shrink-0 grid place-items-center rounded-full ripple-btn disabled:opacity-40 ${listening ? "bg-destructive text-white" : "bg-grass-800 text-grass-50"}`}
            >
              {listening ? <StopIcon className="size-4" /> : <MicIcon className="size-4" />}
            </button>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder={c.assistant.placeholder}
              className="flex-1 resize-none max-h-24 bg-white/80 ring-1 ring-grass-800/15 rounded-2xl px-3 py-2.5 text-sm text-grass-900 focus:outline-none focus:ring-2 focus:ring-grass-600"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label={c.assistant.send}
              className="size-10 shrink-0 grid place-items-center rounded-full bg-sun-500 text-grass-900 ripple-btn disabled:opacity-40"
            >
              <SendIcon className="size-4" />
            </button>
          </form>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={c.nav.assistant}
          className="size-12 md:size-14 grid place-items-center rounded-full bg-grass-800 text-grass-50 shadow-lg transition hover:scale-105 active:scale-95"
        >
          <LeafIcon className="size-6 text-sun-500" />
        </button>
      )}
    </>
  );
}
