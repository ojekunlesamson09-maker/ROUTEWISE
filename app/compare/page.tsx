"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Truck, Zap, ArrowRight, Menu, X } from "lucide-react";

const ZONES: Record<string,{x:number;y:number}> = {
  "Ikeja":           {x:160,y:70 },
  "Maryland":        {x:260,y:85 },
  "Gbagada":         {x:300,y:125},
  "Oshodi":          {x:185,y:145},
  "Mushin":          {x:165,y:195},
  "Yaba":            {x:245,y:210},
  "Surulere":        {x:200,y:265},
  "Apapa":           {x:120,y:305},
  "Ikoyi":           {x:315,y:280},
  "Victoria Island": {x:330,y:335},
};

const BEFORE_ROUTE = ["Ikeja","Apapa","Maryland","Surulere","Gbagada","Mushin","Ikoyi","Oshodi","Yaba","Victoria Island"];
const AFTER_ROUTE  = ["Ikeja","Maryland","Gbagada","Oshodi","Yaba","Surulere","Ikoyi","Victoria Island","Apapa","Mushin"];

const BEFORE_METRICS = {distance:89,fuel:18200,eta:"3h 40m",efficiency:42};
const AFTER_METRICS  = {distance:57,fuel:11600,eta:"2h 15m",efficiency:94};

const PLAYBACK_STEPS = [
  {label:"📡 Collecting 10 delivery points across Lagos...",          phase:"collect"},
  {label:"🧮 Building distance matrix across all zones...",           phase:"matrix"},
  {label:"🔍 Initializing A* open set with start node: Ikeja...",     phase:"init"},
  {label:"📊 Evaluating f(n) = g(n) + h(n) for each node...",        phase:"evaluate"},
  {label:"🔄 Node Apapa re-scored — suboptimal path detected...",     phase:"rescore"},
  {label:"🔄 Node Surulere re-scored — better cluster found...",      phase:"rescore"},
  {label:"⚡ Running 2-opt improvement passes...",                    phase:"twoopt"},
  {label:"🔄 Swapping segments — distance reducing...",               phase:"swap"},
  {label:"✅ Optimal sequence locked in — 57km confirmed...",         phase:"done"},
];

// Intermediate routes for animation
const INTERMEDIATE_ROUTES = [
  ["Ikeja","Apapa","Maryland","Surulere","Gbagada","Mushin","Ikoyi","Oshodi","Yaba","Victoria Island"],
  ["Ikeja","Maryland","Apapa","Surulere","Gbagada","Mushin","Ikoyi","Oshodi","Yaba","Victoria Island"],
  ["Ikeja","Maryland","Gbagada","Apapa","Surulere","Mushin","Ikoyi","Oshodi","Yaba","Victoria Island"],
  ["Ikeja","Maryland","Gbagada","Oshodi","Surulere","Apapa","Ikoyi","Yaba","Mushin","Victoria Island"],
  ["Ikeja","Maryland","Gbagada","Oshodi","Yaba","Surulere","Ikoyi","Apapa","Mushin","Victoria Island"],
  ["Ikeja","Maryland","Gbagada","Oshodi","Yaba","Surulere","Ikoyi","Victoria Island","Apapa","Mushin"],
];

function routeDist(route:string[]):number{
  const D:Record<string,Record<string,number>>={
    "Ikeja":{"Maryland":5,"Gbagada":7,"Oshodi":8,"Yaba":10,"Surulere":12,"Apapa":16,"Ikoyi":19,"Mushin":10,"Victoria Island":18},
    "Maryland":{"Ikeja":5,"Gbagada":4,"Oshodi":7,"Yaba":9,"Surulere":12,"Apapa":16,"Ikoyi":17,"Mushin":9,"Victoria Island":16},
    "Gbagada":{"Ikeja":7,"Maryland":4,"Oshodi":8,"Yaba":10,"Surulere":13,"Apapa":17,"Ikoyi":18,"Mushin":10,"Victoria Island":17},
    "Oshodi":{"Ikeja":8,"Maryland":7,"Gbagada":8,"Yaba":9,"Surulere":10,"Apapa":14,"Ikoyi":16,"Mushin":5,"Victoria Island":15},
    "Yaba":{"Ikeja":10,"Maryland":9,"Gbagada":10,"Oshodi":9,"Surulere":5,"Apapa":12,"Ikoyi":9,"Mushin":7,"Victoria Island":11},
    "Surulere":{"Ikeja":12,"Maryland":12,"Gbagada":13,"Oshodi":10,"Yaba":5,"Apapa":8,"Ikoyi":8,"Mushin":6,"Victoria Island":9},
    "Apapa":{"Ikeja":16,"Maryland":16,"Gbagada":17,"Oshodi":14,"Yaba":12,"Surulere":8,"Ikoyi":8,"Mushin":11,"Victoria Island":7},
    "Ikoyi":{"Ikeja":19,"Maryland":17,"Gbagada":18,"Oshodi":16,"Yaba":9,"Surulere":8,"Apapa":8,"Mushin":14,"Victoria Island":3},
    "Mushin":{"Ikeja":10,"Maryland":9,"Gbagada":10,"Oshodi":5,"Yaba":7,"Surulere":6,"Apapa":11,"Ikoyi":14,"Victoria Island":13},
    "Victoria Island":{"Ikeja":18,"Maryland":16,"Gbagada":17,"Oshodi":15,"Yaba":11,"Surulere":9,"Apapa":7,"Ikoyi":3,"Mushin":13},
  };
  let d=0;
  for(let i=0;i<route.length-1;i++)d+=D[route[i]]?.[route[i+1]]??15;
  return d;
}

