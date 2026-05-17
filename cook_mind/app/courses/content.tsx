"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/actions/logout";
import { saveShoppingList } from "@/actions/saveShoppingList";

type Ingredient = {
  name: string;
  quantity: number | string;
  unit: string;
};

type Recipe = {
  id: string;
  title: string;
  type: string;
  servings: number;
  ingredients: Ingredient[] | string | null;
};

type ShoppingItem = {
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
};

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

const TYPE_COLOR: Record<string, string> = {
  starter: "bg-green-50 border-green-200 text-green-700",
  main: "bg-blue-50 border-blue-200 text-blue-700",
  dessert: "bg-pink-50 border-pink-200 text-pink-700",
  snack: "bg-yellow-50 border-yellow-200 text-yellow-700",
};

export default function CoursesClient({ recipes }: { recipes: Recipe[] }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [listName, setListName] = useState("Ma liste de courses");
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [generated, setGenerated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/connexion");
  };

  const toggleRecipe = (id: string) => {
    setGenerated(false);
    setSaved(false);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const selectedRecipes = recipes.filter((r) => selectedIds.includes(r.id));

  const countByType = selectedRecipes.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const generateList = () => {
    if (selectedIds.length === 0) {
      setError("Sélectionnez au moins une recette.");
      return;
    }
    setError(null);

    const mergedMap: Record<string, { quantity: number; unit: string }> = {};

    for (const recipe of selectedRecipes) {
      const ingredients: Ingredient[] = (() => {
        if (!recipe.ingredients) return [];
        if (typeof recipe.ingredients === "string") {
          try { return JSON.parse(recipe.ingredients); }
          catch { return []; }
        }
        return recipe.ingredients;
      })();

      for (const ing of ingredients) {
        if (!ing.name) continue;
        const key = `${ing.name.toLowerCase().trim()}__${ing.unit ?? ""}`;
        const qty = parseFloat(String(ing.quantity)) || 0;
        if (mergedMap[key]) {
          mergedMap[key].quantity += qty;
        } else {
          mergedMap[key] = { quantity: qty, unit: ing.unit ?? "" };
        }
      }
    }

    const items: ShoppingItem[] = Object.entries(mergedMap).map(([key, val]) => ({
      name: key.split("__")[0],
      quantity: Math.round(val.quantity * 10) / 10,
      unit: val.unit,
      checked: false,
    }));

    setShoppingItems(items);
    setGenerated(true);
    setSaved(false);
  };

  const toggleItem = (index: number) => {
    setShoppingItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const result = await saveShoppingList(listName, selectedIds);
    setSaving(false);
    if (!result.success) {
      setError(result.message ?? "Erreur lors de la sauvegarde.");
    } else {
      setSaved(true);
    }
  };

  const handlePrint = () => {
    import("jspdf").then(({ default: jsPDF }) => {
      const doc = new jsPDF();

      // Green header
      doc.setFillColor(22, 163, 74);
      doc.rect(0, 0, 210, 40, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(listName, 14, 18);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Générée avec CookMind · ${new Date().toLocaleDateString("fr-FR")} · ${shoppingItems.length} articles`,
        14,
        30
      );

      // Recipe names
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      const recipeNames = selectedRecipes.map((r) => r.title).join(", ");
      const splitRecipes = doc.splitTextToSize(`Recettes : ${recipeNames}`, 182);
      doc.text(splitRecipes, 14, 48);

      // Divider
      let y = 48 + splitRecipes.length * 5 + 6;
      doc.setDrawColor(229, 231, 235);
      doc.line(14, y, 196, y);
      y += 8;

      // Column headers
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text("INGRÉDIENT", 14, y);
      doc.text("QUANTITÉ", 140, y);
      doc.text("UNITÉ", 175, y);
      y += 6;

      doc.setDrawColor(229, 231, 235);
      doc.line(14, y, 196, y);
      y += 6;

      // Items
      shoppingItems.forEach((item, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(14, y - 4, 182, 8, "F");
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(31, 41, 55);

        // Checkbox
        doc.setDrawColor(209, 213, 219);
        doc.roundedRect(14, y - 3.5, 5, 5, 1, 1, "S");

        // Name
        doc.text(
          item.name.charAt(0).toUpperCase() + item.name.slice(1),
          22,
          y
        );

        // Quantity
        doc.setFont("helvetica", "bold");
        doc.setTextColor(22, 163, 74);
        doc.text(
          item.quantity > 0 ? String(item.quantity) : "-",
          140,
          y
        );

        // Unit
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text(item.unit || "-", 175, y);

        y += 10;

        // New page if needed
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      });

      // Footer
      doc.setDrawColor(229, 231, 235);
      doc.line(14, y + 4, 196, y + 4);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.setFont("helvetica", "italic");
      doc.text(
        `CookMind — ${shoppingItems.length} articles pour ${selectedIds.length} recette${selectedIds.length > 1 ? "s" : ""}`,
        14,
        y + 12
      );

      doc.save(`${listName.replace(/\s+/g, "_")}.pdf`);
    });
  };

  const handleReset = () => {
    setSelectedIds([]);
    setShoppingItems([]);
    setGenerated(false);
    setSaved(false);
    setError(null);
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
          <Link href="/recettes"
            className="text-sm text-gray-500 hover:text-green-600 font-medium transition-colors">
            Recettes
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">🛒 Liste de courses</h1>
          <p className="text-gray-400 text-sm mt-1">
            Sélectionnez vos recettes — la liste sera générée automatiquement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left — recipe selector */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Mes recettes
              </h2>
              {selectedIds.length > 0 && (
                <button onClick={handleReset}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors">
                  Tout désélectionner
                </button>
              )}
            </div>

            {/* Selection summary */}
            {selectedIds.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-green-700 mb-2">
                  {selectedIds.length} recette{selectedIds.length > 1 ? "s" : ""} sélectionnée{selectedIds.length > 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(countByType).map(([type, count]) => (
                    <span key={type}
                      className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${TYPE_COLOR[type] ?? "bg-gray-50 border-gray-200 text-gray-600"}`}>
                      {TYPE_EMOJI[type]} {count} {TYPE_LABEL[type] ?? type}{count > 1 ? "s" : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recipe list */}
            {recipes.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <span className="text-4xl mb-3 block">🍳</span>
                <p className="text-gray-400 text-sm">Vous n'avez pas encore de recettes.</p>
                <Link href="/recettes/nouvelle"
                  className="mt-4 inline-block bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors">
                  Créer une recette
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {recipes.map((recipe) => {
                  const isSelected = selectedIds.includes(recipe.id);
                  return (
                    <button
                      key={recipe.id}
                      onClick={() => toggleRecipe(recipe.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3
                        ${isSelected
                          ? "border-green-400 bg-green-50 shadow-sm"
                          : "border-gray-100 bg-white hover:border-green-200 hover:bg-green-50/30"
                        }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-none transition-all
                        ${isSelected ? "bg-green-600 border-green-600" : "border-gray-300"}`}>
                        {isSelected && <span className="text-white text-xs font-black">✓</span>}
                      </div>
                      <span className="text-xl flex-none">{TYPE_EMOJI[recipe.type] ?? "🍴"}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? "text-green-700" : "text-gray-800"}`}>
                          {recipe.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {TYPE_LABEL[recipe.type] ?? recipe.type} · {recipe.servings} pers.
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold flex-none
                        ${TYPE_COLOR[recipe.type] ?? "bg-gray-50 border-gray-200 text-gray-600"}`}>
                        {TYPE_LABEL[recipe.type] ?? recipe.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={generateList}
              disabled={selectedIds.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              🛒 Générer la liste ({selectedIds.length} recette{selectedIds.length > 1 ? "s" : ""})
            </button>
          </div>

          {/* Right — shopping list result */}
          <div>
            {!generated ? (
              <div className="h-full min-h-[400px] bg-white rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-10 text-center">
                <span className="text-5xl mb-4 opacity-20">🛒</span>
                <p className="text-gray-400 text-sm font-medium">
                  Sélectionnez vos recettes à gauche et cliquez sur "Générer".
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  Les ingrédients seront fusionnés automatiquement.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* List header */}
                <div className="p-5 border-b border-gray-100">
                  <input
                    type="text"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    className="w-full text-lg font-black text-gray-900 outline-none border-b-2 border-transparent focus:border-green-500 transition-colors pb-1 bg-transparent"
                    placeholder="Nom de la liste..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {shoppingItems.length} article{shoppingItems.length > 1 ? "s" : ""} ·{" "}
                    {shoppingItems.filter((i) => i.checked).length} coché{shoppingItems.filter((i) => i.checked).length > 1 ? "s" : ""}
                  </p>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-50 max-h-[380px] overflow-y-auto">
                  {shoppingItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => toggleItem(index)}
                      className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-none transition-all
                        ${item.checked ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                        {item.checked && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className={`flex-1 text-sm transition-all
                        ${item.checked ? "line-through text-gray-300" : "text-gray-700"}`}>
                        {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                      </span>
                      <span className={`text-xs font-semibold transition-all
                        ${item.checked ? "text-gray-300" : "text-gray-500"}`}>
                        {item.quantity > 0 ? `${item.quantity} ${item.unit}` : item.unit || ""}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-100 space-y-2">
                  {saved ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-semibold text-center">
                      ✅ Liste sauvegardée !
                    </div>
                  ) : (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                    >
                      {saving ? "Sauvegarde..." : "💾 Sauvegarder la liste"}
                    </button>
                  )}
                  <button
                    onClick={handlePrint}
                    disabled={shoppingItems.length === 0}
                    className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    📄 Télécharger en PDF
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full text-gray-300 hover:text-gray-400 text-xs py-2 transition-colors"
                  >
                    Recommencer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}