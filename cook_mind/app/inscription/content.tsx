"use client";

import { register } from "@/actions/register";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const steps = ["Compte", "Physique", "Objectifs"];

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

type FormState = {
  // Step 0
  username: string;
  email: string;
  password: string;
  // Step 1
  gender: string;
  age: string;
  height_cm: string;
  weight_kg: string;
  activity_level: string;
  // Step 2
  objective: string;
  diet_type: string;
  intolerances: string[];
};

const initialState: FormState = {
  username: "", email: "", password: "",
  gender: "", age: "", height_cm: "", weight_kg: "", activity_level: "",
  objective: "", diet_type: "", intolerances: [],
};

export default function Inscription() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleIntolerance = (value: string) =>
    setForm((prev) => ({
      ...prev,
      intolerances: prev.intolerances.includes(value)
        ? prev.intolerances.filter((i) => i !== value)
        : [...prev.intolerances, value],
    }));

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.username.trim()) return "Le nom d'utilisateur est requis.";
      if (!form.email.trim()) return "L'email est requis.";
      if (form.password.length < 8) return "Le mot de passe doit faire au moins 8 caractères.";
    }
    if (step === 1) {
      if (!form.gender) return "Le genre est requis.";
      if (!form.age) return "L'âge est requis.";
      if (!form.height_cm) return "La taille est requise.";
      if (!form.weight_kg) return "Le poids est requis.";
      if (!form.activity_level) return "Le niveau d'activité est requis.";
    }
    if (step === 2) {
      if (!form.objective) return "L'objectif est requis.";
      if (!form.diet_type) return "Le type de régime est requis.";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError(null);
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "intolerances") {
        (value as string[]).forEach((v) => formData.append("intolerances", v));
      } else {
        formData.append(key, value as string);
      }
    });

    const result = await register(formData);
    setLoading(false);
    if (!result.success) {
      setError(result.message ?? "Une erreur est survenue.");
    } else {
      router.push("/connexion?registered=1");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-10">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-700 tracking-tight">🍴 CookMind</h1>
          <p className="text-sm text-gray-400 mt-1">Créez votre compte personnalisé</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-start justify-between mb-8">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-col items-center flex-1 relative">
              {i < steps.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-0.5 z-0 transition-all ${i < step ? "bg-green-500" : "bg-gray-200"}`} />
              )}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all border-2
                ${i < step ? "bg-green-500 border-green-500 text-white" :
                  i === step ? "bg-white border-green-600 text-green-600" :
                  "bg-gray-100 border-gray-200 text-gray-400"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${i <= step ? "text-green-600" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        {/* Step 0 — Account */}
        {step === 0 && (
          <div className="space-y-4">
            <Field label="Nom d'utilisateur" placeholder="john_doe"
              value={form.username} onChange={(v) => update("username", v)} />
            <Field label="Email" type="email" placeholder="john@exemple.com"
              value={form.email} onChange={(v) => update("email", v)} />
            <Field label="Mot de passe" type="password" placeholder="Minimum 8 caractères"
              value={form.password} onChange={(v) => update("password", v)} />
          </div>
        )}

        {/* Step 1 — Physical */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Genre" value={form.gender} onChange={(v) => update("gender", v)}
                options={[
                  { value: "male", label: "Homme" },
                  { value: "female", label: "Femme" },
                ]} />
              <Field label="Âge" type="number" placeholder="25"
                value={form.age} onChange={(v) => update("age", v)} min="10" max="100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Taille (cm)" type="number" placeholder="175"
                value={form.height_cm} onChange={(v) => update("height_cm", v)} min="100" max="250" />
              <Field label="Poids (kg)" type="number" placeholder="70.5"
                value={form.weight_kg} onChange={(v) => update("weight_kg", v)} min="30" max="300" step="0.1" />
            </div>
            <Select label="Niveau d'activité" value={form.activity_level}
              onChange={(v) => update("activity_level", v)}
              options={[
                { value: "sedentary", label: "Sédentaire — bureau, peu de sport" },
                { value: "light", label: "Léger — 1 à 3 fois / semaine" },
                { value: "moderate", label: "Modéré — 3 à 5 fois / semaine" },
                { value: "active", label: "Actif — 6 à 7 fois / semaine" },
                { value: "very_active", label: "Très actif — sport intense quotidien" },
              ]} />
          </div>
        )}

        {/* Step 2 — Goals */}
        {step === 2 && (
          <div className="space-y-4">
            <Select label="Objectif principal" value={form.objective}
              onChange={(v) => update("objective", v)}
              options={[
                { value: "weight_loss", label: "Perte de poids (−500 kcal/j)" },
                { value: "mass_gain", label: "Prise de masse (+300 kcal/j)" },
                { value: "energy", label: "Maintien & énergie" },
              ]} />
            <Select label="Type de régime" value={form.diet_type}
              onChange={(v) => update("diet_type", v)}
              options={[
                { value: "omnivore", label: "Omnivore" },
                { value: "vegetarian", label: "Végétarien" },
                { value: "vegan", label: "Végétalien (vegan)" },
                { value: "keto", label: "Kéto" },
                { value: "paleo", label: "Paléo" },
              ]} />
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Intolérances alimentaires
              </label>
              <p className="text-xs text-gray-400 mb-3">Cochez tout ce qui s'applique</p>
              <div className="grid grid-cols-2 gap-2">
                {INTOLERANCES.map((item) => (
                  <label key={item.value}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors
                      ${form.intolerances.includes(item.value)
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:border-green-300"}`}>
                    <input
                      type="checkbox"
                      checked={form.intolerances.includes(item.value)}
                      onChange={() => toggleIntolerance(item.value)}
                      className="accent-green-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-xs leading-relaxed">
              Vos calories journalières seront calculées automatiquement via la formule de Harris-Benedict.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={() => { setError(null); setStep((s) => s - 1); }}
              className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              ← Retour
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={step < steps.length - 1 ? handleNext : handleSubmit}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-semibold transition-colors"
          >
            {loading ? "Création…" : step < steps.length - 1 ? "Continuer →" : "Créer mon compte"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-green-600 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type = "text", placeholder, value, onChange, min, max, step }: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void;
  min?: string; max?: string; step?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min} max={max} step={step}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
      >
        <option value="">— Sélectionner —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}