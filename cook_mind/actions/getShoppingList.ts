"use server";

import { createSupabaseServerClient } from "@/supabase/server";
import supabaseAdmin from "@/supabase/admin";

export async function getUserRecipesForShopping() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabaseAdmin
    .from("recipes")
    .select("id, title, type, servings, ingredients")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ getUserRecipesForShopping error:", error);
    return [];
  }

  return data ?? [];
}