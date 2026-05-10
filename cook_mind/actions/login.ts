"use server";

import { createSupabaseServerClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email et mot de passe requis." };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("❌ Login error:", error.message);
    return { success: false, message: "Email ou mot de passe incorrect." };
  }

  redirect("/dashboard");
}