"use client";

import { logout } from "@/actions/logout";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

type Recipe = {
  id: string;
  title: string;
  type: string;
  servings: number;
  prep_time_min: number;
  cook_time_min: number;
  created_at: string;
};

const objectiveLabel: Record<string, string> = {
  weight_loss: "Perte de poids",
  mass_gain: "Prise de masse",
  energy: "Maintien & énergie",
};

const activityLabel: Record<string, string> = {
  sedentary: "Sédentaire",
  light: "Léger",
  moderate: "Modéré",
  active: "Actif",
  very_active: "Très actif",
};

const typeEmoji: Record<string, string> = {
  starter: "🥗",
  main: "🍽️",
  dessert: "🍰",
  snack: "🥪",
};

export default function DashboardClient({ profile, recipes }: {
  profile: Profile;
  recipes: Recipe[];
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/connexion");
  };

  const intolerancesList = profile.intolerances
    ? profile.intolerances.split(",").filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🍴</span>
          <span className="text-lg font-bold text-green-700 tracking-tight">CookMind</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/profil"
            className="text-sm text-gray-500 hover:text-green-600 font-medium transition-colors">
            Mon profil
          </Link>
          <Link href="/recettes/nouvelle"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            + Nouvelle recette
          </Link>
          <button onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Bonjour, <span className="text-green-600">{profile.username}</span> 👋
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Voici votre tableau de bord nutritionnel</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon="🔥"
            label="Calories / jour"
            value={`${profile.daily_calories_target} kcal`}
            color="bg-orange-50 border-orange-100"
            textColor="text-orange-600"
          />
          <StatCard
            icon="🎯"
            label="Objectif"
            value={objectiveLabel[profile.objective] ?? profile.objective}
            color="bg-blue-50 border-blue-100"
            textColor="text-blue-600"
          />
          <StatCard
            icon="⚡"
            label="Activité"
            value={activityLabel[profile.activity_level] ?? profile.activity_level}
            color="bg-purple-50 border-purple-100"
            textColor="text-purple-600"
          />
          <StatCard
            icon="📋"
            label="Recettes créées"
            value={`${recipes.length}`}
            color="bg-green-50 border-green-100"
            textColor="text-green-600"
          />
        </div>

        {/* Profile summary + intolerances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

          {/* Body stats */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Mes données
            </h2>
            <div className="space-y-3">
              <Row label="Âge" value={`${profile.age} ans`} />
              <Row label="Taille" value={`${profile.height_cm} cm`} />
              <Row label="Poids" value={`${profile.weight_kg} kg`} />
              <Row label="Genre" value={profile.gender === "male" ? "Homme" : "Femme"} />
            </div>
            <Link href="/profil"
              className="mt-5 block text-center text-xs text-green-600 font-semibold hover:underline">
              Modifier mon profil →
            </Link>
          </div>

          {/* Diet */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Mon régime
            </h2>
            <div className="space-y-3">
              <Row label="Type" value={profile.diet_type} />
              <Row label="Objectif" value={objectiveLabel[profile.objective] ?? profile.objective} />
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Intolérances</p>
              {intolerancesList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {intolerancesList.map((i) => (
                    <span key={i}
                      className="bg-red-50 text-red-500 border border-red-100 text-xs px-2 py-0.5 rounded-full font-medium">
                      {i}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-300">Aucune intolérance</span>
              )}
            </div>
          </div>

          {/* Macros estimate */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Macros estimés / jour
            </h2>
            <MacroBar
              label="Protéines"
              grams={Math.round((profile.daily_calories_target * 0.30) / 4)}
              color="bg-blue-400"
              percent={30}
            />
            <MacroBar
              label="Glucides"
              grams={Math.round((profile.daily_calories_target * 0.40) / 4)}
              color="bg-yellow-400"
              percent={40}
            />
            <MacroBar
              label="Lipides"
              grams={Math.round((profile.daily_calories_target * 0.30) / 9)}
              color="bg-red-400"
              percent={30}
            />
          </div>
        </div>

        {/* Recipes list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-gray-800">Mes recettes</h2>
            <Link href="/recettes/nouvelle"
              className="text-sm text-green-600 font-semibold hover:underline">
              + Nouvelle recette
            </Link>
          </div>

          {recipes.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🍳</div>
              <p className="text-gray-400 text-sm">Vous n'avez pas encore de recettes.</p>
              <Link href="/recettes/nouvelle"
                className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                Créer ma première recette
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe) => (
                <Link key={recipe.id} href={`/recettes/${recipe.id}`}
                  className="border border-gray-100 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{typeEmoji[recipe.type] ?? "🍴"}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {recipe.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm group-hover:text-green-600 transition-colors line-clamp-2">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span>👥 {recipe.servings} pers.</span>
                    <span>⏱ {(recipe.prep_time_min ?? 0) + (recipe.cook_time_min ?? 0)} min</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-2">
                    {new Date(recipe.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, textColor }: {
  icon: string; label: string; value: string; color: string; textColor: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${color}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      <p className={`text-sm font-bold ${textColor}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-gray-700">{value}</span>
    </div>
  );
}

function MacroBar({ label, grams, color, percent }: {
  label: string; grams: number; color: string; percent: number;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700">{grams}g</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}