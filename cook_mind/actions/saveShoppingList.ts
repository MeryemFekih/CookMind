"use server";

import { createSupabaseServerClient } from "@/supabase/server";
import supabaseAdmin from "@/supabase/admin";

export async function saveShoppingList(
  name: string,
  recipeIds: string[]
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Non authentifié." };

  if (!recipeIds || recipeIds.length === 0) {
    return { success: false, message: "Aucune recette sélectionnée." };
  }

  const { data: recipes, error: fetchError } = await supabaseAdmin
    .from("recipes")
    .select("id, ingredients")
    .in("id", recipeIds);

  if (fetchError || !recipes) {
    console.error("❌ Fetch recipes error:", fetchError);
    return { success: false, message: "Erreur lors de la récupération des recettes." };
  }

  const mergedMap: Record<string, { quantity: number; unit: string }> = {};

  for (const recipe of recipes) {
    const ingredients = (() => {
      if (!recipe.ingredients) return [];
      if (typeof recipe.ingredients === "string") {
        try { return JSON.parse(recipe.ingredients); }
        catch { return []; }
      }
      return recipe.ingredients;
    })();

    for (const ing of ingredients) {
      if (!ing.name) continue;
      const key = `${ing.name.toLowerCase().trim()}__${ing.unit ?? ""}`;
      const qty = parseFloat(String(ing.quantity)) || 0;
      if (mergedMap[key]) {
        mergedMap[key].quantity += qty;
      } else {
        mergedMap[key] = { quantity: qty, unit: ing.unit ?? "" };
      }
    }
  }

  const items = Object.entries(mergedMap).map(([key, val]) => ({
    name: key.split("__")[0],
    quantity: Math.round(val.quantity * 10) / 10,
    unit: val.unit,
    checked: false,
  }));

  console.log("📦 Saving:", { name, recipe_ids: recipeIds.join(","), items });

  const { error } = await supabaseAdmin
    .from("shopping_lists")
    .insert([{
      user_id: user.id,
      name,
      recipe_ids: recipeIds.join(","),
      items,
    }]);

  if (error) {
    console.error("❌ saveShoppingList error:", error);
    return { success: false, message: error.message };
  }

  console.log("✅ Shopping list saved!");
  return { success: true };
}