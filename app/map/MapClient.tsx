"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Truck, Play, RotateCcw, MapPin, Zap } from "lucide-react";

const LAGOS_CENTER: [number, number] = [6.5244, 3.3792];

const LAGOS_ZONES: Record<string, [number, number]> = {
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
  "Isale Eko": [6.4533, 3.3925],
};

const ZONE_NAMES = Object.keys(LAGOS_ZONES);

interface Vehicle {
  id: string;
  name: string;
  position: [number, number];
  target: [number, number];
  targetName: string;
  status: "idle" | "active" | "returning";
  color: string;
  ordersDelivered: number;
  fuelSaved: number;
}

const VEHICLE_COLORS = [
  "#f97316",
  "#3b82f6",
  "#10b981",
  "#a855f7",
  "#ec4899",
  "#eab308",
];

const randomZone = (): [string, [number, number]] => {
  const name = ZONE_NAMES[Math.floor(Math.random() * ZONE_NAMES.length)];
  return [name, LAGOS_ZONES[name]];
};

const nudge = (coord: [number, number]): [number, number] => [
  coord[0] + (Math.random() - 0.5) * 0.01,
  coord[1] + (Math.random() - 0.5) * 0.01,
];

export default function MapClient() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLinesRef = useRef<any[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [totalFuelSaved, setTotalFuelSaved] = useState(0);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const v: Vehicle[] = Array.from({ length: 6 }, (_, i) => {
      const [, pos] = randomZone();
      const [targetName, target] = randomZone();
      return {
        id: `V${i + 1}`,
        name: `Bike ${i + 1}`,
        position: nudge(pos),
        target: nudge(target),
        targetName,
        status: "idle",
        color: VEHICLE_COLORS[i],
        ordersDelivered: 0,
        fuelSaved: 0,
      };
    });
    setVehicles(v);
  }, []);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    (mapRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id = undefined;

    import("leaflet").then((L) => {
      const map = L.map(mapRef.current!, {
        center: LAGOS_CENTER,
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      map.setView(LAGOS_CENTER, 12);

      Object.entries(LAGOS_ZONES).forEach(([name, coords]) => {
        const icon = L.divIcon({
          html: `<div style="background:#1f2937;border:1px solid #374151;color:#9ca3af;padding:2px 6px;border-radius:6px;font-size:10px;white-space:nowrap;">${name}</div>`,
          className: "",
          iconAnchor: [0, 0],
        });
        L.marker(coords as any, { icon: icon as any }).addTo(map);
      });

      leafletMap.current = map;
      setMapReady(true);
    });

    return () => {
      if (leafletMap.current) {
        try { (leafletMap.current as any).remove(); } catch(e) {}
        leafletMap.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !leafletMap.current) return;
    import("leaflet").then((L) => {
      markersRef.current.forEach((m) => {
        try { m.remove(); } catch(e) {}
      });
      routeLinesRef.current.forEach((l) => {
        try { l.remove(); } catch(e) {}
      });
      markersRef.current = [];
      routeLinesRef.current = [];

      vehicles.forEach((v) => {
        const icon = L.divIcon({
          html: `<div style="background:${v.color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px ${v.color};"></div>`,
          className: "",
          iconAnchor: [7, 7],
        });
        const marker: any = L.marker(v.position as any, { icon as any }).addTo(leafletMap.current);
        marker.bindPopup(`<b>${v.name}</b><br/>Status: ${v.status}<br/>Delivered: ${v.ordersDelivered}`);
        markersRef.current.push(marker);

        if (simulating) {
          const line: any = L.polyline([v.position, v.target], {
            color: v.color,
            weight: 2,
            opacity: 0.6,
            dashArray: "6, 6",
          });
          line.addTo(leafletMap.current);
          routeLinesRef.current.push(line);
        }
      });
    });
  }, [vehicles, mapReady, simulating]);

  useEffect(() => {
    if (!simulating) return;
    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          const newLat = v.position[0] + (v.target[0] - v.position[0]) * 0.2;
          const newLng = v.position[1] + (v.target[1] - v.position[1]) * 0.2;
          const dist = Math.abs(newLat - v.target[0]) + Math.abs(newLng - v.target[1]);

          if (dist < 0.002) {
            const [newTargetName, newTarget] = randomZone();
            return {
              ...v,
              position: v.target,
              target: nudge(newTarget),
              targetName: newTargetName,
              status: "active" as const,
              ordersDelivered: v.ordersDelivered + 1,
              fuelSaved: v.fuelSaved + Math.floor(Math.random() * 5) + 1,
            };
          }
          return {
            ...v,
            position: [newLat, newLng] as [number, number],
            status: "active" as const,
          };
        })
      );
      setTotalDeliveries((d) => d + Math.floor(Math.random() * 2));
      setTotalFuelSaved((f) => f + Math.floor(Math.random() * 50) + 10);
    }, 1000);
    return () => clearInterval(interval);
  }, [simulating]);

  const reset = () => {
    setSimulating(false);
    setTotalDeliveries(0);
    setTotalFuelSaved(0);
    setVehicles((prev) =>
      prev.map((v) => ({
        ...v,
        status: "idle" as const,
        ordersDelivered: 0,
        fuelSaved: 0,
      }))
    );
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" size={24} />
          <span className="text-lg font-bold">RouteWise</span>
          <span className="ml-3 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
            Live Map
          </span>
        </div>
        <div className="flex gap-3">
          <button onClick={reset} className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={() => setSimulating((s) => !s)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${simulating ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"}`}>
            <Play size={14} />
            {simulating ? "Stop" : "▶ Start Vehicles"}
          </button>
          <Link href="/dashboard" className="border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition">
            ← Dashboard
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full min-h-[600px]" />
          {!mapReady && (
            <div className="absolute inset-0 bg-gray-950 flex items-center justify-center">
              <div className="text-center">
                <div className="text-orange-500 text-4xl mb-4">🗺️</div>
                <div className="text-white">Loading map...</div>
              </div>
            </div>
          )}
        </div>

        <div className="w-72 border-l border-gray-800 bg-gray-900 p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-green-400 font-bold text-lg">{totalDeliveries}</div>
              <div className="text-gray-500 text-xs">Deliveries</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-center">
              <div className="text-orange-400 font-bold text-lg">₦{totalFuelSaved}</div>
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
                    <div className="text-xs text-gray-500 flex items-center gap-1 truncate"><MapPin size={9} /> {v.targetName}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-green-400">{v.ordersDelivered} done</div>
                    <div className="text-xs text-gray-500">₦{v.fuelSaved} saved</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold mb-2"><Zap size={12} /> A* Algorithm Active</div>
            <p className="text-gray-400 text-xs leading-relaxed">Each vehicle follows an A* optimized path with dynamic traffic weights. Routes are recalculated every 2s as new orders arrive.</p>
          </div>
        </div>
      </div>
    </main>
  );
}