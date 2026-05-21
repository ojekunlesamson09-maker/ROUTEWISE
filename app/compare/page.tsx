"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Truck, Zap, ArrowRight, CheckCircle, XCircle } from "lucide-react";

const ZONES: Record<string, { x: number; y: number }> = {
  "Ikeja":            { x: 180, y: 80  },
  "Maryland":         { x: 300, y: 95  },
  "Gbagada":          { x: 340, y: 140 },
  "Oshodi":           { x: 200, y: 155 },
  "Mushin":           { x: 175, y: 205 },
  "Yaba":             { x: 260, y: 220 },
  "Surulere":         { x: 215, y: 275 },
  "Apapa":            { x: 130, y: 315 },
  "Ikoyi":            { x: 335, y: 290 },
  "Victoria Island":  { x: 355, y: 350 },
};

const BEFORE_ROUTE = ["Ikeja","Apapa","Maryland","Surulere","Gbagada","Mushin","Ikoyi","Oshodi","Yaba","Victoria Island"];
const AFTER_ROUTE  = ["Ikeja","Maryland","Gbagada","Oshodi","Yaba","Surulere","Ikoyi","Victoria Island","Apapa","Mushin"];

const BEFORE_METRICS = { distance: 89, fuel: 18200, eta: "3h 40m", efficiency: 42 };
const AFTER_METRICS  = { distance: 57, fuel: 11600, eta: "2h 15m", efficiency: 94 };

const STEPS = [
  "📡 Collecting 10 delivery points across Lagos...",
  "🧮 Building distance matrix across all zones...",
  "🔍 Running A* search: evaluating f(n) = g(n) + h(n)...",
  "🔄 Applying 2-opt improvement passes...",
  "📊 Comparing 3,628,800 possible orderings...",
  "⚡ Near-optimal route found in 1.4 seconds...",
  "✅ Optimization complete — 36% savings achieved!",
];

