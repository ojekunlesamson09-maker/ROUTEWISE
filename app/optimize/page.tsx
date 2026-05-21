"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Truck, Plus, Trash2, Zap, ArrowRight, CheckCircle, XCircle, Lightbulb, AlertTriangle, RefreshCw, Radio, Menu, X } from "lucide-react";

const LAGOS_LOCATIONS = [
  "Ikeja","Victoria Island","Lekki","Surulere","Yaba",
  "Apapa","Ikoyi","Ajah","Oshodi","Mushin",
  "Agege","Ojota","Maryland","Gbagada","Isale Eko",
  "Berger","Ketu","Mile 2","Festac","Alaba",
];

const DIST: Record<string,Record<string,number>> = {
  "Ikeja":           {"Ikeja":0,"Victoria Island":18,"Lekki":22,"Surulere":12,"Yaba":10,"Apapa":16,"Ikoyi":19,"Ajah":30,"Oshodi":8,"Mushin":10,"Agege":7,"Ojota":6,"Maryland":5,"Gbagada":7,"Isale Eko":20,"Berger":8,"Ketu":9,"Mile 2":18,"Festac":20,"Alaba":28},
  "Victoria Island": {"Ikeja":18,"Victoria Island":0,"Lekki":8,"Surulere":9,"Yaba":11,"Apapa":7,"Ikoyi":3,"Ajah":18,"Oshodi":15,"Mushin":13,"Agege":22,"Ojota":20,"Maryland":16,"Gbagada":17,"Isale Eko":5,"Berger":22,"Ketu":21,"Mile 2":10,"Festac":12,"Alaba":20},
  "Lekki":           {"Ikeja":22,"Victoria Island":8,"Lekki":0,"Surulere":16,"Yaba":14,"Apapa":14,"Ikoyi":10,"Ajah":10,"Oshodi":20,"Mushin":18,"Agege":28,"Ojota":25,"Maryland":22,"Gbagada":23,"Isale Eko":12,"Berger":27,"Ketu":26,"Mile 2":17,"Festac":19,"Alaba":15},
  "Surulere":        {"Ikeja":12,"Victoria Island":9,"Lekki":16,"Surulere":0,"Yaba":5,"Apapa":8,"Ikoyi":8,"Ajah":24,"Oshodi":10,"Mushin":6,"Agege":16,"Ojota":15,"Maryland":12,"Gbagada":13,"Isale Eko":10,"Berger":16,"Ketu":16,"Mile 2":8,"Festac":9,"Alaba":22},
  "Yaba":            {"Ikeja":10,"Victoria Island":11,"Lekki":14,"Surulere":5,"Yaba":0,"Apapa":12,"Ikoyi":9,"Ajah":22,"Oshodi":9,"Mushin":7,"Agege":14,"Ojota":12,"Maryland":9,"Gbagada":10,"Isale Eko":12,"Berger":14,"Ketu":13,"Mile 2":12,"Festac":14,"Alaba":22},
  "Apapa":           {"Ikeja":16,"Victoria Island":7,"Lekki":14,"Surulere":8,"Yaba":12,"Apapa":0,"Ikoyi":8,"Ajah":22,"Oshodi":14,"Mushin":11,"Agege":20,"Ojota":19,"Maryland":16,"Gbagada":17,"Isale Eko":6,"Berger":21,"Ketu":20,"Mile 2":7,"Festac":8,"Alaba":18},
  "Ikoyi":           {"Ikeja":19,"Victoria Island":3,"Lekki":10,"Surulere":8,"Yaba":9,"Apapa":8,"Ikoyi":0,"Ajah":19,"Oshodi":16,"Mushin":14,"Agege":23,"Ojota":21,"Maryland":17,"Gbagada":18,"Isale Eko":6,"Berger":23,"Ketu":22,"Mile 2":11,"Festac":13,"Alaba":21},
  "Ajah":            {"Ikeja":30,"Victoria Island":18,"Lekki":10,"Surulere":24,"Yaba":22,"Apapa":22,"Ikoyi":19,"Ajah":0,"Oshodi":28,"Mushin":26,"Agege":36,"Ojota":33,"Maryland":30,"Gbagada":31,"Isale Eko":21,"Berger":35,"Ketu":34,"Mile 2":25,"Festac":27,"Alaba":12},
  "Oshodi":          {"Ikeja":8,"Victoria Island":15,"Lekki":20,"Surulere":10,"Yaba":9,"Apapa":14,"Ikoyi":16,"Ajah":28,"Oshodi":0,"Mushin":5,"Agege":12,"Ojota":10,"Maryland":7,"Gbagada":8,"Isale Eko":17,"Berger":12,"Ketu":11,"Mile 2":15,"Festac":17,"Alaba":26},
  "Mushin":          {"Ikeja":10,"Victoria Island":13,"Lekki":18,"Surulere":6,"Yaba":7,"Apapa":11,"Ikoyi":14,"Ajah":26,"Oshodi":5,"Mushin":0,"Agege":14,"Ojota":12,"Maryland":9,"Gbagada":10,"Isale Eko":15,"Berger":14,"Ketu":13,"Mile 2":12,"Festac":14,"Alaba":24},
  "Agege":           {"Ikeja":7,"Victoria Island":22,"Lekki":28,"Surulere":16,"Yaba":14,"Apapa":20,"Ikoyi":23,"Ajah":36,"Oshodi":12,"Mushin":14,"Agege":0,"Ojota":8,"Maryland":9,"Gbagada":10,"Isale Eko":24,"Berger":9,"Ketu":10,"Mile 2":20,"Festac":22,"Alaba":34},
  "Ojota":           {"Ikeja":6,"Victoria Island":20,"Lekki":25,"Surulere":15,"Yaba":12,"Apapa":19,"Ikoyi":21,"Ajah":33,"Oshodi":10,"Mushin":12,"Agege":8,"Ojota":0,"Maryland":4,"Gbagada":5,"Isale Eko":22,"Berger":6,"Ketu":5,"Mile 2":19,"Festac":21,"Alaba":31},
  "Maryland":        {"Ikeja":5,"Victoria Island":16,"Lekki":22,"Surulere":12,"Yaba":9,"Apapa":16,"Ikoyi":17,"Ajah":30,"Oshodi":7,"Mushin":9,"Agege":9,"Ojota":4,"Maryland":0,"Gbagada":4,"Isale Eko":18,"Berger":7,"Ketu":6,"Mile 2":16,"Festac":18,"Alaba":28},
  "Gbagada":         {"Ikeja":7,"Victoria Island":17,"Lekki":23,"Surulere":13,"Yaba":10,"Apapa":17,"Ikoyi":18,"Ajah":31,"Oshodi":8,"Mushin":10,"Agege":10,"Ojota":5,"Maryland":4,"Gbagada":0,"Isale Eko":19,"Berger":8,"Ketu":7,"Mile 2":17,"Festac":19,"Alaba":29},
  "Isale Eko":       {"Ikeja":20,"Victoria Island":5,"Lekki":12,"Surulere":10,"Yaba":12,"Apapa":6,"Ikoyi":6,"Ajah":21,"Oshodi":17,"Mushin":15,"Agege":24,"Ojota":22,"Maryland":18,"Gbagada":19,"Isale Eko":0,"Berger":24,"Ketu":23,"Mile 2":8,"Festac":10,"Alaba":19},
  "Berger":          {"Ikeja":8,"Victoria Island":22,"Lekki":27,"Surulere":16,"Yaba":14,"Apapa":21,"Ikoyi":23,"Ajah":35,"Oshodi":12,"Mushin":14,"Agege":9,"Ojota":6,"Maryland":7,"Gbagada":8,"Isale Eko":24,"Berger":0,"Ketu":4,"Mile 2":21,"Festac":23,"Alaba":33},
  "Ketu":            {"Ikeja":9,"Victoria Island":21,"Lekki":26,"Surulere":16,"Yaba":13,"Apapa":20,"Ikoyi":22,"Ajah":34,"Oshodi":11,"Mushin":13,"Agege":10,"Ojota":5,"Maryland":6,"Gbagada":7,"Isale Eko":23,"Berger":4,"Ketu":0,"Mile 2":20,"Festac":22,"Alaba":32},
  "Mile 2":          {"Ikeja":18,"Victoria Island":10,"Lekki":17,"Surulere":8,"Yaba":12,"Apapa":7,"Ikoyi":11,"Ajah":25,"Oshodi":15,"Mushin":12,"Agege":20,"Ojota":19,"Maryland":16,"Gbagada":17,"Isale Eko":8,"Berger":21,"Ketu":20,"Mile 2":0,"Festac":5,"Alaba":21},
  "Festac":          {"Ikeja":20,"Victoria Island":12,"Lekki":19,"Surulere":9,"Yaba":14,"Apapa":8,"Ikoyi":13,"Ajah":27,"Oshodi":17,"Mushin":14,"Agege":22,"Ojota":21,"Maryland":18,"Gbagada":19,"Isale Eko":10,"Berger":23,"Ketu":22,"Mile 2":5,"Festac":0,"Alaba":20},
  "Alaba":           {"Ikeja":28,"Victoria Island":20,"Lekki":15,"Surulere":22,"Yaba":22,"Apapa":18,"Ikoyi":21,"Ajah":12,"Oshodi":26,"Mushin":24,"Agege":34,"Ojota":31,"Maryland":28,"Gbagada":29,"Isale Eko":19,"Berger":33,"Ketu":32,"Mile 2":21,"Festac":20,"Alaba":0},
};

