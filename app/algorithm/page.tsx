"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Truck, Play, RotateCcw, Zap } from "lucide-react";

const NODES = [
  { id: "Ikeja",           x: 180, y: 80  },
  { id: "Agege",           x: 80,  y: 120 },
  { id: "Ojota",           x: 280, y: 60  },
  { id: "Maryland",        x: 300, y: 120 },
  { id: "Gbagada",         x: 340, y: 160 },
  { id: "Oshodi",          x: 200, y: 160 },
  { id: "Mushin",          x: 180, y: 220 },
  { id: "Yaba",            x: 260, y: 240 },
  { id: "Surulere",        x: 220, y: 300 },
  { id: "Apapa",           x: 140, y: 340 },
  { id: "Ikoyi",           x: 340, y: 320 },
  { id: "Victoria Island", x: 360, y: 380 },
  { id: "Lekki",           x: 460, y: 340 },
  { id: "Ajah",            x: 540, y: 300 },
];

const EDGES: [string, string, number][] = [
  ["Ikeja","Agege",7], ["Ikeja","Ojota",6], ["Ikeja","Maryland",5],
  ["Ikeja","Oshodi",8], ["Agege","Ojota",8], ["Ojota","Maryland",4],
  ["Maryland","Gbagada",4], ["Gbagada","Oshodi",8], ["Oshodi","Mushin",5],
  ["Mushin","Yaba",7], ["Mushin","Surulere",6], ["Yaba","Surulere",5],
  ["Yaba","Ikoyi",9], ["Surulere","Apapa",8], ["Surulere","Ikoyi",8],
  ["Apapa","Victoria Island",7], ["Ikoyi","Victoria Island",3],
  ["Victoria Island","Lekki",8], ["Lekki","Ajah",10],
  ["Gbagada","Yaba",10], ["Maryland","Oshodi",7],
];

const START = "Ikeja";
const GOAL  = "Ajah";

function heuristic(a: string, b: string): number {
  const na = NODES.find(n => n.id === a)!;
  const nb = NODES.find(n => n.id === b)!;
  return Math.round(Math.sqrt((na.x - nb.x) ** 2 + (na.y - nb.y) ** 2) / 18);
}

function getNeighbours(node: string): { id: string; cost: number }[] {
  const result: { id: string; cost: number }[] = [];
  for (const [a, b, c] of EDGES) {
    if (a === node) result.push({ id: b, cost: c });
    if (b === node) result.push({ id: a, cost: c });
  }
  return result;
}

interface Step {
  current: string;
  open: string[];
  closed: string[];
  path: string[];
  label: string;
  gScores: Record<string, number>;
  fScores: Record<string, number>;
  finalPath?: string[];
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const gScore: Record<string, number> = { [START]: 0 };
  const fScore: Record<string, number> = { [START]: heuristic(START, GOAL) };
  const cameFrom: Record<string, string> = {};
  const open = new Set([START]);
  const closed = new Set<string>();

  const reconstructPath = (current: string): string[] => {
    const path = [current];
    while (cameFrom[path[0]]) path.unshift(cameFrom[path[0]]);
    return path;
  };

  let iteration = 0;
  while (open.size > 0 && iteration < 50) {
    iteration++;
    const current = [...open].reduce((a, b) =>
      (fScore[a] ?? Infinity) < (fScore[b] ?? Infinity) ? a : b
    );

    if (current === GOAL) {
      const finalPath = reconstructPath(current);
      steps.push({
        current,
        open: [...open],
        closed: [...closed],
        path: reconstructPath(current),
        label: `✅ Final route selected! Shortest path found: ${finalPath.join(" → ")}`,
        gScores: { ...gScore },
        fScores: { ...fScore },
        finalPath,
      });
      break;
    }

    steps.push({
      current,
      open: [...open],
      closed: [...closed],
      path: reconstructPath(current),
      label: `🔍 Evaluating node: ${current} — f(n)=${fScore[current] ?? "?"}, g(n)=${gScore[current] ?? "?"}, h(n)=${heuristic(current, GOAL)}`,
      gScores: { ...gScore },
      fScores: { ...fScore },
    });

    open.delete(current);
    closed.add(current);

    for (const { id: neighbour, cost } of getNeighbours(current)) {
      if (closed.has(neighbour)) continue;
      const tentativeG = (gScore[current] ?? Infinity) + cost;
      if (tentativeG < (gScore[neighbour] ?? Infinity)) {
        cameFrom[neighbour] = current;
        gScore[neighbour] = tentativeG;
        fScore[neighbour] = tentativeG + heuristic(neighbour, GOAL);
        open.add(neighbour);
        steps.push({
          current,
          open: [...open],
          closed: [...closed],
          path: reconstructPath(current),
          label: `📊 Optimizing path to ${neighbour} — new cost g(n)=${tentativeG}, f(n)=${fScore[neighbour]}`,
          gScores: { ...gScore },
          fScores: { ...fScore },
        });
      }
    }
  }
  return steps;
}

const ALL_STEPS = buildSteps();

