import { Metadata } from "next";
import { createSupabaseServerClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { getUserRecipesForShopping } from "@/actions/getShoppingList";
import CoursesClient from "./content";

export const metadata: Metadata = { title: "Liste de courses — CookMind" };

export default async function CoursesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  const recipes = await getUserRecipesForShopping();

  return <CoursesClient recipes={recipes} />;
}