"use server";

import { createSupabaseServerClient } from "@/supabase/server";
import supabaseAdmin from "@/supabase/admin";
import { redirect } from "next/navigation";

export async function deleteProfile() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "Non authentifié." };
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("❌ Delete error:", error);
    return { success: false, message: "Erreur suppression: " + error.message };
  }

  await supabase.auth.signOut();
  redirect("/");
}