"use client";

import { useState } from "react";
import { createRecipe } from "@/actions/generateRecipe";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/actions/logout";

interface ContentProps {
  initialRecipes: any[];
}

export default function RecipeContent({ initialRecipes }: ContentProps) {
  const router = useRouter();
  const [ingredients, setIngredients] = useState("");
  const [nbPers, setNbPers] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<any>(null);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    await logout();
    router.push("/connexion");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const result = await createRecipe({ ingredients, nbPers });

    if (result.success) {
      setRecipe(result.data);
      setIngredients("");
    } else {
      setError(result.error || "Erreur lors de la génération");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <span className="text-lg font-black text-gray-900 tracking-tight">
            Cook<span className="text-green-600">Mind</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/recettes"
            className="text-sm text-gray-500 hover:text-green-600 font-medium transition-colors">
            Toutes les recettes
          </Link>
          <Link href="/dashboard"
            className="text-sm text-gray-500 hover:text-green-600 font-medium transition-colors">
            Dashboard
          </Link>
          <Link href="/profil"
            className="text-sm text-gray-500 hover:text-green-600 font-medium transition-colors">
            Mon profil
          </Link>
          <button onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {/* Header Style */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Générer une <span className="text-green-600">nouvelle recette</span> ✨
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Composez votre repas sur mesure avec l'IA</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Configuration</h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">Ingrédients dispo</label>
                  <textarea 
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-green-300 transition-all h-32"
                    placeholder="Poulet, riz, courgettes..."
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block font-medium">Nombre de parts</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-green-300"
                    value={nbPers}
                    onChange={(e) => setNbPers(parseInt(e.target.value))}
                  />
                </div>
                <button 
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-md shadow-green-100"
                >
                  {isLoading ? "Le chef réfléchit..." : "Générer ma recette"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Mes dernières créations</h2>
              <div className="space-y-2">
                {initialRecipes.slice(0, 5).map((r) => (
                  <div key={r.id} className="text-xs text-gray-600 p-2 border-b border-gray-50 last:border-0 truncate">
                    🍽️ {typeof r.title === 'string' ? r.title : "Recette"}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm mb-6 border border-red-100">
                {error}
              </div>
            )}

            {recipe ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-in fade-in duration-500">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">{recipe.title}</h2>
                  <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-full font-bold uppercase tracking-wider">AI Generated</span>
                </div>

                {/* Nutrition Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  <StatCard icon="🔥" label="Kcal" value={`${recipe.nutrition.calories}`} color="bg-orange-50 border-orange-100" textColor="text-orange-600" />
                  <StatCard icon="💪" label="Prot." value={`${recipe.nutrition.protein}g`} color="bg-blue-50 border-blue-100" textColor="text-blue-600" />
                  <StatCard icon="🍞" label="Gluc." value={`${recipe.nutrition.carbs}g`} color="bg-yellow-50 border-yellow-100" textColor="text-yellow-600" />
                  <StatCard icon="🥑" label="Lip." value={`${recipe.nutrition.fat}g`} color="bg-red-50 border-red-100" textColor="text-red-600" />
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Ingrédients requis</h3>
                    <div className="space-y-2">
                      {recipe.ingredients.map((ing: any, i: number) => (
                        <Row 
                          key={i} 
                          label={typeof ing === 'object' ? `${ing.quantity || ''} ${ing.unit || ''} ${ing.name || ''}`.trim() : ing} 
                          value="✔" 
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Préparation pas à pas</h3>
                    <div className="space-y-4">
                      {recipe.instructions.map((step: string, i: number) => (
                        <div key={i} className="flex gap-4">
                          <span className="flex-none w-6 h-6 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-[10px] font-bold border border-green-100">
                            {i + 1}
                          </span>
                          <p className="text-sm text-gray-600 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-10 text-center">
                <span className="text-5xl mb-4 opacity-20">👩‍🍳</span>
                <p className="text-gray-400 text-sm italic">
                  Entrez vos ingrédients à gauche pour générer votre recette personnalisée CookMind.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// COMPOSANTS RÉUTILISÉS DU DASHBOARD
function StatCard({ icon, label, value, color, textColor }: {
  icon: string; label: string; value: string; color: string; textColor: string;
}) {
  return (
    <div className={`rounded-xl border p-3 ${color}`}>
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-[10px] text-gray-400 font-medium mb-1 uppercase tracking-tighter">{label}</p>
      <p className={`text-xs font-bold ${textColor}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-green-600">{value}</span>
    </div>
  );
}