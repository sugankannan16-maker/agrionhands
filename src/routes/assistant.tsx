import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSite, type ChatMessage } from "@/site/SiteProvider";
import { langMeta } from "@/site/content";
import { PageHeader } from "@/components/site/Chrome";
import { MicIcon, StopIcon, SendIcon, SpeakerIcon, LeafIcon } from "@/components/site/Icons";
import { useSpeechRecognition, useSpeechSynthesis } from "@/hooks/useSpeech";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Voice AI Assistant — Tamil, English & Hindi | Agri on Hands" },
      { name: "description", content: "Speak naturally in Tamil, English or Hindi and get instant AI farming answers with speech recognition and read-aloud responses." },
      { property: "og:title", content: "Voice AI Assistant — Tamil, English & Hindi | Agri on Hands" },
      { property: "og:description", content: "A multilingual voice chatbot for crops, soil, pests, irrigation and market timing." },
    ],
  }),
  component: AssistantPage,
});

const uid = () => Math.random().toString(36).slice(2, 10);

function AssistantPage() {
  const { c, lang, isLatin, messages, setMessages, clearMessages } = useSite();
  const locale = langMeta[lang].speech;
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "processing">("idle");
  const [speakAloud, setSpeakAloud] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { speak, cancel, speaking } = useSpeechSynthesis(locale);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || status === "processing") return;
      cancel();
      setError(null);
      setInput("");
      const userMsg: ChatMessage = { id: uid(), role: "user", content: clean, at: Date.now() };
      const assistantId = uid();
      const history = [...messages, userMsg];
      setMessages([...history, { id: assistantId, role: "assistant", content: "", at: Date.now() }]);
      setStatus("processing");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang,
            messages: history.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        if (!res.ok || !res.body) throw new Error(res.status === 429 ? "rate" : res.status === 402 ? "credits" : "fail");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: full } : m)));
        }
        if (speakAloud && full) speak(full);
      } catch {
        setError(c.assistant.error);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setStatus("idle");
        inputRef.current?.focus();
      }
    },
    [messages, setMessages, lang, speakAloud, speak, cancel, status, c.assistant.error],
  );

  const { supported, listening, interim, start, stop } = useSpeechRecognition(locale, (text) => void send(text));

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, interim, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const state = listening ? c.assistant.listening : status === "processing" ? c.assistant.processing : speaking ? c.assistant.speaking : c.assistant.idle;

  return (
    <section className="py-10 md:py-16">
      <div className="container-page"><div className="mx-auto w-full max-w-4xl">
        <PageHeader kicker={c.assistant.kicker} heading={c.assistant.heading} sub={c.assistant.sub} />

        <div className="glass rounded-3xl overflow-hidden flex flex-col h-[68vh] min-h-[460px]">
          {/* status bar */}
          <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 border-b border-grass-800/10">
            <div className="flex items-center gap-2 text-sm text-grass-800">
              <span className={`size-2.5 rounded-full ${listening ? "bg-destructive animate-pulse" : status === "processing" ? "bg-sun-500 animate-pulse" : speaking ? "bg-sky-500 animate-pulse" : "bg-grass-600"}`} />
              <span className="font-medium">{state}</span>
              <span className="hidden sm:inline text-grass-600">· {langMeta[lang].flag} {langMeta[lang].label}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setSpeakAloud((v) => !v); cancel(); }}
                aria-pressed={speakAloud}
                title={c.assistant.speakToggle}
                className={`size-9 grid place-items-center rounded-full transition ${speakAloud ? "bg-grass-800 text-grass-50" : "bg-grass-100 text-grass-800"}`}
              >
                <SpeakerIcon on={speakAloud} />
              </button>
              <button type="button" onClick={() => { cancel(); clearMessages(); }} className="text-xs font-semibold rounded-full bg-grass-100 text-grass-800 px-3 py-2 hover:bg-grass-200">
                {c.assistant.clear}
              </button>
            </div>
          </div>

          {/* transcript */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4">
            {messages.length === 0 && (
              <div className="h-full grid place-items-center text-center">
                <div className="space-y-4 max-w-md">
                  <div className="size-14 mx-auto rounded-full bg-grass-800 grid place-items-center">
                    <LeafIcon className="size-7 text-sun-500" />
                  </div>
                  <p className="text-grass-800">{c.assistant.idle}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {c.assistant.suggestions.map((s) => (
                      <button key={s} type="button" onClick={() => void send(s)} className="text-xs rounded-full glass px-3 py-2 text-grass-900 lift-card">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col animate-in fade-in slide-in-from-bottom-1 duration-300 ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className="text-[10px] uppercase tracking-widest text-grass-600 mb-1">
                  {m.role === "user" ? c.assistant.you : c.assistant.ai} ·{" "}
                  {new Date(m.at).toLocaleTimeString(langMeta[lang].locale, { hour: "2-digit", minute: "2-digit" })}
                </div>
                {m.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-grass-800 text-grass-50 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
                    {m.content}
                  </div>
                ) : (
                  <div className={`max-w-[92%] text-grass-900 text-sm md:text-base leading-relaxed whitespace-pre-wrap ${isLatin ? "" : ""}`}>
                    {m.content || <span className="inline-flex gap-1 text-grass-600">
                      <span className="animate-pulse">●</span><span className="animate-pulse [animation-delay:150ms]">●</span><span className="animate-pulse [animation-delay:300ms]">●</span>
                    </span>}
                  </div>
                )}
              </div>
            ))}

            {interim && (
              <div className="flex flex-col items-end opacity-60">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-grass-100 text-grass-800 px-4 py-2.5 text-sm italic">{interim}</div>
              </div>
            )}
          </div>

          {error && <p role="alert" className="px-5 pb-2 text-sm text-destructive">{error}</p>}
          {!supported && <p className="px-5 pb-2 text-xs text-grass-600">{c.assistant.unsupported}</p>}

          {/* composer */}
          <form
            onSubmit={(e) => { e.preventDefault(); void send(input); }}
            className="border-t border-grass-800/10 p-3 md:p-4 flex items-end gap-2 bg-white/40"
          >
            <button
              type="button"
              onClick={() => (listening ? stop() : start())}
              disabled={!supported}
              aria-label={listening ? c.assistant.stopMic : c.assistant.mic}
              className={`relative size-12 shrink-0 grid place-items-center rounded-full transition ripple-btn disabled:opacity-40 ${
                listening ? "bg-destructive text-white" : "bg-grass-800 text-grass-50"
              }`}
            >
              {listening && <span className="absolute inset-0 rounded-full bg-destructive/40 animate-ping" />}
              <span className="relative">{listening ? <StopIcon className="size-5" /> : <MicIcon className="size-5" />}</span>
            </button>

            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(input); }
              }}
              placeholder={c.assistant.placeholder}
              className="flex-1 resize-none max-h-32 bg-white/80 ring-1 ring-grass-800/15 rounded-2xl px-4 py-3 text-sm text-grass-900 placeholder:text-grass-600/60 focus:outline-none focus:ring-2 focus:ring-grass-600"
            />

            <button
              type="submit"
              disabled={status === "processing" || !input.trim()}
              aria-label={c.assistant.send}
              className="size-12 shrink-0 grid place-items-center rounded-full bg-sun-500 text-grass-900 ripple-btn disabled:opacity-40"
            >
              <SendIcon className="size-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
