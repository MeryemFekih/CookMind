"use server";

import { createSupabaseServerClient } from "@/supabase/server";
import supabaseAdmin from "@/supabase/admin";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RecipeFormData {
  ingredients: string;
  nbPers: number;
  mealType?: string;
}

interface OpenAIResult {
  title: string;
  ingredients: { name: string; quantity: string; unit: string }[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    vitamins?: number;
    minerals?: Record<string, number>;
  };
}

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

export async function createRecipe(formData: RecipeFormData) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Vous devez être connecté");

    // Fetch full profile for personalized prompt
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("intolerances, objective, diet_type, daily_calories_target, weight_kg, activity_level")
      .eq("id", user.id)
      .single();

    const prompt = `
      Tu es un chef nutritionniste. Génère une recette personnalisée en JSON strict.
      
      Paramètres:
      - Ingrédients disponibles: ${formData.ingredients}
      - Nombre de personnes: ${formData.nbPers}
      - Type de plat: ${formData.mealType ?? "main"}
      - Intolérances: ${profile?.intolerances || "Aucune"}
      - Objectif: ${profile?.objective || "Équilibré"}
      - Régime: ${profile?.diet_type || "Omnivore"}
      - Calories cibles/jour: ${profile?.daily_calories_target || 2000} kcal

      Réponds UNIQUEMENT avec ce format JSON:
      {
        "title": "Nom de la recette",
        "ingredients": [
          { "name": "nom", "quantity": "quantité", "unit": "unité" }
        ],
        "instructions": ["étape 1", "étape 2"],
        "nutrition": {
          "calories": 0,
          "protein": 0,
          "carbs": 0,
          "fat": 0,
          "fiber": 0,
          "vitamins": 0,
          "minerals": { "fer": 0, "calcium": 0, "zinc": 0 }
        }
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un chef nutritionniste. Réponds en JSON strict uniquement." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0].message.content;
    if (!rawContent) throw new Error("L'IA n'a pas renvoyé de contenu.");

    const recipeJson = JSON.parse(rawContent) as OpenAIResult;

    // Step 1 — save recipe
    const { data: savedRecipe, error: dbError } = await supabaseAdmin
      .from("recipes")
      .insert([{
        user_id: user.id,
        title: recipeJson.title,
        type: formData.mealType ?? "main",
        servings: formData.nbPers,
        ingredients: recipeJson.ingredients,
        steps: recipeJson.instructions.join("\n"),
        ai_prompt_used: prompt,
      }])
      .select()
      .single();

    if (dbError) {
      console.error("❌ Recipe insert error:", dbError);
      throw dbError;
    }

    console.log("✅ Recipe saved:", savedRecipe.id);

    // Step 2 — save nutrition analysis
    const { error: nutritionError } = await supabaseAdmin
      .from("nutrition_analyses")
      .insert([{
        recipe_id: savedRecipe.id,
        calories: recipeJson.nutrition.calories ?? 0,
        proteins_g: recipeJson.nutrition.protein ?? 0,
        carbs_g: recipeJson.nutrition.carbs ?? 0,
        fats_g: recipeJson.nutrition.fat ?? 0,
        fiber_g: recipeJson.nutrition.fiber ?? 0,
        vitamins: recipeJson.nutrition.vitamins ?? 0,
        minerals: recipeJson.nutrition.minerals ?? {},
        analyzed_at: new Date().toISOString(),
      }]);

    if (nutritionError) {
      console.error("❌ Nutrition insert error:", nutritionError);
      // Don't throw — recipe is saved, nutrition is optional
    } else {
      console.log("✅ Nutrition saved for recipe:", savedRecipe.id);
    }

    revalidatePath("/recettes");
    revalidatePath("/dashboard");

    return { success: true, data: recipeJson };

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("❌ createRecipe error:", message);
    return { success: false, error: message };
  }
}