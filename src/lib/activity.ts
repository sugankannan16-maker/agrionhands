import { supabase } from "@/integrations/supabase/client";

export type ActivityCategory =
  | "chat"
  | "capture"
  | "prediction"
  | "weather"
  | "marketplace"
  | "order"
  | "other";

export const activityCategories: { value: ActivityCategory; label: string; icon: string }[] = [
  { value: "chat", label: "Chat", icon: "💬" },
  { value: "capture", label: "Photos", icon: "📷" },
  { value: "prediction", label: "AI predictions", icon: "🌱" },
  { value: "weather", label: "Weather", icon: "⛅" },
  { value: "marketplace", label: "Marketplace", icon: "🛒" },
  { value: "order", label: "Orders", icon: "📦" },
  { value: "other", label: "Other", icon: "•" },
];

export type ActivityInput = {
  category: ActivityCategory;
  title: string;
  detail?: string;
  meta?: Record<string, unknown>;
  link?: string;
};

/**
 * Records one user activity. Silently no-ops for signed-out visitors so that
 * public pages keep working exactly as before.
 */
export async function logActivity(entry: ActivityInput): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;
    await supabase.from("activity_log").insert({
      user_id: user.id,
      category: entry.category,
      title: entry.title.slice(0, 300),
      detail: (entry.detail ?? "").slice(0, 2000),
      meta: (entry.meta ?? {}) as never,
      link: entry.link ?? null,
    });
  } catch {
    /* history logging must never break a user flow */
  }
}