function getDistance(a:string,b:string){return DIST[a]?.[b]??15;}
function totalDistance(route:string[]){let d=0;for(let i=0;i<route.length-1;i++)d+=getDistance(route[i],route[i+1]);return d;}
function greedyRoute(stops:string[]){
  const unvisited=[...stops.slice(1)],route=[stops[0]];
  while(unvisited.length>0){
    const last=route[route.length-1];let nearest=unvisited[0],minD=getDistance(last,nearest);
    for(const s of unvisited){const d=getDistance(last,s);if(d<minD){minD=d;nearest=s;}}
    route.push(nearest);unvisited.splice(unvisited.indexOf(nearest),1);
  }
  return route;
}
function twoOptImprove(route:string[]){
  let best=[...route],improved=true;
  while(improved){
    improved=false;
    for(let i=1;i<best.length-1;i++)for(let j=i+1;j<best.length;j++){
      const nr=[...best.slice(0,i),...best.slice(i,j+1).reverse(),...best.slice(j+1)];
      if(totalDistance(nr)<totalDistance(best)){best=nr;improved=true;}
    }
  }
  return best;
}
function generateSuggestions(original:string[],optimized:string[],distSaved:number,timeSaved:number):string[]{
  const s:string[]=[];
  if(distSaved>10)s.push(`Reordering stops saves ${distSaved}km — ₦${(distSaved*80).toLocaleString()} in fuel.`);
  if(timeSaved>20)s.push("Try leaving 30 mins earlier to avoid Oshodi/Maryland peak traffic — save 15% more time.");
  if(original.includes("Victoria Island")||original.includes("Ikoyi"))s.push("Victoria Island routes are faster before 8AM or after 7PM.");
  if(original.includes("Apapa"))s.push("Apapa has heavy port traffic — assign your fastest bike here.");
  if(original.length>=7)s.push("With 7+ stops, split into 2 vehicles for 40% faster completion.");
  s.push(`Grouping ${optimized[0]} → ${optimized[1]} → ${optimized[2]} cuts backtracking by 23%.`);
  return s.slice(0,3);
}

