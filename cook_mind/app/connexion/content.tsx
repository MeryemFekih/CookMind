"use client";

import { login } from "@/actions/login";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Connexion() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const justRegistered = params.get("registered") === "1";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(new FormData(e.currentTarget));
    setLoading(false);
    // if we reach here, login failed (success redirects server-side)
    if (result && !result.success) {
      setError(result.message ?? "Erreur de connexion.");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-10">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-700 tracking-tight">🍴 CookMind</h1>
          <p className="text-sm text-gray-400 mt-1">Bon retour parmi nous</p>
        </div>

        {justRegistered && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-5">
            Compte créé avec succès ! Connectez-vous maintenant.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              name="email" type="email" placeholder="john@exemple.com" required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mot de passe</label>
            <input
              name="password" type="password" placeholder="••••••••" required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-semibold transition-colors mt-2"
          >
            {loading ? "Connexion…" : "Se connecter →"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="text-green-600 font-semibold hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}