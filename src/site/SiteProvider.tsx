import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Weather } from "@/components/nature/NatureBackground";
import { t, type Lang, type Copy } from "./content";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: number;
};

type SiteValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  c: Copy;
  isLatin: boolean;
  weather: Weather;
  setWeather: (w: Weather) => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  clearMessages: () => void;
};

const SiteContext = createContext<SiteValue | null>(null);

const LANG_KEY = "aoh.lang";
const WEATHER_KEY = "aoh.weather";
const CHAT_KEY = "aoh.chat";

export function SiteProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [weather, setWeatherState] = useState<Weather>("sunny");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Hydrate after mount so SSR markup matches.
  useEffect(() => {
    try {
      const l = localStorage.getItem(LANG_KEY) as Lang | null;
      if (l === "en" || l === "ta" || l === "hi") setLangState(l);
      const w = localStorage.getItem(WEATHER_KEY) as Weather | null;
      if (w) setWeatherState(w);
      const raw = sessionStorage.getItem(CHAT_KEY);
      if (raw) setMessages(JSON.parse(raw) as ChatMessage[]);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-60)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const setWeather = useCallback((w: Weather) => {
    setWeatherState(w);
    try {
      localStorage.setItem(WEATHER_KEY, w);
    } catch {
      /* ignore */
    }
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  const value = useMemo<SiteValue>(
    () => ({
      lang,
      setLang,
      c: t[lang] as Copy,
      isLatin: lang === "en",
      weather,
      setWeather,
      messages,
      setMessages,
      clearMessages,
    }),
    [lang, setLang, weather, setWeather, messages, clearMessages],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}
