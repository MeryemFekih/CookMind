"use server";

import supabaseAdmin from "@/supabase/admin";

export async function getAllRecipes(search?: string, type?: string) {
  let query = supabaseAdmin
    .from("recipes")
    .select(`
      *,
      nutrition_analyses(*),
      profiles(username)
    `)
    .order("created_at", { ascending: false });

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ getAllRecipes error:", error);
    return [];
  }

  // Normalize nutrition_analyses from array to single object
  const normalized = (data ?? []).map((recipe) => {
    const nutrition = Array.isArray(recipe.nutrition_analyses)
      ? recipe.nutrition_analyses[0] ?? null
      : recipe.nutrition_analyses ?? null;

    console.log(`📊 Recipe: ${recipe.title} | Nutrition:`, nutrition);

    return {
      ...recipe,
      nutrition_analyses: nutrition,
    };
  });

  if (search && search.trim() !== "") {
    const term = search.toLowerCase();
    return normalized.filter((recipe) => {
      const inTitle = recipe.title?.toLowerCase().includes(term);
      const inIngredients = JSON.stringify(recipe.ingredients ?? "").toLowerCase().includes(term);
      return inTitle || inIngredients;
    });
  }

  return normalized;
}