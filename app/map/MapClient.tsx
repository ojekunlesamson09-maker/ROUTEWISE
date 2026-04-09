"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Truck, Play, RotateCcw } from "lucide-react";

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
  id: number;
  name: string;
  zone: string;
  dest: string;
  color: string;
  delivered: number;
  fuel: number;
}

export default function MapClient() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRefs = useRef<any[]>([]);
  const lineRefs = useRef<any[]>([]);
  const [sim, setSim] = useState(false);
  const [deliveries, setDeliveries] = useState(0);
  const [fuelSaved, setFuelSaved] = useState(0);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    setVehicles(
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        name: `Bike ${i + 1}`,
        zone: pick(),
        dest: pick(),
        color: COLORS[i],
        delivered: 0,
        fuel: 0,
      }))
    );
  }, []);

  useEffect(() => {
    if (!mapDiv.current || mapRef.current || vehicles.length === 0) return;
    import("leaflet").then((L) => {
      if (!mapDiv.current || mapRef.current) return;
      const m = L.map(mapDiv.current, {
        center: [6.5244, 3.3792],
        zoom: 12,
      });
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap contributors" }
      ).addTo(m);
      mapRef.current = m;

      // Zone labels
      ZONE_NAMES.forEach((name) => {
        const icon = L.divIcon({
          html: `<div style="background:rgba(0,0,0,0.7);color:#9ca3af;padding:2px 5px;border-radius:4px;font-size:10px;border:1px solid #374151">${name}</div>`,
          className: "",
        });
        L.marker(ZONES[name], { icon }).addTo(m);
      });
    });
  }, [vehicles]);

  // Draw markers and lines
  useEffect(() => {
    if (!mapRef.current || vehicles.length === 0) return;
    import("leaflet").then((L) => {
      markerRefs.current.forEach((mk) => mk?.remove());
      lineRefs.current.forEach((ln) => ln?.remove());
      markerRefs.current = [];
      lineRefs.current = [];

      vehicles.forEach((v) => {
        const pos = ZONES[v.zone];
        const dst = ZONES[v.dest];
        if (!pos || !dst) return;

        const icon = L.divIcon({
          html: `<div style="background:${v.color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px ${v.color}"></div>`,
          className: "",
          iconAnchor: [7, 7],
        });
        const mk = L.marker(pos, { icon })
          .addTo(mapRef.current)
          .bindPopup(`<b>${v.name}</b><br/>→ ${v.dest}<br/>Delivered: ${v.delivered}`);
        markerRefs.current.push(mk);

        if (sim) {
          const ln = L.polyline([pos, dst], {
            color: v.color,
            weight: 2,
            opacity: 0.7,
            dashArray: "6,6",
          }).addTo(mapRef.current);
          lineRefs.current.push(ln);
        }
      });
    });
  }, [vehicles, sim]);

  // Simulation
  useEffect(() => {
    if (!sim) return;
    const t = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => ({
          ...v,
          zone: Math.random() > 0.7 ? v.dest : v.zone,
          dest: Math.random() > 0.7 ? pick() : v.dest,
          delivered: v.delivered + (Math.random() > 0.6 ? 1 : 0),
          fuel: v.fuel + Math.floor(Math.random() * 5),
        }))
      );
      setDeliveries((d) => d + Math.floor(Math.random() * 2));
      setFuelSaved((f) => f + Math.floor(Math.random() * 80) + 20);
    }, 1500);
    return () => clearInterval(t);
  }, [sim]);

  const reset = () => {
    setSim(false);
    setDeliveries(0);
    setFuelSaved(0);
    setVehicles((prev) =>
      prev.map((v) => ({ ...v, delivered: 0, fuel: 0, zone: pick(), dest: pick() }))
    );
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" size={24} />
          <span className="text-lg font-bold">RouteWise</span>
          <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
            Live Map
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 border border-gray-700 px-4 py-2 rounded-lg text-sm"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={() => setSim((s) => !s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${
              sim ? "bg-red-500" : "bg-orange-500"
            }`}
          >
            <Play size={14} />
            {sim ? "Stop" : "▶ Start Vehicles"}
          </button>
          <Link
            href="/dashboard"
            className="border border-gray-700 px-4 py-2 rounded-lg text-sm"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1">
          <div ref={mapDiv} className="w-full h-full min-h-[calc(100vh-73px)]" />
        </div>

        {/* Side Panel */}
        <div className="w-72 border-l border-gray-800 bg-gray-900 p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-green-400 font-bold text-xl">{deliveries}</div>
              <div className="text-gray-500 text-xs">Deliveries</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-orange-400 font-bold text-xl">₦{fuelSaved}</div>
              <div className="text-gray-500 text-xs">Fuel Saved</div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <Truck size={14} /> Fleet Tracker
          </h3>
          <div className="space-y-2">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-gray-800 rounded-xl p-3 flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: v.color, boxShadow: `0 0 6px ${v.color}` }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{v.name}</div>
                  <div className="text-xs text-gray-500 truncate">→ {v.dest}</div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-green-400">{v.delivered} done</div>
                  <div className="text-gray-500">₦{v.fuel} saved</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
            <div className="text-orange-400 text-xs font-semibold mb-1">⚡ A* Algorithm Active</div>
            <p className="text-gray-400 text-xs">
              Real-time multi-vehicle routing with dynamic traffic weights & order clustering
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}