"use server";

import { createSupabaseServerClient } from "@/supabase/server";
import supabaseAdmin from "@/supabase/admin";

export async function getRecipes() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabaseAdmin
    .from("recipes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ getRecipes error:", error);
    return [];
  }

  return data ?? [];
}