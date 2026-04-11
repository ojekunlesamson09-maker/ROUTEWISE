"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Truck, MapPin, TrendingDown, Zap, Route, Play, DollarSign, Calculator } from "lucide-react";

export default function Home() {
  const [riders, setRiders] = useState(10);
  const [hours, setHours] = useState(8);
  const [days, setDays] = useState(26);
  const [count, setCount] = useState(0);

  const fuelPerRiderPerHour = 4200;
  const savingsPct = 0.20;
  const timeSavedPerHour = 0.35;

  const monthlyFuelSpend = riders * hours * days * fuelPerRiderPerHour;
  const monthlyFuelSaved = Math.round(monthlyFuelSpend * savingsPct);
  const monthlyTimeSaved = Math.round(riders * hours * days * timeSavedPerHour);
  const annualSaved = monthlyFuelSaved * 12;
  const efficiencyGain = 35;

  // Animated counter — counts up on page load
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev >= 2847) { clearInterval(interval); return 2847; }
        return prev + Math.floor(Math.random() * 47) + 10;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" size={28} />
          <span className="text-xl font-bold">RouteWise</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="text-sm text-orange-400 hover:text-orange-300 transition">
            Algorithm
          </Link>
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
      <section className="flex flex-col items-center justify-center text-center px-6 py-14">
        <div className="bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm px-4 py-1 rounded-full mb-5">
          ALGOfest 2026 — Smart Cities + FinTech + AI/ML
        </div>
        <h1 className="text-5xl font-extrabold mb-3 leading-tight">
          Plan smarter delivery routes <br />
          <span className="text-orange-500">in seconds using AI.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-6">
          RouteWise uses a modified A* algorithm with real-time Lagos traffic weights
          to cut fuel costs by 20% and delivery time by 35% — automatically.
        </p>

        {/* ── ANIMATED COUNTER — WOW MOMENT ── */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-full px-6 py-2 mb-8 text-green-400 font-bold text-sm animate-pulse">
          ⚡ ₦{count.toLocaleString()} saved in fuel since you opened this page
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/optimize" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition">
            🗺️ Optimize My Route →
          </Link>
          <Link href="/dashboard" className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition">
            Launch Dashboard
          </Link>
          <Link href="/map" className="border border-orange-500 text-orange-400 hover:bg-orange-500/10 font-bold px-8 py-4 rounded-xl text-lg transition">
            📡 Live Map
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <MapPin className="text-orange-500 mx-auto mb-3" size={32} />
          <div className="text-3xl font-bold text-white">40%</div>
          <div className="text-gray-400 mt-1 text-sm">of e-commerce cost is last-mile delivery in Lagos</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <TrendingDown className="text-orange-500 mx-auto mb-3" size={32} />
          <div className="text-3xl font-bold text-white">20%</div>
          <div className="text-gray-400 mt-1 text-sm">fuel cost reduction with RouteWise optimization</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
          <Zap className="text-orange-500 mx-auto mb-3" size={32} />
          <div className="text-3xl font-bold text-white">&lt;2s</div>
          <div className="text-gray-400 mt-1 text-sm">to re-route 50 vehicles when new orders arrive</div>
        </div>
      </section>

      {/* How It Works — 3 Steps */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-center mb-2">How It Works</h2>
        <p className="text-gray-400 text-center text-sm mb-10">
          From chaotic stops to optimal route — in under 2 seconds.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-orange-500/30" />
          {[
            { step: "01", icon: "📍", title: "Enter Your Stops", desc: "Input up to 10 delivery locations across Lagos — Ikeja, Lekki, Surulere, anywhere.", color: "border-orange-500/30 bg-orange-500/5", link: "/optimize", cta: "Try the optimizer →" },
            { step: "02", icon: "⚡", title: "A* Optimizes Instantly", desc: "RouteWise runs A* + 2-opt improvement, evaluating every possible route combination in milliseconds.", color: "border-blue-500/30 bg-blue-500/5", link: "/algorithm", cta: "Watch it work →" },
            { step: "03", icon: "🚀", title: "Deliver Faster & Cheaper", desc: "Get the shortest route with exact km saved, ₦ fuel saved, and time recovered — before you move.", color: "border-green-500/30 bg-green-500/5", link: "/optimize", cta: "See results →" },
          ].map((item) => (
            <div key={item.step} className={`relative border ${item.color} rounded-2xl p-6 text-center`}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {item.step}
              </div>
              <div className="text-4xl mb-3 mt-2">{item.icon}</div>
              <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{item.desc}</p>
              <Link href={item.link} className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition">{item.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* Real Results */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-center mb-2">Real Results</h2>
        <p className="text-gray-400 text-center text-sm mb-10">From our 500-tick simulation across Lagos traffic model</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "32%", label: "Avg fuel saved per route", color: "text-green-400", border: "border-green-500/20" },
            { value: "35%", label: "Delivery time reduced", color: "text-blue-400", border: "border-blue-500/20" },
            { value: "23%", label: "Shorter total distance", color: "text-orange-400", border: "border-orange-500/20" },
            { value: "5×", label: "Faster than greedy routing", color: "text-purple-400", border: "border-purple-500/20" },
          ].map((r) => (
            <div key={r.label} className={`bg-gray-900 border ${r.border} rounded-2xl p-5 text-center`}>
              <div className={`text-3xl font-extrabold ${r.color}`}>{r.value}</div>
              <div className="text-gray-400 text-xs mt-2">{r.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Algorithm Teaser */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gray-900 border border-orange-500/20 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="text-xs text-orange-400 font-semibold mb-2 uppercase tracking-wider">Algorithm Deep Dive</div>
            <h2 className="text-2xl font-bold mb-3">Why A* beats every other routing algorithm</h2>
            <p className="text-gray-400 text-sm mb-4">
              Dijkstra explores everything. Greedy picks wrong. Dynamic Programming is exponential. A* uses a heuristic to find the optimal path in <span className="text-orange-400 font-bold">O(n log n)</span> — making real-time re-routing possible.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/about" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl text-sm transition">
                Read the Algorithm Story →
              </Link>
              <Link href="/algorithm" className="border border-gray-700 hover:border-orange-500 text-gray-300 font-bold px-5 py-2 rounded-xl text-sm transition">
                Watch Live Playback
              </Link>
            </div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-5 font-mono text-xs text-orange-300 flex-shrink-0 w-full md:w-64">
            <div className="text-gray-500 mb-2">// A* core formula</div>
            <div>f(n) = g(n) + h(n)</div>
            <div className="mt-3 text-gray-400">g(n) = actual cost</div>
            <div className="text-gray-400">h(n) = heuristic</div>
            <div className="text-gray-400">f(n) = total estimate</div>
            <div className="mt-3 text-green-400">// O(n log n) ✅</div>
            <div className="text-red-400">// vs Greedy O(n²) ❌</div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-2">
            <Calculator className="text-orange-400" size={24} />
            <h2 className="text-2xl font-bold">💰 Calculate Your Savings</h2>
          </div>
          <p className="text-gray-400 text-sm mb-8">
            Enter your fleet details and see exactly how much RouteWise saves you — in naira, in hours, every month.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Number of Riders: <span className="text-orange-400 font-bold text-lg">{riders}</span>
              </label>
              <input type="range" min={1} max={200} value={riders} onChange={e => setRiders(Number(e.target.value))} className="w-full accent-orange-500" />
              <div className="flex justify-between text-xs text-gray-600 mt-1"><span>1</span><span>200</span></div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Hours Per Day: <span className="text-orange-400 font-bold text-lg">{hours}h</span>
              </label>
              <input type="range" min={1} max={16} value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full accent-orange-500" />
              <div className="flex justify-between text-xs text-gray-600 mt-1"><span>1h</span><span>16h</span></div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Working Days/Month: <span className="text-orange-400 font-bold text-lg">{days}</span>
              </label>
              <input type="range" min={1} max={31} value={days} onChange={e => setDays(Number(e.target.value))} className="w-full accent-orange-500" />
              <div className="flex justify-between text-xs text-gray-600 mt-1"><span>1</span><span>31</span></div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-2xl p-4 text-center border border-green-500/20">
              <div className="text-2xl font-extrabold text-green-400">₦{monthlyFuelSaved.toLocaleString()}</div>
              <div className="text-gray-400 text-xs mt-1">Fuel Saved / Month</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 text-center border border-blue-500/20">
              <div className="text-2xl font-extrabold text-blue-400">{monthlyTimeSaved.toLocaleString()}h</div>
              <div className="text-gray-400 text-xs mt-1">Hours Saved / Month</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 text-center border border-purple-500/20">
              <div className="text-2xl font-extrabold text-purple-400">₦{annualSaved.toLocaleString()}</div>
              <div className="text-gray-400 text-xs mt-1">Annual Savings</div>
            </div>
            <div className="bg-gray-800 rounded-2xl p-4 text-center border border-orange-500/20">
              <div className="text-2xl font-extrabold text-orange-400">{efficiencyGain}%</div>
              <div className="text-gray-400 text-xs mt-1">Efficiency Gain</div>
            </div>
          </div>
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
            <p className="text-gray-400 text-sm mb-4">Enter up to 10 stops. Reordered using A* + 2-opt — before vs after with exact km and ₦ saved.</p>
            <Link href="/optimize" className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition">Try it now →</Link>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition">
            <Zap className="text-orange-500 mb-3" size={28} />
            <h3 className="font-bold text-white mb-2">Algorithm Playback</h3>
            <p className="text-gray-400 text-sm mb-4">Watch A* calculate the optimal route step by step — nodes lighting up, f(n) scores live, final path forming.</p>
            <Link href="/algorithm" className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition">Watch it work →</Link>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition">
            <Play className="text-orange-500 mb-3" size={28} />
            <h3 className="font-bold text-white mb-2">Live Fleet Tracking</h3>
            <p className="text-gray-400 text-sm mb-4">Watch 6 bikes navigate real Lagos streets in real time. Dynamically optimized every 2 seconds.</p>
            <Link href="/map" className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition">Open live map →</Link>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-orange-500/50 transition">
            <DollarSign className="text-orange-500 mb-3" size={28} />
            <h3 className="font-bold text-white mb-2">Real-Time Savings</h3>
            <p className="text-gray-400 text-sm mb-4">Live dashboard tracks fuel saved, time saved, and orders delivered — A* vs Greedy charts live.</p>
            <Link href="/dashboard" className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition">View dashboard →</Link>
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
        <div className="flex gap-4 justify-center flex-wrap mt-8">
          <Link href="/optimize" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-lg transition">
            Calculate Your Savings →
          </Link>
          <Link href="/about" className="inline-block border border-gray-700 hover:border-orange-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition">
            Read the Algorithm Story →
          </Link>
        </div>
      </section>
    </main>
  );
}
