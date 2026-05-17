"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { logout } from "@/actions/logout";

type NutritionAnalysis = {
  calories: number | null;
  proteins_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  fiber_g: number | null;
  vitamins: number | null;
  minerals: Record<string, number> | null;
};

type Recipe = {
  id: string;
  title: string;
  type: string;
  servings: number;
  prep_time_min: number;
  cook_time_min: number;
  ingredients: { name: string; quantity: number; unit: string }[] | string | null;
  steps: string | null;
  created_at: string;
  nutrition_analyses: NutritionAnalysis | null;
  profiles: { username: string } | null;
};

const TYPE_OPTIONS = [
  { value: "all", label: "Tous", emoji: "🍴" },
  { value: "starter", label: "Entrées", emoji: "🥗" },
  { value: "main", label: "Plats", emoji: "🍽️" },
  { value: "dessert", label: "Desserts", emoji: "🍰" },
  { value: "snack", label: "Snacks", emoji: "🥪" },
];

const TYPE_LABEL: Record<string, string> = {
  starter: "Entrée",
  main: "Plat",
  dessert: "Dessert",
  snack: "Snack",
};

const TYPE_EMOJI: Record<string, string> = {
  starter: "🥗",
  main: "🍽️",
  dessert: "🍰",
  snack: "🥪",
};

