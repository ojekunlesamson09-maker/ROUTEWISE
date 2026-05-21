"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Truck, Play, RotateCcw, Menu, X } from "lucide-react";

const ZONES: Record<string, [number, number]> = {
  Ikeja: [6.5954, 3.3378],
  "Victoria Island": [6.4281, 3.4219],
  Lekki: [6.4698, 3.5852],
  Surulere: [6.5, 3.3583],
  Yaba: [6.5143, 3.3775],
  Apapa: [6.4478, 3.3586],
  Ikoyi: [6.4478, 3.4356],
  Ajah: [6.4698, 3.6],
  Oshodi: [6.5567, 3.3506],
  Mushin: [6.5333, 3.3583],
  Agege: [6.6167, 3.3167],
  Ojota: [6.5833, 3.3833],
  Maryland: [6.5667, 3.3667],
  Gbagada: [6.55, 3.3833],
};

const ZONE_NAMES = Object.keys(ZONES);
const COLORS = ["#f97316","#3b82f6","#10b981","#a855f7","#ec4899","#eab308"];
const pick = () => ZONE_NAMES[Math.floor(Math.random() * ZONE_NAMES.length)];

interface Vehicle {
  id: number; name: string; zone: string; dest: string;
  color: string; delivered: number; fuel: number; lat: number; lng: number;
}

