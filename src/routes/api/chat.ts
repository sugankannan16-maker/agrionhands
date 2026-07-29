import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string };
type Body = { messages?: Msg[]; lang?: "en" | "ta" | "hi" };

const languageName = { en: "English", ta: "Tamil (தமிழ்)", hi: "Hindi (हिन्दी)" } as const;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
        const lang = body.lang && body.lang in languageName ? body.lang : "en";
        if (messages.length === 0) return new Response("Messages are required", { status: 400 });

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("AI is not configured", { status: 500 });

        const system = [
          "You are Agri AI, the multilingual voice assistant of 'Agri on Hands', an AI crop yield prediction and optimization platform based in Salem, Tamil Nadu, India.",
          "You help farmers with crop selection, soil health, fertilizer and irrigation schedules, pest and disease control, weather risk, yield prediction and market timing.",
          `Always reply in ${languageName[lang]}. Keep answers short, practical and friendly — 2 to 5 short sentences or a compact bullet list. Use local Indian units (acre, quintal, ₹).`,
          "Since answers may be read aloud, avoid tables, long code blocks and heavy markdown.",
        ].join(" ");

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            stream: true,
            messages: [{ role: "system", content: system }, ...messages],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 500;
          return new Response(detail || "AI request failed", { status });
        }

        // Re-emit only the text deltas as a plain text stream.
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";
        const stream = new TransformStream<Uint8Array, Uint8Array>({
          transform(chunk, controller) {
            buffer += decoder.decode(chunk, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const json = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
                const text = json.choices?.[0]?.delta?.content;
                if (text) controller.enqueue(encoder.encode(text));
              } catch {
                /* partial json, ignore */
              }
            }
          },
        });

        return new Response(upstream.body.pipeThrough(stream), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
