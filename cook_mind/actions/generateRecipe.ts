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
}

interface OpenAIResult {
  title: string;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    vitamins?: string[];
    minerals?: string[];
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

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("intolerances, goal")
      .eq("id", user.id)
      .single();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un chef nutritionniste. Réponds en JSON strict." },
        {
          role: "user",
          content: `Recette pour ${formData.nbPers} pers. Ingrédients: ${formData.ingredients}. 
          Profil: ${profile?.intolerances || 'Aucune'}, Objectif: ${profile?.goal || 'Équilibré'}.
          Format: { "title": "", "ingredients": [], "instructions": [], "nutrition": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 } }`
        }
      ],
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0].message.content;
    if (!rawContent) throw new Error("L'IA n'a pas renvoyé de contenu.");
    
    const recipeJson = JSON.parse(rawContent) as OpenAIResult;


const { error: dbError } = await supabaseAdmin.from("recipes").insert([
  {
    user_id: user.id,
    title: recipeJson.title,
    servings: formData.nbPers, // Ta colonne servings (int2)
    ingredients: recipeJson.ingredients, // Ta colonne ingredients (jsonb)
    steps: recipeJson.instructions.join("\n"), // Ta colonne steps (text)
    // On utilise ai_prompt_used pour stocker l'analyse nutritionnelle 
    // en attendant, pour ne pas perdre l'info
    ai_prompt_used: JSON.stringify(recipeJson.nutrition), 
  },
]);

    if (dbError) throw dbError;

    revalidatePath("/generate-recipe"); 
    return { success: true, data: recipeJson };

  } catch (error: any) {
    console.error("Erreur createRecipe:", error);
    return { success: false, error: error.message };
  }
}