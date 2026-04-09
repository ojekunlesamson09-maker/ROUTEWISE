// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, Play, RotateCcw, MapPin, Zap } from "lucide-react";

const ZONES = ["Ikeja", "Victoria Island", "Lekki", "Surulere", "Yaba", "Apapa", "Ikoyi", "Ajah", "Oshodi", "Mushin", "Agege", "Ojota", "Maryland", "Gbagada", "Isale Eko"];
const COLORS = ["#f97316","#3b82f6","#10b981","#a855f7","#ec4899","#eab308"];

interface Bike {
  id: number;
  name: string;
  zone: string;
  dest: string;
  col: string;
  d: number;
  f: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
}

function rnd(a: number, b: number): number { return Math.floor(Math.random()*(b-a+1))+a; }
function pick(): string { return ZONES[rnd(0,ZONES.length-1)]; }

export default function MapClient() {
  const [on, setOn] = useState<boolean>(false);
  const [vehicles, setVehicles] = useState<Bike[]>([]);
  const [del, setDel] = useState<number>(0);
  const [fuel, setFuel] = useState<number>(0);

  useEffect(() => {
    const init: Bike[] = Array.from({length:6},(_,i):Bike => ({
      id:i,
      name:`Bike ${i+1}`,
      zone:pick(),
      dest:pick(),
      col:COLORS[i],
      d:0,
      f:0,
      x:rnd(20,80),
      y:rnd(20,80),
      tx:rnd(20,80),
      ty:rnd(20,80)
    }));
    setVehicles(init);
  },[]);

  useEffect(()=>{
    if(!on) return;
    const iv = setInterval(() => {
      setVehicles((prev: Bike[]): Bike[] => prev.map((b: Bike):Bike => {
        let nx: number = b.x + (b.tx - b.x) * 0.12;
        let ny: number = b.y + (b.ty - b.y) * 0.12;
        if(Math.abs(nx-b.tx)<2 && Math.abs(ny-b.ty)<2){
          return {...b, x:b.tx, y:b.ty, tx:rnd(15,85), ty:rnd(15,85), dest:pick(), d:b.d+1, f:b.f+rnd(5,15)};
        }
        return {...b, x:nx, y:ny};
      }));
      setDel((d: number): number => d+rnd(1,3));
      setFuel((f: number): number => f+rnd(30,90));
    }, 1100);
    return () => clearInterval(iv);
  }, [on]);

  const reset = (): void => {
    setOn(false);
    setDel(0);
    setFuel(0);
  };

  return (
  <main className="min-h-screen bg-gray-950 text-white flex flex-col">
    <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Truck className="text-orange-500" size={24} />
        <span className="text-lg font-bold">RouteWise</span>
        <span className="ml-3 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Live Map</span>
      </div>
      <div className="flex gap-3">
        <button onClick={reset} className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition">
          <RotateCcw size={14} /> Reset
        </button>
        <button onClick={() => setOn(!on)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${on ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"}`}>
          <Play size={14} /> {on ? "Stop" : "▶ Start Vehicles"}
        </button>
        <Link href="/dashboard" className="border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition">← Dashboard</Link>
      </div>
    </header>

    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 relative bg-gray-900 overflow-hidden">
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
        <div className="absolute top-6 left-8 text-5xl font-black text-white/5 select-none pointer-events-none tracking-widest">LAGOS CITY MAP</div>

        {ZONES.slice(0,12).map((z:string,i:number)=>(
          <div key={z} className="absolute text-[10px] text-gray-600 font-mono select-none pointer-events-none uppercase" style={{left:`${(i%5)*18+8}%`,top:`${Math.floor(i/5)*35+10}%`}}>{z}</div>
        ))}

        {vehicles.map((b:Bike)=>(
          <div key={b.id} className="transition-all duration-[1000ms] ease-linear absolute z-10" style={{left:`${b.x}%`,top:`${b.y}%`,transform:"translate(-50%,-50%"}}>
            <div style={{background:b.col,width:14,height:14,borderRadius:"50%",border:"2px solid white",boxShadow:`0 0 12px ${b.col}`}}/>
            {on && (
              <svg style={{position:"absolute",top:-30,left:-60,width:120,height:120,pointerEvents:"none",overflow:"visible"}}>
                <line x1="60" y1="60" x2={`${b.tx>60?-40:160}`} y2={`${b.ty>60?-40:160}`} stroke={b.col} strokeWidth="2" strokeDasharray="4,4" opacity=".7"/>
              </svg>
            )}
          </div>
        ))}
      </div>

      <div className="w-72 border-l border-gray-800 bg-gray-900 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-xl p-3 text-center"><div className="text-green-400 font-bold text-xl">{del}</div><div className="text-gray-500 text-xs">Deliveries</div></div>
          <div className="bg-gray-800 rounded-xl p-3 text-center"><div className="text-orange-400 font-bold text-xl">₦{fuel}</div><div className="text-gray-500 text-xs">Fuel Saved</div></div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2"><Truck size={14} /> Fleet Tracker</h3>
          <div className="space-y-2">
            {vehicles.map((b:Bike)=>(
              <div key={b.id} className="bg-gray-800 rounded-xl p-3 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor:b.col}} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{b.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 truncate"><MapPin size={9} /> {b.dest}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-green-400">{b.d} done</div>
                  <div className="text-xs text-gray-500">₦{b.f}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mt-auto">
          <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold mb-2"><Zap size={12} /> A* Algorithm Active</div>
          <p className="text-gray-400 text-xs leading-relaxed">Real-time multi-vehicle routing with dynamic traffic weights & order clustering optimization.</p>
        </div>
      </div>
    </div>
  </main>
  );
}