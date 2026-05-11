import { redirect } from "next/navigation";
import { getProfile } from "@/actions/getProfile";
import { Metadata } from "next";
import ProfilClient from "./content";

export const metadata: Metadata = { title: "Mon profil — CookMind" };

export default async function ProfilPage() {
  const profile = await getProfile();
  if (!profile) redirect("/connexion");
  return <ProfilClient profile={profile} />;
}