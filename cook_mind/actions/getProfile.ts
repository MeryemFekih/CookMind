"use server";

import { createSupabaseServerClient } from "@/supabase/server";
import supabaseAdmin from "@/supabase/admin";

export async function getProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("❌ getProfile error:", profileError);
    return null;
  }

  return data;
}