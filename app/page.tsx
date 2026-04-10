"use client";
import { useState } from "react";
import Link from "next/link";
import { Truck, MapPin, TrendingDown, Zap, Route, Play, DollarSign, Calculator } from "lucide-react";

export default function Home() {
  const [riders, setRiders] = useState(10);
  const [hours, setHours] = useState(8);
  const [days, setDays] = useState(26);

  const fuelPerRiderPerHour = 4200;
  const savingsPct = 0.20;
  const timeSavedPerHour = 0.35;

  const monthlyFuelSpend = riders * hours * days * fuelPerRiderPerHour;
  const monthlyFuelSaved = Math.round(monthlyFuelSpend * savingsPct);
  const monthlyTimeSaved = Math.round(riders * hours * days * timeSavedPerHour);
  const annualSaved = monthlyFuelSaved * 12;
  const efficiencyGain = 35;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" size={28} />
          <span className="text-xl font-bold">RouteWise</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/optimize" className="text-sm text-orange-400 hover:text-orange-300 transition">
            Route Optimizer
          </Link>
          <Link href="/algorithm" className="text-sm text-orange-400 hover:text-orange-300 transition">
            Algorithm Playback
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition">
            Dashboard
          </Link>
          <Link href="/map" className="text-sm text-gray-400 hover:text-white transition">
            Live Map
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm px-4 py-1 rounded-full mb-6">
          ALGOfest 2026 — Smart Cities + FinTech + AI/ML
        </div>
        <h1 className="text-5xl font-extrabold mb-4 leading-tight">
          Reduce Delivery Costs <br />
          <span className="text-orange-500">by up to 40%</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-10">
          We built an algorithm that makes chaotic Lagos city routing efficient.
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
            href="/optimize"
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition"
          >
            🗺️ Optimize My Route
          </Link>
          <Link
            href="/map"
            className="border border-orange-500 text-orange-400 hover:bg-orange-500/10 font-bold px-8 py-4 rounded-xl text-lg transition"
          >
            📡 Live Map
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-6 pb-16">
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

      {/* ── FEATURE 3: Cost + Time Savings Calculator ── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="text-orange-400" size={24} />
            <h2 className="text-2xl font-bold">💰 Calculate Your Savings</h2>
          </div>
          <p className="text-gray-400 text-sm mb-8">
            Enter your fleet details and see exactly how much RouteWise saves you — in naira, in hours, every month.
          </p>

          {/* Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Number of Riders: <span className="text-orange-400 font-bold text-lg">{riders}</span>
              </label>
              <input
                type="range" min={1} max={200} value={riders}
                onChange={e => setRiders(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1</span><span>200</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Hours Per Day: <span className="text-orange-400 font-bold text-lg">{hours}h</span>
              </label>
              <input
                type="range" min={1} max={16} value={hours}
                onChange={e => setHours(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1h</span><span>16h</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Working Days/Month: <span className="text-orange-400 font-bold text-lg">{days}</span>
              </label>
              <input
                type="range" min={1} max={31} value={days}
                onChange={e => setDays(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>1</span><span>31</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-2xl p-4 text-center border border-green-500/20">
              <div className="text-2xl font-extrabold text-green-400">
                ₦{monthlyFuelSaved.toLocaleString()}
              </div>
              <div className="text-gray-400 text-xs mt-1">Fuel Saved / Month</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 text-center border border-blue-500/20">
              <div className="text-2xl font-extrabold text-blue-400">
                {monthlyTimeSaved.toLocaleString()}h
              </div>
              <div className="text-gray-400 text-xs mt-1">Hours Saved / Month</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 text-center border border-purple-500/20">
              <div className="text-2xl font-extrabold text-purple-400">
                ₦{annualSaved.toLocaleString()}
              </div>
              <div className="text-gray-400 text-xs mt-1">Annual Savings</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 text-center border border-orange-500/20">
              <div className="text-2xl font-extrabold text-orange-400">
                {efficiencyGain}%
              </div>
              <div className="text-gray-400 text-xs mt-1">Efficiency Gain</div>
            </div>
          </div>

          {/* Summary sentence */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
            <p className="text-white font-semibold">
              With <span className="text-orange-400">{riders} riders</span> working{" "}
              <span className="text-orange-400">{hours}h/day</span> for{" "}
              <span className="text-orange-400">{days} days</span> — RouteWise saves you{" "}
              <span className="text-green-400 font-bold">₦{monthlyFuelSaved.toLocaleString()}</span> in fuel and{" "}
              <span className="text-blue-400 font-bold">{monthlyTimeSaved.toLocaleString()} hours</span> every single month.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-center mb-10">
          Everything You Need to <span className="text-orange-500">Win the Last Mile</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition">
            <Route className="text-orange-500 mb-3" size={28} />
            <h3 className="font-bold text-white mb-2">Multi-Stop Optimizer</h3>
            <p className="text-gray-400 text-sm mb-4">
              Enter up to 10 stops. Reordered using A* + 2-opt — before vs after with exact km and ₦ saved.
            </p>
            <Link href="/optimize" className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition">
              Try it now →
            </Link>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition">
            <Zap className="text-orange-500 mb-3" size={28} />
            <h3 className="font-bold text-white mb-2">Algorithm Playback</h3>
            <p className="text-gray-400 text-sm mb-4">
              Watch A* calculate the optimal route step by step — nodes lighting up, f(n) scores live, final path forming.
            </p>
            <Link href="/algorithm" className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition">
              Watch it work →
            </Link>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition">
            <Play className="text-orange-500 mb-3" size={28} />
            <h3 className="font-bold text-white mb-2">Live Fleet Tracking</h3>
            <p className="text-gray-400 text-sm mb-4">
              Watch 6 bikes navigate real Lagos streets in real time. Dynamically optimized every 2 seconds.
            </p>
            <Link href="/map" className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition">
              Open live map →
            </Link>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition">
            <DollarSign className="text-orange-500 mb-3" size={28} />
            <h3 className="font-bold text-white mb-2">Real-Time Savings</h3>
            <p className="text-gray-400 text-sm mb-4">
              Live dashboard tracks fuel saved, time saved, and orders delivered — A* vs Greedy charts live.
            </p>
            <Link href="/dashboard" className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition">
              View dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* Benchmark Table */}
      <section className="bg-gray-900 py-16 px-8 mx-6 mb-16 rounded-2xl max-w-4xl md:mx-auto">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          📊 Benchmark Results — RouteWise vs Greedy
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-700">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-800 text-green-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Metric</th>
                <th className="px-6 py-3">Greedy Baseline</th>
                <th className="px-6 py-3">RouteWise A*</th>
                <th className="px-6 py-3">Improvement</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-700">
                <td className="px-6 py-4">Fuel Cost (₦/hr per vehicle)</td>
                <td className="px-6 py-4">₦4,200</td>
                <td className="px-6 py-4 text-green-400 font-bold">₦3,360</td>
                <td className="px-6 py-4 text-green-400">↓ 20%</td>
              </tr>
              <tr className="border-t border-gray-700 bg-gray-800/50">
                <td className="px-6 py-4">Avg Delivery Time</td>
                <td className="px-6 py-4">47 min</td>
                <td className="px-6 py-4 text-green-400 font-bold">30 min</td>
                <td className="px-6 py-4 text-green-400">↓ 35%</td>
              </tr>
              <tr className="border-t border-gray-700">
                <td className="px-6 py-4">Re-routing Speed (50 vehicles)</td>
                <td className="px-6 py-4">&gt;10 seconds</td>
                <td className="px-6 py-4 text-green-400 font-bold">&lt;2 seconds</td>
                <td className="px-6 py-4 text-green-400">5x faster</td>
              </tr>
              <tr className="border-t border-gray-700 bg-gray-800/50">
                <td className="px-6 py-4">Algorithm Complexity</td>
                <td className="px-6 py-4">O(n²)</td>
                <td className="px-6 py-4 text-green-400 font-bold">O(n log n)</td>
                <td className="px-6 py-4 text-green-400">Scales to enterprise</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-center text-gray-500 text-xs mt-4">
          * Results from 500-tick simulation across 6 vehicles, 50 orders in Lagos traffic model
        </p>
      </section>

      {/* Business Case */}
      <section className="text-center py-12 px-6 pb-20">
        <p className="text-3xl font-bold text-green-400">
          If 100 Lagos dispatch riders used RouteWise daily —
        </p>
        <p className="text-xl text-white mt-2">
          that&apos;s{" "}
          <span className="text-green-400 font-bold">₦12.6M saved in fuel per month.</span>
        </p>
        <Link
          href="/optimize"
          className="inline-block mt-8 bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-lg transition"
        >
          Calculate Your Savings →
        </Link>
      </section>
    </main>
  );
}