export default function RecettesClient({
  recipes,
  search,
  type,
}: {
  recipes: Recipe[];
  search: string;
  type: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(search);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/connexion");
  };

  const updateParams = (newSearch: string, newType: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSearch) params.set("search", newSearch);
    else params.delete("search");
    if (newType && newType !== "all") params.set("type", newType);
    else params.delete("type");
    startTransition(() => router.push(`/recettes?${params.toString()}`));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams(searchValue, type);
  };

  const handleType = (newType: string) => {
    updateParams(searchValue, newType);
  };

  const handleClear = () => {
    setSearchValue("");
    updateParams("", "all");
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
        <div className="flex items-center gap-4">
          <Link href="/dashboard"
            className="text-sm text-gray-500 hover:text-green-600 font-medium transition-colors">
            Dashboard
          </Link>
          <Link href="/courses"
            className="text-sm text-gray-500 hover:text-green-600 font-medium transition-colors">
            🛒 Courses
          </Link>
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

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Toutes les recettes</h1>
          <p className="text-gray-400 text-sm mt-1">
            {recipes.length} recette{recipes.length !== 1 ? "s" : ""} trouvée{recipes.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Rechercher par nom ou ingrédient..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition shadow-sm"
            />
          </div>
          <button type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors shadow-sm">
            Rechercher
          </button>
          {(search || type !== "all") && (
            <button type="button" onClick={handleClear}
              className="border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium px-4 py-3 rounded-xl text-sm transition-colors">
              Effacer
            </button>
          )}
        </form>

        {/* Type filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleType(option.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all
                ${type === option.value
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-green-300 hover:text-green-600"
                }`}
            >
              <span>{option.emoji}</span>
              {option.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isPending && (
          <div className="text-center py-6 text-sm text-gray-400 animate-pulse">
            Chargement...
          </div>
        )}

        {/* Empty state */}
        {!isPending && recipes.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🍳</div>
            <p className="text-gray-400 text-base font-medium">Aucune recette trouvée.</p>
            <p className="text-gray-300 text-sm mt-1">Essayez un autre terme ou filtre.</p>
            <button onClick={handleClear}
              className="mt-6 bg-green-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-green-700 transition-colors">
              Voir toutes les recettes
            </button>
          </div>
        )}

        {/* Recipe grid */}
        {!isPending && recipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map((recipe) => {
              const hasNutrition = recipe.nutrition_analyses != null &&
                recipe.nutrition_analyses.calories != null;

              const ingredients = (() => {
                if (!recipe.ingredients) return [];
                if (typeof recipe.ingredients === "string") {
                  try { return JSON.parse(recipe.ingredients); }
                  catch { return []; }
                }
                return recipe.ingredients;
              })();

              return (
                <div key={recipe.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">

                  <div className="p-5 flex-1">

                    {/* Type badge */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{TYPE_EMOJI[recipe.type] ?? "🍴"}</span>
                      <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full font-semibold">
                        {TYPE_LABEL[recipe.type] ?? recipe.type}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-2">
                      {recipe.title}
                    </h3>

                    {/* Author */}
                    {recipe.profiles?.username && (
                      <p className="text-xs text-gray-400 mb-3">
                        par <span className="font-medium text-gray-500">{recipe.profiles.username}</span>
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      <span>👥 {recipe.servings} pers.</span>
                      <span>⏱ {(recipe.prep_time_min ?? 0) + (recipe.cook_time_min ?? 0)} min</span>
                    </div>

                    {/* Ingredient tags */}
                    {ingredients.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {ingredients.slice(0, 4).map((ing: { name: string }, i: number) => (
                          <span key={i}
                            className="bg-gray-50 border border-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                            {ing.name}
                          </span>
                        ))}
                        {ingredients.length > 4 && (
                          <span className="text-gray-300 text-xs px-1">
                            +{ingredients.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Nutrition quick summary */}
                    {hasNutrition && (
                      <div className="grid grid-cols-4 gap-1 bg-gray-50 rounded-xl p-3">
                        <NutriBadge label="Kcal" value={Math.round(recipe.nutrition_analyses!.calories ?? 0)} color="text-orange-500" />
                        <NutriBadge label="Prot." value={`${Math.round(recipe.nutrition_analyses!.proteins_g ?? 0)}g`} color="text-blue-500" />
                        <NutriBadge label="Gluc." value={`${Math.round(recipe.nutrition_analyses!.carbs_g ?? 0)}g`} color="text-yellow-500" />
                        <NutriBadge label="Lip." value={`${Math.round(recipe.nutrition_analyses!.fats_g ?? 0)}g`} color="text-red-400" />
                      </div>
                    )}
                  </div>

                  {/* Bottom button */}
                  <button
                    onClick={() => hasNutrition && setSelectedRecipe(recipe)}
                    disabled={!hasNutrition}
                    className={`w-full py-3 text-sm font-semibold border-t border-gray-100 transition-colors
                      ${!hasNutrition
                        ? "text-gray-300 cursor-default"
                        : "text-green-600 hover:bg-green-50"
                      }`}
                  >
                    {!hasNutrition ? "Analyse non disponible" : "📊 Voir l'analyse nutritionnelle"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span>{TYPE_EMOJI[selectedRecipe.type] ?? "🍴"}</span>
                  <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full font-semibold">
                    {TYPE_LABEL[selectedRecipe.type] ?? selectedRecipe.type}
                  </span>
                </div>
                <h2 className="text-lg font-black text-gray-900 leading-tight">
                  {selectedRecipe.title}
                </h2>
                {selectedRecipe.profiles?.username && (
                  <p className="text-xs text-gray-400 mt-1">
                    par <span className="font-medium">{selectedRecipe.profiles.username}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold ml-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Calories highlight */}
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-400 font-medium">Calories / portion</p>
                  <p className="text-3xl font-black text-orange-500">
                    {Math.round(selectedRecipe.nutrition_analyses!.calories ?? 0)}
                    <span className="text-base font-semibold ml-1">kcal</span>
                  </p>
                </div>
                <span className="text-4xl">🔥</span>
              </div>

              {/* Macro bars */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Macronutriments</p>
                <MacroBar label="Protéines" value={selectedRecipe.nutrition_analyses!.proteins_g ?? 0} unit="g" max={50} color="bg-blue-400" />
                <MacroBar label="Glucides" value={selectedRecipe.nutrition_analyses!.carbs_g ?? 0} unit="g" max={100} color="bg-yellow-400" />
                <MacroBar label="Lipides" value={selectedRecipe.nutrition_analyses!.fats_g ?? 0} unit="g" max={50} color="bg-red-400" />
                <MacroBar label="Fibres" value={selectedRecipe.nutrition_analyses!.fiber_g ?? 0} unit="g" max={30} color="bg-green-400" />
              </div>

              {/* Vitamins */}
              {selectedRecipe.nutrition_analyses!.vitamins != null && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Vitamines</p>
                  <span className="bg-orange-50 text-orange-500 text-sm px-3 py-1 rounded-full border border-orange-100 font-semibold">
                    {selectedRecipe.nutrition_analyses!.vitamins} µg
                  </span>
                </div>
              )}

              {/* Minerals */}
              {selectedRecipe.nutrition_analyses!.minerals && Object.keys(selectedRecipe.nutrition_analyses!.minerals).length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Minéraux</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedRecipe.nutrition_analyses!.minerals).map(([k, v]) => (
                      <span key={k}
                        className="bg-purple-50 text-purple-600 text-xs px-3 py-1 rounded-full border border-purple-100 font-medium">
                        {k}: {v}mg
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps */}
              {selectedRecipe.steps && (
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Préparation</p>
                  <div className="space-y-3">
                    {selectedRecipe.steps.split("\n").filter(Boolean).map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <span className="flex-none w-6 h-6 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-xs font-black border border-green-100">
                          {i + 1}
                        </span>
                        <p className="text-sm text-gray-600 leading-relaxed pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close button */}
              <button
                onClick={() => setSelectedRecipe(null)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NutriBadge({ label, value, color }: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-sm font-black ${color}`}>{String(value)}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

function MacroBar({ label, value, unit, max, color }: {
  label: string;
  value: number;
  unit: string;
  max: number;
  color: string;
}) {
  const percent = Math.min(((value ?? 0) / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700">{Math.round(value ?? 0)}{unit}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}