import { redirect } from "next/navigation";
import { getProfile } from "@/actions/getProfile";
import { getRecipes } from "@/actions/getRecipes";
import DashboardClient from "./content";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — CookMind" };

export default async function DashboardPage() {
  const profile = await getProfile();

  if (!profile) redirect("/connexion");

  const recipes = await getRecipes();

  return <DashboardClient profile={profile} recipes={recipes} />;
}