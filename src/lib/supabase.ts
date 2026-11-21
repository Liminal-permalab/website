"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null = null;

/** The Supabase client, or null while the site has no Supabase project configured (see .env.example). */
export function getSupabase(): SupabaseClient | null {
  if (!url || !key) return null;
  client ??= createClient(url, key);
  return client;
}

export type Member =
  | { status: "not-connected" }
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; email: string };

/** Who is signed in on this browser. This drives what a page shows; it does not protect anything by itself. */
export function useMember(): Member {
  const supabase = getSupabase();
  const [member, setMember] = useState<Member>({ status: "loading" });

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setMember(
        session?.user
          ? { status: "signed-in", email: session.user.email ?? "" }
          : { status: "signed-out" },
      );
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  return supabase ? member : { status: "not-connected" };
}