export default function MapClient() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRefs = useRef<any[]>([]);
  const lineRefs = useRef<any[]>([]);
  const [sim, setSim] = useState(true);
  const [deliveries, setDeliveries] = useState(4);
  const [fuelSaved, setFuelSaved] = useState(860);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setVehicles(Array.from({ length: 6 }, (_, i) => {
      const zone = pick();
      const pos = ZONES[zone];
      return { id:i, name:`Bike ${i+1}`, zone, dest:pick(), color:COLORS[i],
        delivered:Math.floor(Math.random()*3), fuel:Math.floor(Math.random()*200)+100,
        lat:pos[0], lng:pos[1] };
    }));
  }, []);

  useEffect(() => {
    if (!mapDiv.current || mapRef.current || vehicles.length === 0) return;
    import("leaflet").then((L) => {
      if (!mapDiv.current || mapRef.current) return;
      const m = L.map(mapDiv.current, { center:[6.5244,3.3792], zoom:13, zoomControl:true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:"© OpenStreetMap contributors", maxZoom:19,
      }).addTo(m);
      mapRef.current = m;
      ZONE_NAMES.forEach((name) => {
        const icon = L.divIcon({
          html:`<div style="display:flex;flex-direction:column;align-items:center;">
            <div style="width:8px;height:8px;background:#f97316;border-radius:50%;border:2px solid white;"></div>
            <div style="background:rgba(0,0,0,0.75);color:#fb923c;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;margin-top:2px;white-space:nowrap;border:1px solid #f97316aa">${name}</div>
          </div>`,
          className:"", iconAnchor:[4,4],
        });
        L.marker(ZONES[name], { icon }).addTo(m);
      });
      setMapReady(true);
    });
  }, [vehicles]);

  useEffect(() => {
    if (!mapRef.current || !mapReady || vehicles.length === 0) return;
    import("leaflet").then((L) => {
      markerRefs.current.forEach(mk=>mk?.remove());
      lineRefs.current.forEach(ln=>ln?.remove());
      markerRefs.current=[];
      lineRefs.current=[];
      vehicles.forEach((v) => {
        const dst = ZONES[v.dest];
        if (!dst) return;
        const icon = L.divIcon({
          html:`<div style="position:relative;">
            <div style="background:${v.color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 10px ${v.color};"></div>
            <div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:white;padding:1px 5px;border-radius:3px;font-size:9px;white-space:nowrap;border:1px solid ${v.color}">${v.name}</div>
          </div>`,
          className:"", iconAnchor:[8,8],
        });
        const mk = L.marker([v.lat,v.lng],{icon}).addTo(mapRef.current)
          .bindPopup(`<div style="font-family:monospace;min-width:120px">
            <b style="color:${v.color}">${v.name}</b><br/>
            📍 ${v.zone}<br/>🎯 → ${v.dest}<br/>✅ ${v.delivered} done<br/>⛽ ₦${v.fuel}
          </div>`);
        markerRefs.current.push(mk);
        const ln = L.polyline([[v.lat,v.lng],dst],{color:v.color,weight:2,opacity:0.6,dashArray:"8,6"}).addTo(mapRef.current);
        lineRefs.current.push(ln);
      });
    });
  }, [vehicles, mapReady]);

  useEffect(() => {
    if (!sim) return;
    const t = setInterval(() => {
      setVehicles(prev=>prev.map(v=>{
        const dst=ZONES[v.dest];
        if(!dst)return v;
        const newLat=v.lat+(dst[0]-v.lat)*0.2;
        const newLng=v.lng+(dst[1]-v.lng)*0.2;
        const arrived=Math.abs(dst[0]-newLat)<0.001&&Math.abs(dst[1]-newLng)<0.001;
        return {...v,lat:arrived?dst[0]:newLat,lng:arrived?dst[1]:newLng,
          zone:arrived?v.dest:v.zone,dest:arrived?pick():v.dest,
          delivered:v.delivered+(arrived?1:0),fuel:v.fuel+Math.floor(Math.random()*5)};
      }));
      setDeliveries(d=>d+Math.floor(Math.random()*2));
      setFuelSaved(f=>f+Math.floor(Math.random()*80)+20);
    },1500);
    return ()=>clearInterval(t);
  },[sim]);

  const reset=()=>{
    setSim(false);setDeliveries(4);setFuelSaved(860);
    setVehicles(prev=>prev.map(v=>{
      const zone=pick();const pos=ZONES[zone];
      return{...v,delivered:0,fuel:0,zone,dest:pick(),lat:pos[0],lng:pos[1]};
    }));
  };

  return(
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* ── HEADER ── */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 bg-gray-950 z-50">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" size={22}/>
          <span className="font-bold">RouteWise</span>
          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full hidden sm:inline">Live Map</span>
          {sim&&<span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full animate-pulse">● LIVE</span>}
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile fleet toggle */}
          <button onClick={()=>setPanelOpen(p=>!p)}
            className="md:hidden flex items-center gap-1 border border-gray-700 px-3 py-1.5 rounded-lg text-xs">
            🚴 Fleet
          </button>
          <button onClick={reset} className="hidden sm:flex items-center gap-1 border border-gray-700 px-3 py-1.5 rounded-lg text-xs">
            <RotateCcw size={12}/> Reset
          </button>
          <button onClick={()=>setSim(s=>!s)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${sim?"bg-red-500":"bg-orange-500"}`}>
            <Play size={12}/>{sim?"Stop":"▶ Start"}
          </button>
          <button onClick={()=>setMenuOpen(m=>!m)} className="md:hidden p-1.5 text-gray-400">
            {menuOpen?<X size={18}/>:<Menu size={18}/>}
          </button>
          <Link href="/dashboard" className="hidden md:block border border-gray-700 px-3 py-1.5 rounded-lg text-xs">← Dashboard</Link>
          <Link href="/" className="hidden md:block border border-gray-700 px-3 py-1.5 rounded-lg text-xs">Home</Link>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen&&(
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 space-y-2 z-40">
          <button onClick={()=>{reset();setMenuOpen(false);}} className="w-full flex items-center gap-2 text-sm py-2 border-b border-gray-800 text-gray-300">
            <RotateCcw size={14}/> Reset
          </button>
          <Link href="/dashboard" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 border-b border-gray-800 text-orange-400">← Dashboard</Link>
          <Link href="/battle" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 border-b border-gray-800 text-red-400">⚔️ Route Battle</Link>
          <Link href="/" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 text-gray-300">← Home</Link>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">

        {/* MAP */}
        <div className="flex-1 relative">
          {!mapReady&&(
            <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
              <div className="text-center">
                <div className="text-4xl mb-3">🗺️</div>
                <div className="font-semibold">Loading Lagos Street Map...</div>
                <div className="text-gray-500 text-sm mt-1">Initializing RouteWise Navigation</div>
              </div>
            </div>
          )}
          <div ref={mapDiv} className="w-full h-full min-h-[calc(100vh-57px)]"/>
        </div>

        {/* SIDE PANEL — Desktop always visible, Mobile slide-up overlay */}
        <div className={`
          ${panelOpen?"translate-y-0":"translate-y-full md:translate-y-0"}
          fixed md:relative bottom-0 left-0 right-0 md:bottom-auto
          w-full md:w-72
          border-t md:border-t-0 md:border-l border-gray-800
          bg-gray-900 p-4 flex flex-col gap-3 overflow-y-auto
          transition-transform duration-300 z-40
          max-h-[60vh] md:max-h-none
        `}>
          {/* Mobile close */}
          <div className="flex items-center justify-between md:hidden">
            <span className="font-semibold text-sm">Fleet Tracker</span>
            <button onClick={()=>setPanelOpen(false)} className="text-gray-400"><X size={18}/></button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-green-400 font-bold text-lg">{deliveries}</div>
              <div className="text-gray-500 text-xs">Deliveries</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-orange-400 font-bold text-lg">₦{fuelSaved.toLocaleString()}</div>
              <div className="text-gray-500 text-xs">Fuel Saved</div>
            </div>
          </div>

          <h3 className="text-xs font-semibold text-gray-400 flex items-center gap-2">
            <Truck size={12}/> Fleet Tracker
          </h3>
          <div className="space-y-2">
            {vehicles.map(v=>(
              <div key={v.id} className="bg-gray-800 rounded-xl p-2.5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{backgroundColor:v.color,boxShadow:`0 0 6px ${v.color}`}}/>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium">{v.name}</div>
                  <div className="text-xs text-gray-500 truncate">→ {v.dest}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-green-400">{v.delivered} done</div>
                  <div className="text-gray-500">₦{v.fuel}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
            <div className="text-orange-400 text-xs font-semibold mb-1">⚡ A* Algorithm Active</div>
            <p className="text-gray-400 text-xs">Real-time routing with dynamic traffic weights across Lagos streets</p>
          </div>

          {/* Mobile nav links */}
          <div className="grid grid-cols-2 gap-2 md:hidden">
            <Link href="/battle" className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-2 text-center text-xs font-semibold">⚔️ Battle</Link>
            <Link href="/dashboard" className="bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl p-2 text-center text-xs font-semibold">📊 Dashboard</Link>
          </div>
        </div>
      </div>

      {/* Mobile fleet button overlay on map */}
      {!panelOpen&&(
        <button onClick={()=>setPanelOpen(true)}
          className="md:hidden fixed bottom-4 right-4 bg-orange-500 text-white px-4 py-3 rounded-2xl font-bold text-sm shadow-lg z-30 flex items-center gap-2">
          🚴 {vehicles.reduce((a,v)=>a+v.delivered,0)} delivered • ₦{fuelSaved.toLocaleString()} saved
        </button>
      )}
    </main>
  );
}
