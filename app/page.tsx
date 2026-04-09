import Link from "next/link";
import { Truck, MapPin, TrendingDown, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" size={28} />
          <span className="text-xl font-bold">RouteWise</span>
        </div>
        <span className="text-sm text-gray-400">
          Lagos Last-Mile Delivery Optimizer
        </span>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm px-4 py-1 rounded-full mb-6">
          ALGOfest 2026 — Smart Cities + FinTech + AI/ML
        </div>
        <h1 className="text-5xl font-extrabold mb-4 leading-tight">
          Smarter Deliveries <br />
          <span className="text-orange-500">Across Lagos</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-10">
          RouteWise uses a modified A* algorithm with real-time traffic weights
          to optimize last-mile delivery routes — cutting fuel costs by 20% and
          delivery time by 35%.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/dashboard"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition"
          >
            Launch Dashboard →
          </Link>
          <Link
            href="/map"
            className="border border-orange-500 text-orange-400 hover:bg-orange-500/10 font-bold px-8 py-4 rounded-xl text-lg transition"
          >
            🗺️ Live Map
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <MapPin className="text-orange-500 mx-auto mb-3" size={32} />
          <div className="text-3xl font-bold text-white">40%</div>
          <div className="text-gray-400 mt-1 text-sm">
            of e-commerce cost is last-mile delivery in Lagos
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <TrendingDown className="text-orange-500 mx-auto mb-3" size={32} />
          <div className="text-3xl font-bold text-white">20%</div>
          <div className="text-gray-400 mt-1 text-sm">
            fuel cost reduction with RouteWise optimization
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <Zap className="text-orange-500 mx-auto mb-3" size={32} />
          <div className="text-3xl font-bold text-white">&lt;2s</div>
          <div className="text-gray-400 mt-1 text-sm">
            to re-route 50 vehicles when new orders arrive
          </div>
        </div>
      </section>
    </main>
  );
}