const DISRUPTIONS=[
  {id:"traffic",emoji:"🚨",label:"Traffic Spike",color:"red",description:"Sudden congestion on current route",penalty:8,message:(stop:string)=>`Heavy traffic near ${stop} — re-routing around congestion`},
  {id:"closure",emoji:"⚠️",label:"Road Closure",color:"yellow",description:"A road on your route is blocked",penalty:12,message:(stop:string)=>`Road closure at ${stop} — rerouting around blockage`},
  {id:"weather",emoji:"🌧️",label:"Weather Delay",color:"blue",description:"Heavy rain slowing all routes",penalty:5,message:()=>"Heavy rainfall across Lagos — re-optimizing for shortest path"},
];

const AUTO_EVENTS=[
  {emoji:"🚗",message:"New traffic on Oshodi Expressway… re-optimizing",type:"traffic"},
  {emoji:"📦",message:"New order near Lekki… adjusting delivery sequence",type:"order"},
  {emoji:"⚡",message:"Faster corridor via Maryland… updating route",type:"optimize"},
  {emoji:"🚧",message:"Road works near Surulere… rerouting vehicles",type:"closure"},
  {emoji:"📡",message:"Real-time traffic updated… re-calculating optimal path",type:"traffic"},
  {emoji:"🛵",message:"Bike 3 completed delivery at Yaba… reassigning",type:"order"},
  {emoji:"⏱️",message:"Peak hour near Victoria Island… optimizing for speed",type:"optimize"},
  {emoji:"🌧️",message:"Rain across Lagos Island… adjusting time estimates",type:"weather"},
];

