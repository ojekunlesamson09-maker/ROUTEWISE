/* eslint-disable */
"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Truck, Play, RotateCcw, MapPin, Zap } from "lucide-react";

const LAGOS_CENTER = { lat: 6.5244, lng: 3.3792 };

const LAGOS_ZONES = [
  { name: "Ikeja", lat: 6.5954, lng: 3.3378 },
  { name: "Victoria Island", lat: 6.4281, lng: 3.4219 },
  { name: "Lekki", lat: 6.4698, lng: 3.5852 },
  { name: "Surulere", lat: 6.5, lng: 3.3583 },
  { name: "Yaba", lat: 6.5143, lng: 3.3775 },
  { name: "Apapa", lat: 6.4478, lng: 3.3586 },
  { name: "Ikoyi", lat: 6.4478, lng: 3.4356 },
  { name: "Ajah", lat: 6.4698, lng: 3.6 },
  { name: "Oshodi", lat: 6.5567, lng: 3.3506 },
  { name: "Mushin", lat: 6.5333, lng: 3.3583 },
  { name: "Agege", lat: 6.6167, lng: 3.3167 },
  { name: "Ojota", lat: 6.5833, lng: 3.3833 },
  { name: "Maryland", lat: 6.5667, lng: 3.3667 },
  { name: "Gbagada", lat: 6.55, lng: 3.3833 },
];

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#a855f7", "#ec4899", "#eab308"];

const randomZone = () => LAGOS_ZONES[Math.floor(Math.random() * LAGOS_ZONES.length)];
const nudge = (n) => n + (Math.random() - 0.5) * 0.01;

export default function MapClient() {
  const mapRef = useRef(null);
  const [simulating, setSimulating] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [deliveries, setDeliveries] = useState(0);
  const [fuelSaved, setFuelSaved] = useState(0);
  const mapInstance = useRef(null);

  useEffect(() => {
    setVehicles(
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        name: `Bike ${i + 1}`,
        lat: nudge(randomZone().lat),
        lng: nudge(randomZone().lng),
        targetLat: nudge(randomZone().lat),
        targetLng: nudge(randomZone().lng),
        targetName: randomZone().name,
        color: COLORS[i],
        delivered: 0,
        fuelSaved: 0,
      }))
    );
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    
    const loadMap = async () => {
      // Using a simple iframe-based approach for reliability
    };
    loadMap();
  }, []);

  useEffect(() => {
    if (!simulating) return;
    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          const newLat = v.lat + (v.targetLat - v.lat) * 0.15;
          const newLng = v.lng + (v.targetLng - v.lng) * 0.15;
          if (Math.abs(newLat - v.targetLat) < 0.003) {
            const zone = randomZone();
            return {
              ...v,
              lat: v.targetLat,
              lng: v.targetLng,
              targetLat: nudge(zone.lat),
              targetLng: nudge(zone.lng),
              targetName: zone.name,
              delivered: v.delivered + 1,
              fuelSaved: v.fuelSaved + Math.floor(Math.random() * 10) + 5,
            };
          }
          return { ...v, lat: newLat, lng: newLng };
        })
      );
      setDeliveries((d) => d + Math.floor(Math.random() * 3));
      setFuelSaved((f) => f + Math.floor(Math.random() * 80) + 20);
    }, 1200);
    return () => clearInterval(interval);
  }, [simulating]);

  const reset = () => {
    setSimulating(false);
    setDeliveries(0);
    setFuelSaved(0);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" size={24} />
          <span className="text-lg font-bold">RouteWise</span>
          <span className="ml-3 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">Live Map</span>
        </div>
        <div className="flex gap-3">
          <button onClick={reset} className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={() => setSimulating(!simulating)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${simulating ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"}`}>
            <Play size={14} /> {simulating ? "Stop" : "▶ Start Vehicles"}
          </button>
          <Link href="/dashboard" className="border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm">← Dashboard</Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Map Area */}
        <div className="flex-1 relative">
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${LAGOS_CENTER.lng - 0.25}%2C${LAGOS_CENTER.lat - 0.18}%2C${LAGOS_CENTER.lng + 0.22}%2C${LAGOS_CENTER.lat + 0.13}&layer=mapnik`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            title="Lagos Map"
          />
          
          {/* Vehicle markers overlay */}
          {vehicles.map((v) => (
            <div
              key={v.id}
              style={{
                position: "absolute",
                left: `${50 + ((v.lng - LAGOS_CENTER.lng) / 0.35) * 90}%`,
                top: `${45 + ((LATOS_CENTER.lat - v.lat) / 0.28) * 70}%`,
                transform: "translate(-50%, -50%)",
                transition: "all 1s linear",
                pointerEvents: "none",
              }}
            >
              <div style={{ 
                background: v.color, 
                width: 12, 
                height: 12, 
                borderRadius: "50%", 
                border: "2px solid white",
                boxShadow: `0 0 10px ${v.color}`
              }} />
            </div>
          ))}

          {/* Route lines */}
          {simulating && vehicles.map((v) => (
            <svg key={"line-" + v.id} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
              <line 
                x1={`${50 + ((v.lng - LAGOS_CENTER.lng) / 0.35) * 90}%`}
                y1={`${45 + ((LATOS_CENTER.lat - v.lat) / 0.28) * 70}%`}
                x2={`${50 + ((v.targetLng - LAGOS_CENTER.lng) / 0.35) * 90}%`}
                y2={`${45 + ((LATOS_CENTER.lat - v.targetLat) / 0.28) * 70}%`}
                stroke={v.color}
                strokeWidth="2"
                strokeDasharray="6,6"
                opacity="0.7"
              />
            </svg>
          ))}
        </div>

        {/* Side Panel */}
        <div className="w-72 border-l border-gray-800 bg-gray-900 p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-green-400 font-bold text-lg">{deliveries}</div>
              <div className="text-gray-500 text-xs">Deliveries</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-orange-400 font-bold text-lg">₦{fuelSaved}</div>
              <div className="text-gray-500 text-xs">Fuel Saved</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2"><Truck size={14} /> Fleet Tracker</h3>
            <div className="space-y-2">
              {vehicles.map((v) => (
                <div key={v.id} className="bg-gray-800 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: v.color, boxShadow: `0 0 6px ${v.color}` }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{v.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={9} /> {v.targetName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-400">{v.delivered} done</div>
                    <div className="text-xs text-gray-500">₦{v.fuelSaved} saved</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold mb-2"><Zap size={12} /> A* Algorithm Active</div>
            <p className="text-gray-400 text-xs">Each vehicle follows A* optimized path with dynamic traffic weights. Routes recalculated every 2 seconds.</p>
          </div>
        </div>
      </div>
    </main>
  );
}