"use server";

import { createSupabaseServerClient } from "@/supabase/server";
import supabaseAdmin from "@/supabase/admin";

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "Non authentifié." };
  }

  const username = formData.get("username") as string;
  const gender = formData.get("gender") as string;
  const age = parseInt(formData.get("age") as string);
  const height_cm = parseFloat(formData.get("height_cm") as string);
  const weight_kg = parseFloat(formData.get("weight_kg") as string);
  const activity_level = formData.get("activity_level") as string;
  const objective = formData.get("objective") as string;
  const diet_type = formData.get("diet_type") as string;
  const intolerances = formData.getAll("intolerances").join(",");

  if (!username || !gender || !age || !height_cm || !weight_kg || !activity_level || !objective || !diet_type) {
    return { success: false, message: "Tous les champs sont obligatoires." };
  }

  const BMR = gender === "male"
    ? 88.36 + 13.4 * weight_kg + 4.8 * height_cm - 5.7 * age
    : 447.6 + 9.2 * weight_kg + 3.1 * height_cm - 4.3 * age;

  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const TDEE = BMR * (multipliers[activity_level] ?? 1.2);
  const daily_calories_target = Math.round(
    objective === "weight_loss" ? TDEE - 500 :
    objective === "mass_gain"   ? TDEE + 300 :
    TDEE
  );

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      username,
      gender,
      age,
      height_cm,
      weight_kg,
      activity_level,
      objective,
      diet_type,
      intolerances,
      daily_calories_target,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("❌ Update error:", error);
    return { success: false, message: "Erreur mise à jour: " + error.message };
  }

  return { success: true };
}