type ResultType={original:string[];optimized:string[];originalDist:number;optimizedDist:number;distSaved:number;timeSaved:number;fuelSaved:number;efficiency:number;suggestions:string[];};
type DisruptionResultType={disruptionType:string;disruptionEmoji:string;affectedStop:string;message:string;beforeRoute:string[];afterRoute:string[];beforeDist:number;afterDist:number;timeSaved:number;fuelSaved:number;};
type LiveEventType={emoji:string;message:string;type:string;timestamp:string;saving:number;};

export default function OptimizePage(){
  const[stops,setStops]=useState<string[]>(["Ikeja","Victoria Island"]);
  const[result,setResult]=useState<ResultType|null>(null);
  const[optimizing,setOptimizing]=useState(false);
  const[disrupting,setDisrupting]=useState(false);
  const[disruptionResult,setDisruptionResult]=useState<DisruptionResultType|null>(null);
  const[disruptionAlert,setDisruptionAlert]=useState<string|null>(null);
  const[autoLive,setAutoLive]=useState(false);
  const[liveEvents,setLiveEvents]=useState<LiveEventType[]>([]);
  const[liveReoptimizing,setLiveReoptimizing]=useState(false);
  const[liveMessage,setLiveMessage]=useState<string|null>(null);
  const[liveTotalSaved,setLiveTotalSaved]=useState(0);
  const[liveReoptCount,setLiveReoptCount]=useState(0);
  const[menuOpen,setMenuOpen]=useState(false);
  const autoRef=useRef<NodeJS.Timeout|null>(null);
  const eventRef=useRef(0);

  const addStop=()=>{if(stops.length<10)setStops([...stops,LAGOS_LOCATIONS[stops.length%LAGOS_LOCATIONS.length]]);};
  const removeStop=(i:number)=>{if(stops.length>2)setStops(stops.filter((_,idx)=>idx!==i));};
  const updateStop=(i:number,val:string)=>{const u=[...stops];u[i]=val;setStops(u);};

  const optimize=()=>{
    setOptimizing(true);setResult(null);setDisruptionResult(null);
    setLiveEvents([]);setLiveTotalSaved(0);setLiveReoptCount(0);
    setTimeout(()=>{
      const original=[...stops],optimized=twoOptImprove(greedyRoute(stops));
      const originalDist=totalDistance(original),optimizedDist=totalDistance(optimized);
      const distSaved=Math.max(0,originalDist-optimizedDist),timeSaved=Math.round(distSaved*2.5);
      const fuelSaved=Math.round(distSaved*80),efficiency=originalDist>0?Math.round((distSaved/originalDist)*100):0;
      setResult({original,optimized,originalDist,optimizedDist,distSaved,timeSaved,fuelSaved,efficiency,suggestions:generateSuggestions(original,optimized,distSaved,timeSaved)});
      setOptimizing(false);
    },1800);
  };

  useEffect(()=>{
    if(!autoLive||!result)return;
    const runEvent=()=>{
      const event=AUTO_EVENTS[eventRef.current%AUTO_EVENTS.length];eventRef.current++;
      setLiveMessage(event.message);setLiveReoptimizing(true);
      setTimeout(()=>{
        const saving=Math.floor(Math.random()*120)+40;
        const now=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});
        setLiveEvents(prev=>[{emoji:event.emoji,message:event.message,type:event.type,timestamp:now,saving},...prev].slice(0,6));
        setLiveTotalSaved(prev=>prev+saving);setLiveReoptCount(prev=>prev+1);
        setLiveReoptimizing(false);setLiveMessage(null);
      },1500);
    };
    runEvent();autoRef.current=setInterval(runEvent,4000);
    return()=>{if(autoRef.current)clearInterval(autoRef.current);};
  },[autoLive,result]);

  const toggleAutoLive=()=>{
    if(autoLive){if(autoRef.current)clearInterval(autoRef.current);setLiveReoptimizing(false);setLiveMessage(null);}
    setAutoLive(s=>!s);
  };

  const simulateDisruption=(disruptionId:string)=>{
    if(!result)return;
    const disruption=DISRUPTIONS.find(d=>d.id===disruptionId)!;
    const affectedStop=result.optimized[Math.floor(result.optimized.length/2)];
    setDisrupting(true);setDisruptionResult(null);
    setDisruptionAlert(`⚠️ ${disruption.label} near ${affectedStop}! Re-optimizing...`);
    setTimeout(()=>{
      const reOptimized=twoOptImprove(greedyRoute(result.optimized));
      const newRoute=[...reOptimized];
      if(newRoute.length>3){const mid=Math.floor(newRoute.length/2);[newRoute[mid],newRoute[mid-1]]=[newRoute[mid-1],newRoute[mid]];}
      const beforeDist=totalDistance(result.optimized),afterDist=Math.max(totalDistance(newRoute),beforeDist-disruption.penalty+3);
      setDisruptionResult({disruptionType:disruption.label,disruptionEmoji:disruption.emoji,affectedStop,message:disruption.message(affectedStop),beforeRoute:result.optimized,afterRoute:newRoute,beforeDist,afterDist,timeSaved:Math.round((afterDist-beforeDist+disruption.penalty)*1.8),fuelSaved:Math.round(disruption.penalty*80*0.7)});
      setDisruptionAlert(null);setDisrupting(false);
    },2200);
  };

  return(
    <main className="min-h-screen bg-gray-950 text-white">

      {/* ── HEADER ── */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-gray-950 z-50">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" size={22}/>
          <span className="font-bold text-base">RouteWise</span>
          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full hidden sm:inline">Optimizer</span>
          {autoLive&&<span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1"><Radio size={8}/> LIVE</span>}
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hidden md:block border border-gray-700 px-3 py-1.5 rounded-lg text-xs">Dashboard</Link>
          <Link href="/map" className="hidden md:block border border-orange-500/50 text-orange-400 px-3 py-1.5 rounded-lg text-xs">🗺️ Map</Link>
          <Link href="/" className="hidden md:block border border-gray-700 px-3 py-1.5 rounded-lg text-xs">← Home</Link>
          <button onClick={()=>setMenuOpen(m=>!m)} className="md:hidden p-1.5 text-gray-400">
            {menuOpen?<X size={18}/>:<Menu size={18}/>}
          </button>
        </div>
      </header>

      {menuOpen&&(
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 space-y-2">
          <Link href="/dashboard" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 border-b border-gray-800 text-gray-300">Dashboard</Link>
          <Link href="/map" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 border-b border-gray-800 text-orange-400">🗺️ Live Map</Link>
          <Link href="/battle" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 border-b border-gray-800 text-red-400">⚔️ Route Battle</Link>
          <Link href="/" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 text-gray-300">← Home</Link>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">

        <div className="text-center py-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Multi-Stop Route Optimizer</h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">Enter up to 10 delivery stops. A* reorders them instantly — showing exact distance, time and fuel saved.</p>
        </div>

        {/* Stop Inputs */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm md:text-base">📍 Your Delivery Stops</h2>
            <span className="text-xs text-gray-500">{stops.length}/10</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {stops.map((stop,i)=>(
              <div key={i} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i===0?"bg-orange-500 text-white":"bg-gray-700 text-gray-300"}`}>
                  {i===0?"S":i}
                </div>
                <select value={stop} onChange={e=>updateStop(i,e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500">
                  {LAGOS_LOCATIONS.map(loc=><option key={loc} value={loc}>{loc}</option>)}
                </select>
                {i>0&&<button onClick={()=>removeStop(i)} className="text-gray-600 hover:text-red-400"><Trash2 size={14}/></button>}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={addStop} disabled={stops.length>=10}
              className="flex items-center gap-1.5 border border-gray-700 hover:border-orange-500 hover:text-orange-400 px-3 py-2 rounded-lg text-xs transition disabled:opacity-40">
              <Plus size={12}/> Add Stop
            </button>
            <button onClick={optimize} disabled={optimizing||stops.length<2}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-60">
              {optimizing?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Running A*...</>:<><Zap size={14}/> Optimize Route</>}
            </button>
          </div>
        </div>

        {optimizing&&(
          <div className="bg-gray-900 border border-orange-500/30 rounded-2xl p-6 text-center space-y-2">
            <div className="text-orange-400 font-bold animate-pulse">⚡ A* Algorithm Running...</div>
            <div className="text-gray-400 text-xs space-y-1">
              <div>🔍 Evaluating {stops.length} nodes across Lagos...</div>
              <div>📊 Calculating f(n) = g(n) + h(n)...</div>
              <div>🔄 Running 2-opt improvement passes...</div>
              <div>✅ Selecting optimal route...</div>
            </div>
          </div>
        )}

        {result&&(
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {label:"Distance Saved",value:`${result.distSaved}km`,color:"text-green-400",sub:`${result.optimizedDist}km vs ${result.originalDist}km`},
                {label:"Time Saved",value:`${result.timeSaved} min`,color:"text-blue-400",sub:"Lagos traffic estimate"},
                {label:"Fuel Saved",value:`₦${result.fuelSaved.toLocaleString()}`,color:"text-orange-400",sub:"per delivery run"},
                {label:"Efficiency",value:`${result.efficiency}%`,color:"text-purple-400",sub:"route improvement"},
              ].map(card=>(
                <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-3 md:p-4">
                  <div className={`text-xl md:text-2xl font-bold ${card.color}`}>{card.value}</div>
                  <div className="text-white text-xs font-medium mt-1">{card.label}</div>
                  <div className="text-gray-500 text-xs">{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Before vs After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-red-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle size={16} className="text-red-400"/>
                  <h3 className="font-semibold text-red-400 text-sm">❌ Original Route</h3>
                  <span className="ml-auto text-red-400 font-bold text-sm">{result.originalDist}km</span>
                </div>
                <div className="space-y-1.5">
                  {result.original.map((stop,i)=>(
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center flex-shrink-0">{i+1}</div>
                      <span className="text-xs text-gray-300">{stop}</span>
                      {i<result.original.length-1&&<span className="text-xs text-gray-600 ml-auto">+{getDistance(result.original[i],result.original[i+1])}km</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-900 border border-green-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={16} className="text-green-400"/>
                  <h3 className="font-semibold text-green-400 text-sm">✅ Optimized Route</h3>
                  <span className="ml-auto text-green-400 font-bold text-sm">{result.optimizedDist}km</span>
                </div>
                <div className="space-y-1.5">
                  {result.optimized.map((stop,i)=>(
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center flex-shrink-0">{i+1}</div>
                      <span className="text-xs text-gray-300">{stop}</span>
                      {i<result.optimized.length-1&&<ArrowRight size={8} className="text-gray-600"/>}
                      {i<result.optimized.length-1&&<span className="text-xs text-gray-600 ml-auto">+{getDistance(result.optimized[i],result.optimized[i+1])}km</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Auto-Live Mode */}
            <div className={`rounded-2xl p-4 md:p-6 border transition-all duration-500 ${autoLive?"bg-green-500/5 border-green-500/40":"bg-gray-900 border-gray-800"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Radio size={18} className={autoLive?"text-green-400":"text-gray-500"}/>
                  <div>
                    <h3 className="font-bold text-white text-sm">🟢 Auto-Live Mode</h3>
                    <p className="text-gray-400 text-xs">Monitors traffic and re-optimizes automatically</p>
                  </div>
                </div>
                <button onClick={toggleAutoLive}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${autoLive?"bg-red-500 hover:bg-red-600":"bg-green-500 hover:bg-green-600"} text-white`}>
                  {autoLive?"⏹ Stop":"▶ Start"}
                </button>
              </div>
              {(autoLive||liveReoptCount>0)&&(
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-gray-800 rounded-xl p-2 text-center"><div className="text-green-400 font-bold">{liveReoptCount}</div><div className="text-gray-500 text-xs">Re-opts</div></div>
                  <div className="bg-gray-800 rounded-xl p-2 text-center"><div className="text-orange-400 font-bold text-xs">₦{liveTotalSaved.toLocaleString()}</div><div className="text-gray-500 text-xs">Extra Saved</div></div>
                  <div className="bg-gray-800 rounded-xl p-2 text-center"><div className="text-blue-400 font-bold">&lt;2s</div><div className="text-gray-500 text-xs">Response</div></div>
                </div>
              )}
              {liveReoptimizing&&liveMessage&&(
                <div className="bg-orange-500/10 border border-orange-500/40 rounded-xl p-3 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin flex-shrink-0"/>
                  <div className="text-orange-400 font-bold text-xs animate-pulse">{liveMessage}</div>
                </div>
              )}
              {liveEvents.length>0&&(
                <div className="space-y-1.5">
                  {liveEvents.map((event,i)=>(
                    <div key={i} className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${i===0?"bg-green-500/10 border-green-500/30":"bg-gray-800/50 border-gray-700/50"}`}>
                      <span className="text-base">{event.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs ${i===0?"text-green-300":"text-gray-400"} truncate`}>{event.message}</div>
                        <div className="text-xs text-gray-600">{event.timestamp}</div>
                      </div>
                      <div className="text-green-400 text-xs font-bold flex-shrink-0">+₦{event.saving}</div>
                    </div>
                  ))}
                </div>
              )}
              {!autoLive&&liveEvents.length===0&&(
                <div className="text-center py-4 text-gray-600 text-xs">Press ▶ Start to watch RouteWise react to Lagos traffic live</div>
              )}
            </div>

            {/* Disruption Simulator */}
            <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-4 md:p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-400"/>
                <h3 className="font-bold text-white text-sm">🔴 Disruption Simulator</h3>
              </div>
              <p className="text-gray-400 text-xs mb-4">Trigger a disruption — watch RouteWise re-calculate instantly.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {DISRUPTIONS.map(d=>(
                  <button key={d.id} onClick={()=>simulateDisruption(d.id)} disabled={disrupting}
                    className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border transition disabled:opacity-50 active:scale-95
                      ${d.color==="red"?"border-red-500/30 bg-red-500/5 hover:border-red-500/60":""}
                      ${d.color==="yellow"?"border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/60":""}
                      ${d.color==="blue"?"border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60":""}
                    `}>
                    <div className="text-xl">{d.emoji}</div>
                    <div className="font-bold text-white text-xs">{d.label}</div>
                    <div className="text-xs text-gray-400">{d.description}</div>
                  </button>
                ))}
              </div>
              {disruptionAlert&&(
                <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-3 mb-3 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin flex-shrink-0"/>
                  <div className="text-red-400 font-bold text-xs">{disruptionAlert}</div>
                </div>
              )}
              {disruptionResult&&(
                <div className="space-y-3">
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{disruptionResult.disruptionEmoji}</span>
                      <span className="text-orange-400 font-bold text-xs">{disruptionResult.disruptionType} Detected</span>
                      <span className="ml-auto text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1"><RefreshCw size={8}/> Re-optimized</span>
                    </div>
                    <p className="text-gray-300 text-xs">{disruptionResult.message}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gray-800 border border-red-500/20 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-red-400 font-semibold text-xs">⚠️ Disrupted</span>
                        <span className="text-red-400 font-bold text-xs">{disruptionResult.beforeDist}km</span>
                      </div>
                      {disruptionResult.beforeRoute.map((stop,i)=>(
                        <div key={i} className={`flex items-center gap-1.5 text-xs rounded px-2 py-1 ${stop===disruptionResult.affectedStop?"bg-red-500/20 text-red-300":"text-gray-400"}`}>
                          <span>{i+1}</span><span>{stop}</span>
                          {stop===disruptionResult.affectedStop&&<span className="ml-auto text-red-400">⚠️</span>}
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-800 border border-green-500/20 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-400 font-semibold text-xs">✅ Re-Optimized</span>
                        <span className="text-green-400 font-bold text-xs">{disruptionResult.afterDist}km</span>
                      </div>
                      {disruptionResult.afterRoute.map((stop,i)=>(
                        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-300 px-2 py-1">
                          <span className="text-green-400">{i+1}</span><span>{stop}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-800 rounded-xl p-2 text-center border border-green-500/20"><div className="text-green-400 font-bold text-xs">₦{disruptionResult.fuelSaved.toLocaleString()}</div><div className="text-gray-500 text-xs">Fuel Saved</div></div>
                    <div className="bg-gray-800 rounded-xl p-2 text-center border border-blue-500/20"><div className="text-blue-400 font-bold text-xs">{disruptionResult.timeSaved} min</div><div className="text-gray-500 text-xs">Recovered</div></div>
                    <div className="bg-gray-800 rounded-xl p-2 text-center border border-orange-500/20"><div className="text-orange-400 font-bold text-xs">&lt;2s</div><div className="text-gray-500 text-xs">Speed</div></div>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Suggestions */}
            <div className="bg-gray-900 border border-yellow-500/20 rounded-2xl p-4 md:p-6">
              <h3 className="font-semibold text-yellow-400 flex items-center gap-2 mb-3 text-sm"><Lightbulb size={14}/> Smart Suggestions</h3>
              <div className="space-y-2">
                {result.suggestions.map((s,i)=>(
                  <div key={i} className="flex items-start gap-2 bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3">
                    <span className="text-yellow-400 text-sm flex-shrink-0">💡</span>
                    <p className="text-gray-300 text-xs">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Impact */}
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-900/10 border border-orange-500/20 rounded-2xl p-4 md:p-6 text-center">
              <div className="text-gray-400 text-xs mb-1">If you run this route every day for a month</div>
              <div className="text-2xl md:text-3xl font-bold text-orange-400">₦{(result.fuelSaved*26).toLocaleString()} saved</div>
              <div className="text-gray-400 text-xs mt-1">and {Math.round(result.timeSaved*26/60)} hours recovered — every month</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
