import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const requestSchema = z.object({
  imageDataUrl: z.string().regex(/^data:image\/(jpeg|jpg|png|webp);base64,/, "A valid image is required").max(4_500_000),
});

const analysisSchema = z.object({
  soilType: z.string().min(1).max(120),
  moistureContent: z.string().min(1).max(120),
  features: z.array(z.string().min(1).max(180)).min(1).max(5),
});

function responseMessage(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object" && "error" in value) {
    const error = value.error;
    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  }
  return fallback;
}

export const Route = createFileRoute("/api/capture-analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authorization = request.headers.get("authorization");
        const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
        const supabaseUrl = process.env.SUPABASE_URL;
        const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        const apiKey = process.env.LOVABLE_API_KEY;

        if (!token || !supabaseUrl || !publishableKey) {
          return new Response("Sign in is required to analyze a capture", { status: 401 });
        }
        if (!apiKey) return new Response("AI is not configured", { status: 500 });

        const authClient = createClient(supabaseUrl, publishableKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: userData, error: userError } = await authClient.auth.getUser(token);
        if (userError || !userData.user) return new Response("Invalid session", { status: 401 });

        const parsed = requestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("A valid captured image is required", { status: 400 });

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "google/gemini-3.7-flash",
            messages: [
              {
                role: "system",
                content:
                  "You are a careful agricultural image analyst. Estimate visible soil or sand type, moisture content as a visual range, and notable image features. Never claim that a photo replaces a laboratory test or moisture sensor.",
              },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text:
                      'Analyze this field image and return ONLY valid JSON with this exact shape: {"soilType":"...","moistureContent":"...","features":["...","..."]}. Use concise farmer-friendly language. If soil is not clearly visible, say "Not clear from image" rather than guessing.',
                  },
                  { type: "image_url", image_url: { url: parsed.data.imageDataUrl } },
                ],
              },
            ],
          }),
        });

        if (!upstream.ok) {
          const detail = await upstream.text().catch(() => "");
          return new Response(responseMessage(detail, "Image analysis failed"), { status: upstream.status });
        }

        const result = (await upstream.json()) as { choices?: { message?: { content?: string } }[] };
        const content = result.choices?.[0]?.message?.content?.trim() ?? "";
        const jsonText = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
        let analysis: z.infer<typeof analysisSchema>;
        try {
          analysis = analysisSchema.parse(JSON.parse(jsonText));
        } catch {
          return new Response("The image analysis returned an unreadable result", { status: 502 });
        }

        return Response.json({ analysis });
      },
    },
  },
});