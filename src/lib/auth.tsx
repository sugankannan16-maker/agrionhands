import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "buyer" | "seller" | "admin";

/** Current auth user, kept in sync with auth state changes. */
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!alive) return;
      setUser(data.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        qc.invalidateQueries();
      }
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [qc]);

  return { user, loading };
}

export function useRole() {
  const { user, loading } = useAuthUser();
  const q = useQuery({
    queryKey: ["role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      if (error) throw error;
      const roles = (data ?? []).map((r) => r.role as Role);
      return roles.includes("seller") ? "seller" : roles.includes("buyer") ? "buyer" : null;
    },
  });
  return { role: (q.data ?? null) as Role | null, loading: loading || q.isLoading, user };
}

export function useProfile() {
  const { user } = useAuthUser();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

/** Blocks a page unless the signed-in account has the required role. */
export function RoleGate({ role, children }: { role: Role; children: ReactNode }) {
  const { role: current, loading } = useRole();

  if (loading) {
    return <div className="p-10 text-center text-grass-700 animate-pulse">Loading your workspace…</div>;
  }
  if (current !== role) {
    const other = role === "buyer" ? "seller" : "buyer";
    return (
      <div className="max-w-md mx-auto glass rounded-3xl p-8 text-center my-16">
        <h2 className="text-2xl text-grass-900" style={{ fontFamily: "var(--font-display)" }}>
          {role === "buyer" ? "Buyer" : "Seller"} access required
        </h2>
        <p className="text-sm text-grass-700 mt-3">
          This area is for {role} accounts. You are signed in with a {current ?? "different"} account.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          <Link
            to={other === "buyer" ? "/buyer/dashboard" : "/seller/dashboard"}
            className="ripple-btn bg-grass-800 text-grass-50 text-sm py-2 px-4 rounded-full"
          >
            Go to my dashboard
          </Link>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="text-sm py-2 px-4 rounded-full glass text-grass-800"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export async function signOutAndGoHome() {
  await supabase.auth.signOut();
  window.location.href = "/";
}