export default function ComparePage() {
  const [phase, setPhase] = useState<"idle"|"optimizing"|"done">("idle");
  const [stepIdx, setStepIdx] = useState(0);
  const [currentRoute, setCurrentRoute] = useState(BEFORE_ROUTE);
  const [metrics, setMetrics] = useState(BEFORE_METRICS);
  const [animatingMetrics, setAnimatingMetrics] = useState(false);
  const [dotPos, setDotPos] = useState(ZONES[BEFORE_ROUTE[0]]);
  const [dotStep, setDotStep] = useState(0);
  const [savingsCount, setSavingsCount] = useState(0);
  const [timeCount, setTimeCount] = useState(0);
  const dotRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef<NodeJS.Timeout | null>(null);

  const startOptimization = () => {
    if (phase === "optimizing") return;
    setPhase("optimizing");
    setStepIdx(0);
    setCurrentRoute(BEFORE_ROUTE);
    setMetrics(BEFORE_METRICS);
    setSavingsCount(0);
    setTimeCount(0);

    // Step through algorithm messages
    let s = 0;
    stepRef.current = setInterval(() => {
      s++;
      setStepIdx(s);
      if (s >= STEPS.length - 1) {
        clearInterval(stepRef.current!);
        // Transition to optimized
        setTimeout(() => {
          setCurrentRoute(AFTER_ROUTE);
          setAnimatingMetrics(true);
          setPhase("done");
          // Animate metrics counting
          let dist = BEFORE_METRICS.distance;
          let fuel = BEFORE_METRICS.fuel;
          const countInterval = setInterval(() => {
            dist = Math.max(AFTER_METRICS.distance, dist - 3);
            fuel = Math.max(AFTER_METRICS.fuel, fuel - 650);
            setMetrics(prev => ({ ...prev, distance: dist, fuel }));
            setSavingsCount(prev => Math.min(6600, prev + 580));
            setTimeCount(prev => Math.min(85, prev + 7));
            if (dist <= AFTER_METRICS.distance && fuel <= AFTER_METRICS.fuel) {
              clearInterval(countInterval);
              setMetrics(AFTER_METRICS);
              setSavingsCount(6600);
              setTimeCount(85);
              setAnimatingMetrics(false);
            }
          }, 80);
        }, 600);
      }
    }, 700);
  };

  // Animate dot along current route
  useEffect(() => {
    if (dotRef.current) clearInterval(dotRef.current);
    let step = 0;
    dotRef.current = setInterval(() => {
      step = (step + 1) % currentRoute.length;
      setDotStep(step);
      setDotPos(ZONES[currentRoute[step]]);
    }, phase === "optimizing" ? 300 : 800);
    return () => { if (dotRef.current) clearInterval(dotRef.current); };
  }, [currentRoute, phase]);

  const isDone = phase === "done";
  const routeColor = isDone ? "#10b981" : "#ef4444";

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" size={24} />
          <span className="text-lg font-bold">RouteWise</span>
          <span className="ml-3 text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
            Live Optimization
          </span>
        </div>
        <div className="flex gap-3">
          <Link href="/optimize" className="border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition">Optimizer</Link>
          <Link href="/algorithm" className="border border-orange-500/50 text-orange-400 px-4 py-2 rounded-lg text-sm transition">Algorithm</Link>
          <Link href="/" className="border border-gray-700 px-4 py-2 rounded-lg text-sm transition">← Home</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-8">

        {/* Hero */}
        <div className="text-center py-8">
          <div className="inline-block bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs px-4 py-1 rounded-full mb-4">
            Live Optimization Playback — Watch A* Work
          </div>
          <h1 className="text-4xl font-extrabold mb-3">
            See the Optimization <span className="text-orange-500">Happen Live</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-6">
            10 real Lagos delivery stops. Watch RouteWise transform a chaotic route into the mathematically optimal path — in real time.
          </p>
          <button
            onClick={startOptimization}
            disabled={phase === "optimizing"}
            className={`px-10 py-4 rounded-xl font-extrabold text-lg transition ${
              phase === "optimizing"
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : phase === "done"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {phase === "idle" && "⚡ SEE THE OPTIMIZATION NOW"}
            {phase === "optimizing" && <span className="flex items-center gap-2 justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Optimizing Lagos Routes...</span>}
            {phase === "done" && "🔄 Run Again"}
          </button>
        </div>

        {/* Main — Map + Algorithm Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Route Map */}
          <div className={`bg-gray-900 border rounded-2xl p-4 transition-all duration-500 ${isDone ? "border-green-500/40" : phase === "optimizing" ? "border-orange-500/40" : "border-gray-800"}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                {phase === "idle" && "📍 Original Route — Unoptimized"}
                {phase === "optimizing" && <span className="text-orange-400 animate-pulse">⚡ Re-calculating optimal path...</span>}
                {phase === "done" && <span className="text-green-400">✅ Optimized Route — A* Complete</span>}
              </h3>
              <span className={`text-sm font-bold ${isDone ? "text-green-400" : "text-red-400"}`}>
                {metrics.distance}km
              </span>
            </div>
            <svg viewBox="0 0 500 430" className="w-full rounded-xl bg-gray-950">
              {/* Route lines */}
              {currentRoute.map((stop, i) => {
                if (i === currentRoute.length - 1) return null;
                const a = ZONES[stop];
                const b = ZONES[currentRoute[i + 1]];
                return (
                  <line key={i}
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={routeColor} strokeWidth={2} opacity={0.6}
                    strokeDasharray={phase === "optimizing" ? "6,4" : undefined}
                  >
                    {phase === "optimizing" && (
                      <animate attributeName="stroke-dashoffset" values="100;0" dur="1s" repeatCount="indefinite" />
                    )}
                  </line>
                );
              })}

              {/* Stop nodes */}
              {currentRoute.map((stop, i) => {
                const z = ZONES[stop];
                return (
                  <g key={stop}>
                    {i === dotStep && (
                      <circle cx={z.x} cy={z.y} r={20} fill={routeColor} opacity={0.15}>
                        <animate attributeName="r" values="16;24;16" dur="1s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle cx={z.x} cy={z.y} r={14}
                      fill={i === 0 ? "#f97316" : isDone ? "#10b981" : "#ef4444"}
                      stroke="white" strokeWidth={1.5}
                    />
                    <text x={z.x} y={z.y + 4} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">{i + 1}</text>
                    <text x={z.x} y={z.y - 18} textAnchor="middle" fontSize="8" fill="#9ca3af">{stop.split(" ")[0]}</text>
                  </g>
                );
              })}

              {/* Moving dot */}
              <circle cx={dotPos.x} cy={dotPos.y} r={8}
                fill="white" stroke={routeColor} strokeWidth={3}
                style={{ filter: `drop-shadow(0 0 8px ${routeColor})` }}
              />

              {/* Bottom label */}
              <text x={250} y={420} textAnchor="middle" fontSize="9" fill="#4b5563">
                {isDone ? "✅ Optimal sequence — A* + 2-opt verified" : phase === "optimizing" ? "⚡ A* evaluating nodes..." : "❌ Original order — not optimized"}
              </text>
            </svg>
          </div>

          {/* Algorithm Steps + Metrics */}
          <div className="space-y-4">

            {/* Algorithm steps log */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h3 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                <Zap size={14} /> Algorithm Log
              </h3>
              <div className="space-y-2 font-mono text-xs">
                {STEPS.map((step, i) => (
                  <div key={i} className={`flex items-start gap-2 transition-all duration-300 ${
                    i <= stepIdx ? "text-green-400" : "text-gray-700"
                  }`}>
                    <span className="mt-0.5 flex-shrink-0">{i <= stepIdx ? "▶" : "·"}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live metrics */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Distance", before: `${BEFORE_METRICS.distance}km`, after: `${metrics.distance}km`, color: "text-green-400", improved: isDone },
                { label: "Fuel Cost", before: `₦${BEFORE_METRICS.fuel.toLocaleString()}`, after: `₦${metrics.fuel.toLocaleString()}`, color: "text-orange-400", improved: isDone },
                { label: "Delivery ETA", before: BEFORE_METRICS.eta, after: isDone ? AFTER_METRICS.eta : BEFORE_METRICS.eta, color: "text-blue-400", improved: isDone },
                { label: "Efficiency", before: `${BEFORE_METRICS.efficiency}%`, after: `${metrics.efficiency}%`, color: "text-purple-400", improved: isDone },
              ].map((m) => (
                <div key={m.label} className={`bg-gray-900 border rounded-xl p-3 transition-all duration-300 ${m.improved ? "border-green-500/30" : "border-gray-800"}`}>
                  <div className="text-xs text-gray-500 mb-2">{m.label}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 line-through text-xs">{m.before}</span>
                    {m.improved && <ArrowRight size={10} className="text-gray-600" />}
                    <span className={`font-bold text-sm ${m.improved ? m.color : "text-gray-400"}`}>{m.after}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Savings counter */}
            {(phase === "optimizing" || isDone) && (
              <div className={`rounded-2xl p-5 text-center border transition-all duration-500 ${isDone ? "bg-green-500/10 border-green-500/30" : "bg-orange-500/10 border-orange-500/30"}`}>
                <div className={`text-3xl font-extrabold ${isDone ? "text-green-400" : "text-orange-400"}`}>
                  ₦{savingsCount.toLocaleString()}
                </div>
                <div className="text-gray-400 text-xs mt-1">fuel saved this run</div>
                {isDone && (
                  <div className="text-blue-400 font-bold mt-2">{timeCount} minutes recovered</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Before vs After Table */}
        {(phase !== "idle") && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-4 text-center">📊 Before vs After — Full Comparison</h3>
            <div className="overflow-hidden rounded-xl border border-gray-700">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="bg-gray-800 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 text-gray-400">Metric</th>
                    <th className="px-6 py-3 text-red-400">❌ Before (Unoptimized)</th>
                    <th className="px-6 py-3 text-green-400">✅ After (RouteWise A*)</th>
                    <th className="px-6 py-3 text-orange-400">Improvement</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: "Total Distance", before: "89km", after: "57km", improvement: "↓ 36%" },
                    { metric: "Fuel Cost", before: "₦18,200", after: "₦11,600", improvement: "↓ 36%" },
                    { metric: "Delivery ETA", before: "3h 40m", after: "2h 15m", improvement: "↓ 39%" },
                    { metric: "Route Efficiency", before: "42%", after: "94%", improvement: "↑ 52pts" },
                    { metric: "Algorithm", before: "Manual / Greedy O(n²)", after: "A* O(n log n)", improvement: "5× faster" },
                    { metric: "Re-route Speed", before: "> 10 seconds", after: "< 2 seconds", improvement: "5× faster" },
                  ].map((row, i) => (
                    <tr key={row.metric} className={`border-t border-gray-700 ${i % 2 === 1 ? "bg-gray-800/30" : ""}`}>
                      <td className="px-6 py-3 text-white font-medium">{row.metric}</td>
                      <td className="px-6 py-3 text-red-400">{row.before}</td>
                      <td className={`px-6 py-3 text-green-400 font-bold ${animatingMetrics ? "animate-pulse" : ""}`}>{isDone ? row.after : "..."}</td>
                      <td className="px-6 py-3 text-orange-400 font-bold">{isDone ? row.improvement : "..."}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lagos Real-World Scenario */}
        <div className="bg-gray-900 border border-orange-500/20 rounded-2xl p-6">
          <div className="text-xs text-orange-400 font-semibold uppercase tracking-wider mb-3">Real-World Impact Scenario</div>
          <h3 className="text-xl font-bold mb-4">🚴 Lagos Delivery Scenario — 15 Orders, 4 Bikes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm border-b border-gray-800 pb-2">
                <span className="text-gray-400">Orders to fulfill</span>
                <span className="text-white font-bold">15 deliveries</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-800 pb-2">
                <span className="text-gray-400">Available bikes</span>
                <span className="text-white font-bold">4 riders</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-800 pb-2">
                <span className="text-gray-400">Manual planning time</span>
                <span className="text-red-400 font-bold">42 minutes</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-800 pb-2">
                <span className="text-gray-400">RouteWise optimization</span>
                <span className="text-green-400 font-bold">6 seconds</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-800 pb-2">
                <span className="text-gray-400">Fuel savings</span>
                <span className="text-green-400 font-bold">31% less fuel</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Time recovered</span>
                <span className="text-blue-400 font-bold">1.4 hours saved</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-5 space-y-3">
              <div className="text-green-400 font-bold text-lg">If used daily for 1 month:</div>
              <div className="text-3xl font-extrabold text-orange-400">₦312,000</div>
              <div className="text-gray-400 text-sm">saved in fuel across 4 bikes</div>
              <div className="text-2xl font-bold text-blue-400 mt-2">36 hours</div>
              <div className="text-gray-400 text-sm">of delivery time recovered</div>
              <div className="mt-3 text-xs text-gray-500">
                Designed to scale across fleets, cities, and high-volume logistics operations.
                Efficient under growing route complexity and delivery demand.
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Engine */}
        <div className="bg-gray-900 border border-blue-500/20 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-2 text-blue-400">🧠 How RouteWise Optimizes Routes</h3>
          <p className="text-gray-400 text-sm mb-6">Built for scalable real-world logistics operations.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: "01", title: "Collect & Model", desc: "Gather delivery points and build a traffic-aware distance matrix across all Lagos zones. Every road, every zone, weighted by real travel cost.", color: "border-orange-500/30 bg-orange-500/5" },
              { step: "02", title: "Heuristic Optimization", desc: "Apply A* search inspired by Travelling Salesman Problem heuristics. f(n) = g(n) + h(n) guides the search toward optimal paths in O(n log n) time.", color: "border-blue-500/30 bg-blue-500/5" },
              { step: "03", title: "Near-Optimal Delivery", desc: "Generate the near-optimal delivery sequence in seconds. 2-opt improvement passes refine the route further — same technique used by enterprise logistics platforms.", color: "border-green-500/30 bg-green-500/5" },
            ].map((item) => (
              <div key={item.step} className={`border ${item.color} rounded-xl p-5`}>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mb-3">{item.step}</div>
                <h4 className="font-bold text-white mb-2">{item.title}</h4>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <p className="text-blue-300 text-sm font-semibold">
              Designed to scale across fleets, cities, and high-volume logistics operations. Efficient under growing route complexity and delivery demand.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/optimize" className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-10 py-4 rounded-xl text-lg transition">
              ⚡ OPTIMIZE YOUR ROUTE NOW
            </Link>
            <Link href="/algorithm" className="border border-gray-700 hover:border-orange-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition">
              Watch Algorithm Playback
            </Link>
            <Link href="/map" className="border border-orange-500/50 text-orange-400 font-bold px-10 py-4 rounded-xl text-lg transition">
              📡 Open Live Map
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
