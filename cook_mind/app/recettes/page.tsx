import { Metadata } from "next";
import { getAllRecipes } from "@/actions/getallRecipes";
import RecettesClient from "./content";

export const metadata: Metadata = { title: "Recettes — CookMind" };

export default async function RecettesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string }>;
}) {
  const { search, type } = await searchParams;
  const recipes = await getAllRecipes(search, type);

  return <RecettesClient recipes={recipes} search={search ?? ""} type={type ?? "all"} />;
}