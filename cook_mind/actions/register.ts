"use server";

import supabase from "@/supabase/client";
import supabaseAdmin from "@/supabase/admin";

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;
  const gender = formData.get("gender") as string;
  const age = parseInt(formData.get("age") as string);
  const height_cm = parseFloat(formData.get("height_cm") as string);
  const weight_kg = parseFloat(formData.get("weight_kg") as string);
  const activity_level = formData.get("activity_level") as string;
  const objective = formData.get("objective") as string;
  const diet_type = formData.get("diet_type") as string;
  const intolerances = formData.getAll("intolerances").join(",");

  console.log("📋 Received:", { email, username, gender, age, height_cm, weight_kg, activity_level, objective, diet_type, intolerances });

  if (!email || !password || !username || !gender || !age || !height_cm || !weight_kg || !activity_level || !objective || !diet_type) {
    const missing = { email, password, username, gender, age, height_cm, weight_kg, activity_level, objective, diet_type };
    console.error("❌ Missing:", Object.entries(missing).filter(([, v]) => !v).map(([k]) => k));
    return { success: false, message: "Tous les champs sont obligatoires." };
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    console.error("❌ SignUp error:", error);
    return { success: false, message: error?.message ?? "Erreur création compte." };
  }

  console.log("✅ Auth user created:", data.user.id);

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

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: data.user.id,
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
    });

  if (profileError) {
    console.error("❌ Upsert error:", profileError);
    return { success: false, message: "Erreur profil: " + profileError.message };
  }

  console.log("✅ Profile saved!");
  return { success: true };
}