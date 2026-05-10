import Link from "next/link";
import { createSupabaseServerClient } from "@/supabase/server";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#f8faf6] font-sans">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="text-xl font-black text-gray-900 tracking-tight">Cook<span className="text-green-600">Mind</span></span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              Mon espace
            </Link>
          ) : (
            <>
              <Link href="/connexion"
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors px-4 py-2">
                Se connecter
              </Link>
              <Link href="/inscription"
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors shadow-sm">
                Commencer gratuitement
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          IA générative · Nutrition personnalisée · 100% gratuit
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight mb-6">
          Des recettes pensées<br />
          <span className="text-green-600">rien que pour vous</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
          CookMind génère des recettes personnalisées selon votre profil nutritionnel,
          vos intolérances et vos objectifs — en quelques secondes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/inscription"
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5">
            Créer mon profil nutritionnel →
          </Link>
          <Link href="/connexion"
            className="text-gray-500 hover:text-gray-700 font-medium px-6 py-4 rounded-2xl text-sm border border-gray-200 hover:border-gray-300 transition-all bg-white">
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard
            emoji="🎯"
            title="Adapté à vos objectifs"
            desc="Perte de poids, prise de masse ou maintien — chaque recette est calibrée selon vos calories et macros cibles."
            color="bg-orange-50 border-orange-100"
          />
          <FeatureCard
            emoji="🚫"
            title="Zéro ingrédient interdit"
            desc="Gluten, lactose, fruits à coque... CookMind prend en compte toutes vos intolérances automatiquement."
            color="bg-red-50 border-red-100"
          />
          <FeatureCard
            emoji="📊"
            title="Analyse nutritionnelle"
            desc="Calories, protéines, glucides, lipides, vitamines et minéraux — chaque recette est entièrement analysée."
            color="bg-blue-50 border-blue-100"
          />
          <FeatureCard
            emoji="🛒"
            title="Liste de courses auto"
            desc="Sélectionnez vos recettes de la semaine et obtenez votre liste de courses complète en un clic."
            color="bg-purple-50 border-purple-100"
          />
          <FeatureCard
            emoji="🧠"
            title="Propulsé par l'IA"
            desc="Alimenté par OpenAI, CookMind comprend vos préférences et génère des recettes créatives et variées."
            color="bg-green-50 border-green-100"
          />
          <FeatureCard
            emoji="💾"
            title="Sauvegardez vos recettes"
            desc="Retrouvez toutes vos recettes générées, filtrez-les et accédez à leur analyse nutritionnelle à tout moment."
            color="bg-yellow-50 border-yellow-100"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-y border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-3">Comment ça marche ?</h2>
          <p className="text-gray-400 text-sm mb-14">3 étapes, quelques secondes</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Step
              number="01"
              title="Créez votre profil"
              desc="Renseignez vos données physiques, intolérances et objectifs nutritionnels."
            />
            <Step
              number="02"
              title="Demandez une recette"
              desc="Choisissez vos ingrédients, le nombre de personnes et le type de plat souhaité."
            />
            <Step
              number="03"
              title="Cuisinez & analysez"
              desc="Obtenez votre recette avec son analyse nutritionnelle complète et ajoutez-la à vos favoris."
            />
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-4">
          Prêt à manger plus intelligemment ?
        </h2>
        <p className="text-gray-400 mb-8 text-base">
          Rejoignez CookMind et laissez l'IA composer vos repas.
        </p>
        <Link href="/inscription"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-4 rounded-2xl text-base transition-all shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5">
          Créer mon compte gratuitement →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-300">
        <span className="font-bold text-gray-400">🧠 CookMind</span> · Projet EEMI 2026 · Propulsé par OpenAI
      </footer>

    </div>
  );
}

function FeatureCard({ emoji, title, desc, color }: {
  emoji: string; title: string; desc: string; color: string;
}) {
  return (
    <div className={`rounded-2xl border p-6 ${color} hover:-translate-y-1 transition-transform`}>
      <div className="text-3xl mb-4">{emoji}</div>
      <h3 className="font-bold text-gray-800 text-sm mb-2">{title}</h3>
      <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ number, title, desc }: {
  number: string; title: string; desc: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-14 h-14 rounded-2xl bg-green-600 text-white font-black text-lg flex items-center justify-center mb-5 shadow-lg shadow-green-200">
        {number}
      </div>
      <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}