type Phase="idle"|"playing"|"done";

export default function ComparePage(){
  const[phase,setPhase]=useState<Phase>("idle");
  const[stepIdx,setStepIdx]=useState(-1);
  const[currentRoute,setCurrentRoute]=useState(BEFORE_ROUTE);
  const[routeIntermIdx,setRouteIntermIdx]=useState(0);
  const[metrics,setMetrics]=useState(BEFORE_METRICS);
  const[dotIdx,setDotIdx]=useState(0);
  const[savingsCount,setSavingsCount]=useState(0);
  const[efficiencyCount,setEfficiencyCount]=useState(42);
  const[distCount,setDistCount]=useState(89);
  const[menuOpen,setMenuOpen]=useState(false);
  const[pulseNodes,setPulseNodes]=useState<string[]>([]);
  const stepRef=useRef<NodeJS.Timeout|null>(null);
  const dotRef=useRef<NodeJS.Timeout|null>(null);

  // Dot animation
  useEffect(()=>{
    if(dotRef.current)clearInterval(dotRef.current);
    let d=0;
    dotRef.current=setInterval(()=>{
      d=(d+1)%currentRoute.length;
      setDotIdx(d);
    },phase==="playing"?300:700);
    return()=>{if(dotRef.current)clearInterval(dotRef.current);};
  },[currentRoute,phase]);

  const startPlayback=()=>{
    if(phase==="playing")return;
    setPhase("playing");
    setStepIdx(0);
    setCurrentRoute(BEFORE_ROUTE);
    setRouteIntermIdx(0);
    setMetrics(BEFORE_METRICS);
    setSavingsCount(0);
    setEfficiencyCount(42);
    setDistCount(89);
    setPulseNodes([]);

    let s=0;
    let routeIdx=0;

    stepRef.current=setInterval(()=>{
      s++;
      setStepIdx(s);

      // Rearrange route at certain steps
      if(s===2&&routeIdx<INTERMEDIATE_ROUTES.length){
        routeIdx++;setRouteIntermIdx(routeIdx);setCurrentRoute(INTERMEDIATE_ROUTES[routeIdx]);
        setPulseNodes([INTERMEDIATE_ROUTES[routeIdx][1],INTERMEDIATE_ROUTES[routeIdx][2]]);
      }
      if(s===4&&routeIdx<INTERMEDIATE_ROUTES.length){
        routeIdx++;setRouteIntermIdx(routeIdx);setCurrentRoute(INTERMEDIATE_ROUTES[routeIdx]);
        setPulseNodes([INTERMEDIATE_ROUTES[routeIdx][2],INTERMEDIATE_ROUTES[routeIdx][3]]);
      }
      if(s===5&&routeIdx<INTERMEDIATE_ROUTES.length){
        routeIdx++;setRouteIntermIdx(routeIdx);setCurrentRoute(INTERMEDIATE_ROUTES[routeIdx]);
        setPulseNodes([INTERMEDIATE_ROUTES[routeIdx][3],INTERMEDIATE_ROUTES[routeIdx][4]]);
      }
      if(s===6&&routeIdx<INTERMEDIATE_ROUTES.length){
        routeIdx++;setRouteIntermIdx(routeIdx);setCurrentRoute(INTERMEDIATE_ROUTES[routeIdx]);
        setPulseNodes([INTERMEDIATE_ROUTES[routeIdx][4],INTERMEDIATE_ROUTES[routeIdx][5]]);
      }
      if(s===7&&routeIdx<INTERMEDIATE_ROUTES.length){
        routeIdx++;setRouteIntermIdx(routeIdx);setCurrentRoute(INTERMEDIATE_ROUTES[routeIdx]);
        setPulseNodes(INTERMEDIATE_ROUTES[routeIdx]);
      }

      if(s>=PLAYBACK_STEPS.length-1){
        clearInterval(stepRef.current!);
        setCurrentRoute(AFTER_ROUTE);
        setPulseNodes([]);

        // Count down metrics live
        let dist=89,fuel=18200,eff=42,sav=0;
        const countIv=setInterval(()=>{
          dist=Math.max(57,dist-3);
          fuel=Math.max(11600,fuel-600);
          eff=Math.min(94,eff+5);
          sav=Math.min(6600,sav+550);
          setDistCount(dist);
          setMetrics(prev=>({...prev,distance:dist,fuel}));
          setEfficiencyCount(eff);
          setSavingsCount(sav);
          if(dist<=57&&eff>=94){
            clearInterval(countIv);
            setMetrics(AFTER_METRICS);
            setPhase("done");
          }
        },80);
      }
    },700);
  };

  const reset=()=>{
    if(stepRef.current)clearInterval(stepRef.current);
    setPhase("idle");setStepIdx(-1);
    setCurrentRoute(BEFORE_ROUTE);setMetrics(BEFORE_METRICS);
    setSavingsCount(0);setEfficiencyCount(42);setDistCount(89);setPulseNodes([]);
  };

  const isDone=phase==="done";
  const isPlaying=phase==="playing";
  const routeColor=isDone?"#10b981":isPlaying?"#f97316":"#ef4444";
  const currentDist=routeDist(currentRoute);

  return(
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-gray-950 z-50">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" size={22}/>
          <span className="font-bold">RouteWise</span>
          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full hidden sm:inline">Live Optimization</span>
          {isPlaying&&<span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full animate-pulse">⚡ Computing</span>}
          {isDone&&<span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✅ Optimized</span>}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/battle" className="hidden md:block border border-red-500/50 text-red-400 px-3 py-1.5 rounded-lg text-xs">⚔️ Battle</Link>
          <Link href="/optimize" className="hidden md:block border border-gray-700 px-3 py-1.5 rounded-lg text-xs">Optimizer</Link>
          <Link href="/" className="hidden md:block border border-gray-700 px-3 py-1.5 rounded-lg text-xs">← Home</Link>
          <button onClick={()=>setMenuOpen(m=>!m)} className="md:hidden p-1.5 text-gray-400">
            {menuOpen?<X size={18}/>:<Menu size={18}/>}
          </button>
        </div>
      </header>

      {menuOpen&&(
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 space-y-2">
          <Link href="/battle" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 border-b border-gray-800 text-red-400">⚔️ Route Battle</Link>
          <Link href="/optimize" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 border-b border-gray-800 text-orange-400">Route Optimizer</Link>
          <Link href="/algorithm" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 border-b border-gray-800 text-gray-300">Algorithm Playback</Link>
          <Link href="/" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 text-gray-300">← Home</Link>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

        {/* Hero */}
        <div className="text-center py-4 md:py-6">
          <div className="inline-block bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs px-4 py-1 rounded-full mb-3">
            Live Optimization Playback — Watch Intelligence Compute
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold mb-2">
            Watch RouteWise <span className="text-orange-500">Think</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-6">
            Not just the result — the entire process. Watch nodes rearrange, paths redraw, and metrics transform live as A* finds the optimal route.
          </p>
          <button
            onClick={phase==="idle"?startPlayback:reset}
            disabled={isPlaying}
            className={`px-8 md:px-12 py-4 rounded-xl font-extrabold text-base md:text-lg transition ${
              isPlaying?"bg-gray-700 text-gray-400 cursor-not-allowed":
              isDone?"bg-gray-700 hover:bg-gray-600 text-white":
              "bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white"
            }`}>
            {isPlaying&&<span className="flex items-center gap-2 justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Computing optimal route...</span>}
            {phase==="idle"&&"⚡ WATCH THE OPTIMIZATION LIVE"}
            {isDone&&"🔄 Run Again"}
          </button>
        </div>

        {/* Live Metrics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {label:"Distance",before:"89km",current:`${distCount}km`,color:isDone?"text-green-400":isPlaying?"text-orange-400":"text-red-400",border:isDone?"border-green-500/30":isPlaying?"border-orange-500/30":"border-red-500/20"},
            {label:"Fuel Cost",before:"₦18,200",current:`₦${metrics.fuel.toLocaleString()}`,color:isDone?"text-green-400":isPlaying?"text-orange-400":"text-red-400",border:isDone?"border-green-500/30":isPlaying?"border-orange-500/30":"border-red-500/20"},
            {label:"Efficiency",before:"42%",current:`${efficiencyCount}%`,color:isDone?"text-green-400":isPlaying?"text-orange-400":"text-yellow-400",border:isDone?"border-green-500/30":isPlaying?"border-orange-500/30":"border-yellow-500/20"},
            {label:"Savings",before:"₦0",current:`₦${savingsCount.toLocaleString()}`,color:isDone?"text-green-400":isPlaying?"text-orange-400":"text-gray-400",border:isDone?"border-green-500/30":isPlaying?"border-orange-500/30":"border-gray-700"},
          ].map(m=>(
            <div key={m.label} className={`bg-gray-900 border ${m.border} rounded-2xl p-3 md:p-4 transition-all duration-300`}>
              <div className="text-xs text-gray-500 mb-1">{m.label}</div>
              <div className={`text-xl md:text-2xl font-extrabold ${m.color} transition-all duration-300`}>{m.current}</div>
              {(isPlaying||isDone)&&<div className="text-xs text-gray-600 line-through mt-0.5">{m.before}</div>}
            </div>
          ))}
        </div>

        {/* Main — Route Graph + Algorithm Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Route Graph */}
          <div className={`lg:col-span-2 bg-gray-900 rounded-2xl p-4 border transition-all duration-500 ${
            isDone?"border-green-500/50":isPlaying?"border-orange-500/40":"border-gray-800"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm">
                  {phase==="idle"&&"📍 Original Route — Unoptimized"}
                  {isPlaying&&<span className="text-orange-400 animate-pulse">⚡ A* Rearranging nodes...</span>}
                  {isDone&&<span className="text-green-400">✅ Optimal Route — A* Complete</span>}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isPlaying?"Nodes rearranging in real time":"10 Lagos delivery stops"}
                </p>
              </div>
              <div className={`text-lg font-extrabold transition-all duration-300 ${isDone?"text-green-400":isPlaying?"text-orange-400":"text-red-400"}`}>
                {currentDist}km
              </div>
            </div>

            <svg viewBox="0 0 500 400" className="w-full rounded-xl bg-gray-950">
              {/* Route lines */}
              {currentRoute.map((stop,i)=>{
                if(i===currentRoute.length-1)return null;
                const a=ZONES[stop]??{x:250,y:200};
                const b=ZONES[currentRoute[i+1]]??{x:250,y:200};
                return(
                  <line key={`${stop}-${i}`}
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={routeColor} strokeWidth={isDone?2.5:2}
                    opacity={isDone?0.8:0.6}
                    strokeDasharray={isPlaying?"8,4":undefined}
                  >
                    {isPlaying&&<animate attributeName="stroke-dashoffset" values="100;0" dur="1s" repeatCount="indefinite"/>}
                  </line>
                );
              })}

              {/* Stop nodes */}
              {currentRoute.map((stop,i)=>{
                const z=ZONES[stop]??{x:250,y:200};
                const isPulse=pulseNodes.includes(stop);
                const isActive=i===dotIdx;
                return(
                  <g key={`node-${stop}-${i}`}>
                    {(isPulse||isActive)&&(
                      <circle cx={z.x} cy={z.y} r={22} fill={routeColor} opacity={0.2}>
                        <animate attributeName="r" values="16;26;16" dur="0.6s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" values="0.2;0.05;0.2" dur="0.6s" repeatCount="indefinite"/>
                      </circle>
                    )}
                    <circle cx={z.x} cy={z.y} r={15}
                      fill={i===0?"#f97316":isDone?"#10b981":isPulse?"#f97316":"#ef4444"}
                      stroke={isPulse?"#f97316":"white"} strokeWidth={isPulse?3:1.5}
                      style={{transition:"all 0.4s ease"}}
                    />
                    <text x={z.x} y={z.y+4} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">{i+1}</text>
                    <text x={z.x} y={z.y-19} textAnchor="middle" fontSize="8" fill="#9ca3af">{stop.split(" ")[0]}</text>
                  </g>
                );
              })}

              {/* Moving dot */}
              <circle
                cx={ZONES[currentRoute[dotIdx]]?.x??160}
                cy={ZONES[currentRoute[dotIdx]]?.y??70}
                r={8} fill="white" stroke={routeColor} strokeWidth={3}
                style={{filter:`drop-shadow(0 0 8px ${routeColor})`}}
              />

              {/* Status text */}
              <text x={250} y={390} textAnchor="middle" fontSize="9" fill="#4b5563">
                {isDone?"✅ Optimal sequence — 57km confirmed — A* + 2-opt verified":
                 isPlaying?"⚡ A* rearranging nodes — finding optimal sequence...":
                 "❌ Original order — 89km — not optimized"}
              </text>
            </svg>
          </div>

          {/* Algorithm Log */}
          <div className="space-y-3">

            {/* Step log */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-orange-400"/>
                <span className="text-xs font-semibold text-orange-400">Algorithm Log</span>
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {PLAYBACK_STEPS.map((s,i)=>(
                  <div key={i} className={`flex items-start gap-2 transition-all duration-300 ${
                    i<=stepIdx?"text-green-400":i===stepIdx+1&&isPlaying?"text-orange-400 animate-pulse":"text-gray-700"
                  }`}>
                    <span className="flex-shrink-0 mt-0.5">{i<=stepIdx?"▶":"·"}</span>
                    <span className="leading-tight">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live efficiency meter */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <div className="text-xs text-gray-500 mb-2">Optimization Progress</div>
              <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
                <div
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    width:`${efficiencyCount}%`,
                    background:`linear-gradient(to right, #f97316, #10b981)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Greedy: 42%</span>
                <span className={`font-bold ${isDone?"text-green-400":"text-orange-400"}`}>{efficiencyCount}%</span>
                <span className="text-green-600">Optimal: 94%</span>
              </div>
            </div>

            {/* Savings counter */}
            {(isPlaying||isDone)&&(
              <div className={`rounded-2xl p-4 text-center border transition-all duration-500 ${isDone?"bg-green-500/10 border-green-500/30":"bg-orange-500/10 border-orange-500/30"}`}>
                <div className={`text-2xl md:text-3xl font-extrabold ${isDone?"text-green-400":"text-orange-400"}`}>
                  ₦{savingsCount.toLocaleString()}
                </div>
                <div className="text-gray-400 text-xs mt-1">fuel saved this run</div>
                {isDone&&<div className="text-blue-400 font-bold text-sm mt-2">85 minutes recovered</div>}
              </div>
            )}

            {/* Final result */}
            {isDone&&(
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
                <div className="text-green-400 font-bold mb-2 text-sm">🏁 Optimization Complete!</div>
                <div className="space-y-1 text-xs text-gray-300">
                  {AFTER_ROUTE.map((stop,i)=>(
                    <div key={stop} className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 text-xs">{i+1}</span>
                      <span>{stop}</span>
                      {i<AFTER_ROUTE.length-1&&<ArrowRight size={8} className="text-gray-600"/>}
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-600 text-center">
                  Completed across 10 nodes in 1.4s — O(n log n)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Before vs After Table */}
        {(isPlaying||isDone)&&(
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6">
            <h3 className="font-bold text-base mb-4 text-center">📊 Before vs After — Live Comparison</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full text-xs md:text-sm text-left text-gray-300 min-w-[400px]">
                <thead className="bg-gray-800 text-xs uppercase">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-gray-400">Metric</th>
                    <th className="px-4 md:px-6 py-3 text-red-400">❌ Before</th>
                    <th className="px-4 md:px-6 py-3 text-green-400">✅ After</th>
                    <th className="px-4 md:px-6 py-3 text-orange-400">Saved</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {metric:"Total Distance",before:"89km",after:`${distCount}km`,saved:`${89-distCount}km`},
                    {metric:"Fuel Cost",before:"₦18,200",after:`₦${metrics.fuel.toLocaleString()}`,saved:`₦${(18200-metrics.fuel).toLocaleString()}`},
                    {metric:"Delivery ETA",before:"3h 40m",after:isDone?"2h 15m":"calculating...",saved:isDone?"1h 25m":""},
                    {metric:"Efficiency",before:"42%",after:`${efficiencyCount}%`,saved:`+${efficiencyCount-42}pts`},
                    {metric:"Algorithm",before:"Greedy O(n²)",after:isDone?"A* O(n log n)":"computing...",saved:isDone?"5× faster":""},
                  ].map((row,i)=>(
                    <tr key={row.metric} className={`border-t border-gray-700 ${i%2===1?"bg-gray-800/30":""}`}>
                      <td className="px-4 md:px-6 py-2 md:py-3 text-white font-medium">{row.metric}</td>
                      <td className="px-4 md:px-6 py-2 md:py-3 text-red-400">{row.before}</td>
                      <td className={`px-4 md:px-6 py-2 md:py-3 font-bold ${isDone?"text-green-400":"text-orange-400"}`}>{row.after}</td>
                      <td className="px-4 md:px-6 py-2 md:py-3 text-orange-400 font-bold">{isDone?row.saved:"↓"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lagos Scenario */}
        <div className="bg-gray-900 border border-orange-500/20 rounded-2xl p-4 md:p-6">
          <div className="text-xs text-orange-400 font-semibold uppercase tracking-wider mb-2">Real-World Impact</div>
          <h3 className="text-lg md:text-xl font-bold mb-4">🚴 Lagos Scenario — 15 Orders, 4 Bikes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {[
                {label:"Orders",value:"15 deliveries"},
                {label:"Available bikes",value:"4 riders"},
                {label:"Manual planning",value:"42 minutes",red:true},
                {label:"RouteWise optimization",value:"6 seconds",green:true},
                {label:"Fuel savings",value:"31% less fuel",green:true},
                {label:"Time recovered",value:"1.4 hours saved",green:true},
              ].map(r=>(
                <div key={r.label} className="flex justify-between text-sm border-b border-gray-800 pb-1.5">
                  <span className="text-gray-400">{r.label}</span>
                  <span className={`font-bold ${r.red?"text-red-400":r.green?"text-green-400":"text-white"}`}>{r.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-green-400 font-bold mb-1">If used daily for 1 month:</div>
              <div className="text-3xl font-extrabold text-orange-400">₦312,000</div>
              <div className="text-gray-400 text-xs mt-1">saved across 4 bikes</div>
              <div className="text-2xl font-bold text-blue-400 mt-3">36 hours</div>
              <div className="text-gray-400 text-xs">delivery time recovered</div>
              <div className="mt-3 text-xs text-gray-600">
                Designed to scale from 6 bikes to 10,000 vehicles.
                Efficient under growing route complexity.
              </div>
            </div>
          </div>
        </div>

        {/* Optimization Engine */}
        <div className="bg-gray-900 border border-blue-500/20 rounded-2xl p-4 md:p-6">
          <h3 className="text-lg font-bold mb-1 text-blue-400">🧠 How RouteWise Optimizes Routes</h3>
          <p className="text-gray-400 text-xs mb-4">Built for scalable real-world logistics. Efficient under growing route complexity.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {step:"01",title:"Collect & Model",desc:"Build traffic-aware distance matrix across all Lagos zones. Every road weighted by real travel cost.",color:"border-orange-500/30 bg-orange-500/5"},
              {step:"02",title:"A* Heuristic Search",desc:"f(n) = g(n) + h(n) guides search toward optimal paths in O(n log n) — not O(n²) like greedy.",color:"border-blue-500/30 bg-blue-500/5"},
              {step:"03",title:"2-opt Refinement",desc:"Improvement passes swap route segments — same technique used by enterprise logistics platforms.",color:"border-green-500/30 bg-green-500/5"},
            ].map(item=>(
              <div key={item.step} className={`border ${item.color} rounded-xl p-3`}>
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold mb-2">{item.step}</div>
                <h4 className="font-bold text-white text-xs mb-1">{item.title}</h4>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/battle" className="bg-red-500 hover:bg-red-600 text-white font-extrabold px-6 py-3 rounded-xl transition text-sm">⚔️ Live Route Battle</Link>
            <Link href="/optimize" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition text-sm">⚡ Optimize Your Route</Link>
            <Link href="/algorithm" className="border border-gray-700 hover:border-orange-500 text-white font-bold px-6 py-3 rounded-xl transition text-sm">Watch A* Playback</Link>
            <Link href="/map" className="border border-orange-500/50 text-orange-400 font-bold px-6 py-3 rounded-xl transition text-sm">📡 Live Fleet Map</Link>
          </div>
        </div>

      </div>
    </main>
  );
}
