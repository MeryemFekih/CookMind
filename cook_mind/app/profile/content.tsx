"use client";

import { updateProfile } from "@/actions/updateProfile";
import { deleteProfile } from "@/actions/deleteProfile";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const INTOLERANCES = [
  { value: "gluten", label: "Gluten" },
  { value: "lactose", label: "Lactose" },
  { value: "nuts", label: "Fruits à coque" },
  { value: "eggs", label: "Œufs" },
  { value: "fish", label: "Poisson" },
  { value: "shellfish", label: "Crustacés" },
  { value: "soy", label: "Soja" },
  { value: "pork", label: "Porc" },
];

type Profile = {
  id: string;
  username: string;
  gender: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  objective: string;
  diet_type: string;
  intolerances: string;
  daily_calories_target: number;
};

export default function ProfilClient({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentIntolerances = profile.intolerances
    ? profile.intolerances.split(",").filter(Boolean)
    : [];

  const [selectedIntolerances, setSelectedIntolerances] = useState<string[]>(currentIntolerances);

  const toggleIntolerance = (value: string) => {
    setSelectedIntolerances((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    selectedIntolerances.forEach((i) => formData.append("intolerances", i));

    const result = await updateProfile(formData);
    setLoading(false);

    if (!result.success) {
      setError(result.message ?? "Erreur.");
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteProfile();
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <span className="text-lg font-black text-gray-900 tracking-tight">
            Cook<span className="text-green-600">Mind</span>
          </span>
        </div>
        <Link href="/dashboard"
          className="text-sm text-gray-500 hover:text-green-600 font-medium transition-colors">
          ← Retour au dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Mon profil</h1>
          <p className="text-sm text-gray-400 mt-1">
            Modifiez vos informations — vos calories seront recalculées automatiquement.
          </p>
        </div>

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-6">
            ✅ Profil mis à jour avec succès !
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">

          {/* Identity */}
          <Section title="Informations générales">
            <Field label="Nom d'utilisateur" name="username" type="text"
              defaultValue={profile.username} required />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Genre" name="gender" defaultValue={profile.gender} required
                options={[
                  { value: "male", label: "Homme" },
                  { value: "female", label: "Femme" },
                ]} />
              <Field label="Âge" name="age" type="number"
                defaultValue={String(profile.age)} required min="10" max="100" />
            </div>
          </Section>

          {/* Physical */}
          <Section title="Données physiques">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Taille (cm)" name="height_cm" type="number"
                defaultValue={String(profile.height_cm)} required min="100" max="250" />
              <Field label="Poids (kg)" name="weight_kg" type="number"
                defaultValue={String(profile.weight_kg)} required min="30" max="300" step="0.1" />
            </div>
            <Select label="Niveau d'activité" name="activity_level"
              defaultValue={profile.activity_level} required
              options={[
                { value: "sedentary", label: "Sédentaire" },
                { value: "light", label: "Léger — 1 à 3 fois / semaine" },
                { value: "moderate", label: "Modéré — 3 à 5 fois / semaine" },
                { value: "active", label: "Actif — 6 à 7 fois / semaine" },
                { value: "very_active", label: "Très actif — sport intense quotidien" },
              ]} />
          </Section>

          {/* Goals */}
          <Section title="Objectifs & régime">
            <Select label="Objectif" name="objective"
              defaultValue={profile.objective} required
              options={[
                { value: "weight_loss", label: "Perte de poids (−500 kcal/j)" },
                { value: "mass_gain", label: "Prise de masse (+300 kcal/j)" },
                { value: "energy", label: "Maintien & énergie" },
              ]} />
            <Select label="Type de régime" name="diet_type"
              defaultValue={profile.diet_type} required
              options={[
                { value: "omnivore", label: "Omnivore" },
                { value: "vegetarian", label: "Végétarien" },
                { value: "vegan", label: "Végétalien (vegan)" },
                { value: "keto", label: "Kéto" },
                { value: "paleo", label: "Paléo" },
              ]} />
          </Section>

          {/* Intolerances */}
          <Section title="Intolérances alimentaires">
            <div className="grid grid-cols-2 gap-2">
              {INTOLERANCES.map((item) => (
                <label key={item.value}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors
                    ${selectedIntolerances.includes(item.value)
                      ? "border-green-400 bg-green-50 text-green-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-green-200"}`}>
                  <input
                    type="checkbox"
                    checked={selectedIntolerances.includes(item.value)}
                    onChange={() => toggleIntolerance(item.value)}
                    className="accent-green-600 w-4 h-4"
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* Calories preview */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-400 font-medium">Calories journalières actuelles</p>
              <p className="text-2xl font-black text-orange-600">{profile.daily_calories_target} kcal</p>
            </div>
            <span className="text-3xl">🔥</span>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors shadow-sm"
          >
            {loading ? "Mise à jour…" : "Sauvegarder les modifications"}
          </button>
        </form>

        {/* Danger zone */}
        <div className="mt-10 border border-red-100 rounded-2xl p-6 bg-red-50">
          <h2 className="text-sm font-bold text-red-600 mb-1">Zone dangereuse</h2>
          <p className="text-xs text-red-400 mb-4">
            La suppression de votre compte est irréversible. Toutes vos recettes et données seront perdues.
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-white border border-red-300 text-red-500 hover:bg-red-100 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Supprimer mon compte
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-red-700">
                Êtes-vous sûr ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
                >
                  {deleting ? "Suppression…" : "Oui, supprimer mon compte"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-white border border-gray-200 text-gray-500 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, name, type, defaultValue, required, min, max, step }: {
  label: string; name: string; type: string; defaultValue?: string;
  required?: boolean; min?: string; max?: string; step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input
        name={name} type={type} defaultValue={defaultValue}
        required={required} min={min} max={max} step={step}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
      />
    </div>
  );
}

function Select({ label, name, defaultValue, options, required }: {
  label: string; name: string; defaultValue?: string;
  required?: boolean; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <select
        name={name} defaultValue={defaultValue} required
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}