export default function AlgorithmPage() {
  const [stepIdx, setStepIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const step = stepIdx >= 0 ? ALL_STEPS[stepIdx] : null;

  useEffect(() => {
    if (!playing) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setStepIdx(prev => {
        if (prev >= ALL_STEPS.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, speed);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, speed]);

  const reset = () => { setPlaying(false); setStepIdx(-1); };
  const start = () => { if (stepIdx >= ALL_STEPS.length - 1) setStepIdx(-1); setPlaying(true); };

  const nodeColor = (id: string) => {
    if (!step) return "#374151";
    if (step.finalPath?.includes(id)) return "#f97316";
    if (id === step.current) return "#f97316";
    if (id === START) return "#10b981";
    if (id === GOAL) return "#a855f7";
    if (step.closed.includes(id)) return "#1e3a5f";
    if (step.open.includes(id)) return "#1e4d2b";
    return "#374151";
  };

  const nodeBorder = (id: string) => {
    if (!step) return "#4b5563";
    if (step.finalPath?.includes(id)) return "#f97316";
    if (id === step.current) return "#fb923c";
    if (id === START) return "#10b981";
    if (id === GOAL) return "#a855f7";
    if (step.open.includes(id)) return "#22c55e";
    if (step.closed.includes(id)) return "#3b82f6";
    return "#4b5563";
  };

  const edgeColor = (a: string, b: string) => {
    if (!step) return "#374151";
    const fp = step.finalPath;
    if (fp) {
      for (let i = 0; i < fp.length - 1; i++) {
        if ((fp[i] === a && fp[i+1] === b) || (fp[i] === b && fp[i+1] === a)) return "#f97316";
      }
    }
    const p = step.path;
    for (let i = 0; i < p.length - 1; i++) {
      if ((p[i] === a && p[i+1] === b) || (p[i] === b && p[i+1] === a)) return "#3b82f6";
    }
    return "#374151";
  };

  const edgeWidth = (a: string, b: string) => {
    if (!step) return 1;
    const fp = step.finalPath;
    if (fp) {
      for (let i = 0; i < fp.length - 1; i++) {
        if ((fp[i] === a && fp[i+1] === b) || (fp[i] === b && fp[i+1] === a)) return 3;
      }
    }
    const p = step.path;
    for (let i = 0; i < p.length - 1; i++) {
      if ((p[i] === a && p[i+1] === b) || (p[i] === b && p[i+1] === a)) return 2;
    }
    return 1;
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" size={24} />
          <span className="text-lg font-bold">RouteWise</span>
          <span className="ml-3 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
            Algorithm Playback
          </span>
        </div>
        <div className="flex gap-3">
          <Link href="/optimize" className="border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition">
            Optimizer
          </Link>
          <Link href="/dashboard" className="border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition">
            Dashboard
          </Link>
          <Link href="/" className="border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition">
            ← Home
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Title */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold mb-2">A* Algorithm — Live Playback</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Watch the A* pathfinding algorithm calculate the optimal delivery route
            from <span className="text-green-400 font-semibold">Ikeja</span> to{" "}
            <span className="text-purple-400 font-semibold">Ajah</span> — step by step, node by node.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 justify-center">
          <button
            onClick={start}
            disabled={playing}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-6 py-3 rounded-xl font-bold transition"
          >
            <Play size={16} /> {stepIdx < 0 ? "▶ Start Playback" : playing ? "Playing..." : "▶ Resume"}
          </button>
          <button
            onClick={() => setPlaying(false)}
            disabled={!playing}
            className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 disabled:opacity-40 px-6 py-3 rounded-xl font-bold transition"
          >
            ⏸ Pause
          </button>
          <button
            onClick={() => setStepIdx(p => Math.min(p + 1, ALL_STEPS.length - 1))}
            disabled={playing || stepIdx >= ALL_STEPS.length - 1}
            className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 disabled:opacity-40 px-6 py-3 rounded-xl font-bold transition"
          >
            ⏭ Step
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 px-6 py-3 rounded-xl font-bold transition"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Speed:</span>
            {[["Slow", 1400], ["Normal", 900], ["Fast", 400]].map(([label, val]) => (
              <button
                key={label}
                onClick={() => setSpeed(val as number)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${speed === val ? "bg-orange-500 text-white" : "border border-gray-700 text-gray-400 hover:border-gray-500"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((stepIdx + 1) / ALL_STEPS.length) * 100}%` }}
          />
        </div>
        <div className="text-center text-xs text-gray-500">
          Step {Math.max(0, stepIdx + 1)} of {ALL_STEPS.length}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Lagos Delivery Network Graph</h3>
            <svg viewBox="0 0 640 440" className="w-full rounded-xl bg-gray-950">
              {/* Edges */}
              {EDGES.map(([a, b, cost]) => {
                const na = NODES.find(n => n.id === a)!;
                const nb = NODES.find(n => n.id === b)!;
                const mx = (na.x + nb.x) / 2;
                const my = (na.y + nb.y) / 2;
                const color = edgeColor(a, b);
                const width = edgeWidth(a, b);
                return (
                  <g key={`${a}-${b}`}>
                    <line
                      x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                      stroke={color} strokeWidth={width}
                      strokeDasharray={color === "#374151" ? "4,3" : undefined}
                    />
                    <text x={mx} y={my - 4} textAnchor="middle" fontSize="9" fill="#6b7280">{cost}km</text>
                  </g>
                );
              })}

              {/* Nodes */}
              {NODES.map(node => {
                const isActive = step?.current === node.id;
                const isFinal = step?.finalPath?.includes(node.id);
                return (
                  <g key={node.id}>
                    {isActive && (
                      <circle cx={node.x} cy={node.y} r={22} fill={nodeColor(node.id)} opacity={0.3}>
                        <animate attributeName="r" values="22;28;22" dur="1s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      cx={node.x} cy={node.y} r={16}
                      fill={nodeColor(node.id)}
                      stroke={nodeBorder(node.id)}
                      strokeWidth={isFinal || isActive ? 2.5 : 1.5}
                    />
                    <text x={node.x} y={node.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="white" fontWeight="bold">
                      {node.id.split(" ")[0]}
                    </text>
                    {step && (step.open.includes(node.id) || step.closed.includes(node.id) || step.current === node.id) && (
                      <text x={node.x} y={node.y + 24} textAnchor="middle" fontSize="8" fill="#9ca3af">
                        f={step.fScores[node.id] ?? "?"}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Legend */}
              <g transform="translate(10, 390)">
                {[
                  { color: "#10b981", label: "Start (Ikeja)" },
                  { color: "#a855f7", label: "Goal (Ajah)" },
                  { color: "#f97316", label: "Current / Final Path" },
                  { color: "#22c55e", label: "Open (to explore)" },
                  { color: "#3b82f6", label: "Closed (visited)" },
                ].map(({ color, label }, i) => (
                  <g key={label} transform={`translate(${i * 122}, 0)`}>
                    <circle cx={6} cy={6} r={5} fill={color} />
                    <text x={14} y={10} fontSize="8" fill="#9ca3af">{label}</text>
                  </g>
                ))}
              </g>
            </svg>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Status Label */}
            <div className={`rounded-2xl p-4 border ${step?.finalPath ? "bg-orange-500/10 border-orange-500/30" : "bg-gray-900 border-gray-800"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-orange-400" />
                <span className="text-xs font-semibold text-orange-400">Algorithm Status</span>
              </div>
              <p className="text-sm text-white leading-relaxed">
                {step ? step.label : "Press ▶ Start Playback to watch the A* algorithm find the optimal route across Lagos in real time."}
              </p>
            </div>

            {/* Live f(n) scores */}
            {step && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <h4 className="text-xs font-semibold text-gray-400 mb-3">📊 Current f(n) Scores</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {Object.entries(step.fScores)
                    .sort(([, a], [, b]) => a - b)
                    .map(([node, f]) => (
                      <div key={node} className={`flex justify-between text-xs px-2 py-1 rounded ${node === step.current ? "bg-orange-500/20 text-orange-400" : "text-gray-400"}`}>
                        <span>{node}</span>
                        <span className="font-mono">f={f} g={step.gScores[node] ?? "?"} h={heuristic(node, GOAL)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Open / Closed sets */}
            {step && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
                <div>
                  <span className="text-xs font-semibold text-green-400">🟢 Open Set ({step.open.length})</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {step.open.map(n => (
                      <span key={n} className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">{n}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-400">🔵 Closed Set ({step.closed.length})</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {step.closed.map(n => (
                      <span key={n} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">{n}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Final Result */}
            {step?.finalPath && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
                <div className="text-green-400 font-bold mb-2">🏁 Optimal Route Found!</div>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>📍 {step.finalPath.join(" → ")}</div>
                  <div className="text-green-400 font-semibold mt-2">
                    Total: {step.finalPath.reduce((acc, node, i) =>
                      i === 0 ? 0 : acc + (EDGES.find(([a, b]) =>
                        (a === step.finalPath![i-1] && b === node) ||
                        (b === step.finalPath![i-1] && a === node)
                      )?.[2] ?? 0), 0)}km — optimal path
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How it works explainer */}
        <div className="bg-gray-900 border border-orange-500/20 rounded-2xl p-6">
          <h3 className="font-semibold text-orange-400 mb-4 flex items-center gap-2">
            <Zap size={16} /> How A* Works — What You're Watching
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div>
              <div className="text-white font-medium mb-1">① f(n) = g(n) + h(n)</div>
              Every node gets a score. g(n) is the real distance traveled so far. h(n) is the estimated distance to the goal. The algorithm always picks the node with the lowest f(n) score next.
            </div>
            <div>
              <div className="text-white font-medium mb-1">② Open & Closed Sets</div>
              Green nodes are in the Open Set — candidates to explore next. Blue nodes are in the Closed Set — already evaluated. This prevents revisiting and guarantees optimality.
            </div>
            <div>
              <div className="text-white font-medium mb-1">③ Why It Beats Greedy</div>
              Greedy routing only looks one step ahead — O(n²). A* looks at the full picture using the heuristic, finding shorter routes in O(n log n) time. That's the RouteWise advantage.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
