import { Metadata } from "next";
import Inscription from "./content";

export const metadata: Metadata = { title: "Inscription — CookMind" };

export default function InscriptionPage() {
  return <Inscription />;
}