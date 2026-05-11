import { createSupabaseServerClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import RecipeContent from "./content";
import { getRecipes } from "@/actions/generateRecipe";

export default async function GenerateRecipePage() {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));

  if (!user) {
    redirect("/login");
  }

  const initialRecipes = await getRecipes();

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <RecipeContent initialRecipes={initialRecipes} />
      </div>
    </main>
  );
}