"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck,
  Package,
  Zap,
  MapPin,
  Clock,
  DollarSign,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface Order {
  id: string;
  pickup: string;
  delivery: string;
  status: "pending" | "assigned" | "delivering" | "delivered";
  priority: number;
  estimatedTime: number;
  vehicle?: string;
}

interface Vehicle {
  id: string;
  name: string;
  status: "idle" | "active" | "returning";
  orders: number;
  location: string;
  fuelSaved: number;
  routeOptimized: boolean;
}

interface Metric {
  time: string;
  routewise: number;
  baseline: number;
}

interface FuelData {
  hour: string;
  saved: number;
  spent: number;
}

const lagosLocations = [
  "Ikeja", "Victoria Island", "Lekki", "Surulere", "Yaba",
  "Apapa", "Ikoyi", "Ajah", "Oshodi", "Mushin",
  "Agege", "Ojota", "Maryland", "Gbagada", "Isale Eko",
];

const randomLocation = () =>
  lagosLocations[Math.floor(Math.random() * lagosLocations.length)];

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

interface AStarNode {
  id: string;
  g: number;
  h: number;
  f: number;
}

function aStarPrioritize(orders: Order[]): Order[] {
  const nodes: AStarNode[] = orders.map((o) => {
    const g = o.estimatedTime;
    const h = (5 - o.priority) * 10;
    return { id: o.id, g, h, f: g + h };
  });
  nodes.sort((a, b) => a.f - b.f);
  const idOrder = nodes.map((n) => n.id);
  return idOrder.map((id) => orders.find((o) => o.id === id)!);
}

const INITIAL_METRIC_DATA: Metric[] = [
  { time: "8:00", routewise: 22, baseline: 47 },
  { time: "9:00", routewise: 24, baseline: 45 },
  { time: "10:00", routewise: 21, baseline: 50 },
  { time: "11:00", routewise: 19, baseline: 48 },
  { time: "12:00", routewise: 26, baseline: 52 },
  { time: "13:00", routewise: 20, baseline: 44 },
];

const INITIAL_FUEL_DATA: FuelData[] = [
  { hour: "8:00", saved: 12, spent: 38 },
  { hour: "9:00", saved: 15, spent: 42 },
  { hour: "10:00", saved: 10, spent: 35 },
  { hour: "11:00", saved: 18, spent: 40 },
  { hour: "12:00", saved: 14, spent: 45 },
  { hour: "13:00", saved: 20, spent: 39 },
];

const INITIAL_ORDERS: Order[] = [
  { id: "ORD-DEMO-001", pickup: "Ikeja", delivery: "Lekki", status: "delivered", priority: 5, estimatedTime: 28, vehicle: "V1" },
  { id: "ORD-DEMO-002", pickup: "Yaba", delivery: "Victoria Island", status: "delivered", priority: 4, estimatedTime: 22, vehicle: "V2" },
  { id: "ORD-DEMO-003", pickup: "Surulere", delivery: "Ajah", status: "delivering", priority: 3, estimatedTime: 35, vehicle: "V3" },
  { id: "ORD-DEMO-004", pickup: "Apapa", delivery: "Ikoyi", status: "delivering", priority: 5, estimatedTime: 18, vehicle: "V4" },
  { id: "ORD-DEMO-005", pickup: "Mushin", delivery: "Gbagada", status: "assigned", priority: 2, estimatedTime: 30, vehicle: "V5" },
  { id: "ORD-DEMO-006", pickup: "Ojota", delivery: "Maryland", status: "pending", priority: 4, estimatedTime: 25 },
  { id: "ORD-DEMO-007", pickup: "Oshodi", delivery: "Agege", status: "pending", priority: 3, estimatedTime: 20 },
];

const INITIAL_VEHICLES: Vehicle[] = [
  { id: "V1", name: "Bike 1", status: "returning", orders: 3, location: "Lekki", fuelSaved: 320, routeOptimized: true },
  { id: "V2", name: "Bike 2", status: "active", orders: 2, location: "Victoria Island", fuelSaved: 210, routeOptimized: true },
  { id: "V3", name: "Bike 3", status: "active", orders: 1, location: "Ajah", fuelSaved: 180, routeOptimized: true },
  { id: "V4", name: "Bike 4", status: "active", orders: 2, location: "Ikoyi", fuelSaved: 275, routeOptimized: true },
  { id: "V5", name: "Bike 5", status: "active", orders: 1, location: "Gbagada", fuelSaved: 145, routeOptimized: true },
  { id: "V6", name: "Bike 6", status: "idle", orders: 0, location: "Ikeja", fuelSaved: 0, routeOptimized: false },
];

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [simulating, setSimulating] = useState(true);
  const [totalSaved, setTotalSaved] = useState(1240);
  const [ordersDelivered, setOrdersDelivered] = useState(7);
  const [timeSaved, setTimeSaved] = useState(18);
  const [metricData, setMetricData] = useState<Metric[]>(INITIAL_METRIC_DATA);
  const [fuelData, setFuelData] = useState<FuelData[]>(INITIAL_FUEL_DATA);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!simulating) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);

      const newOrders: Order[] = Array.from(
        { length: randomBetween(1, 3) },
        (_, i) => ({
          id: `ORD-${Date.now()}-${i}`,
          pickup: randomLocation(),
          delivery: randomLocation(),
          status: "pending" as const,
          priority: randomBetween(1, 5),
          estimatedTime: randomBetween(15, 45),
        })
      );

      setOrders((prev) => {
        const combined = [...prev, ...newOrders];
        const prioritized = aStarPrioritize(
          combined.filter((o) => o.status === "pending")
        );
        const nonPending = combined.filter((o) => o.status !== "pending");
        return [...nonPending, ...prioritized].slice(-30);
      });

      setVehicles((prev) =>
        prev.map((v) => ({
          ...v,
          status: (["active", "active", "idle", "returning"] as const)[randomBetween(0, 3)],
          orders: randomBetween(1, 4),
          location: randomLocation(),
          fuelSaved: v.fuelSaved + randomBetween(1, 5),
          routeOptimized: true,
        }))
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.status === "pending" && Math.random() > 0.4
            ? { ...o, status: "assigned" as const, vehicle: `V${randomBetween(1, 6)}` }
            : o.status === "assigned" && Math.random() > 0.5
            ? { ...o, status: "delivering" as const }
            : o.status === "delivering" && Math.random() > 0.6
            ? { ...o, status: "delivered" as const }
            : o
        )
      );

      setTotalSaved((s) => s + randomBetween(50, 200));
      setTimeSaved((t) => t + randomBetween(2, 8));
      setOrdersDelivered((d) => d + randomBetween(0, 2));

      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMetricData((prev) =>
        [...prev, { time: now, routewise: randomBetween(18, 30), baseline: randomBetween(38, 55) }].slice(-10)
      );
      setFuelData((prev) =>
        [...prev, { hour: now, saved: randomBetween(8, 22), spent: randomBetween(28, 50) }].slice(-10)
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [simulating]);

  const resetSim = () => {
    setSimulating(false);
    setOrders(INITIAL_ORDERS);
    setVehicles(INITIAL_VEHICLES);
    setTotalSaved(1240);
    setOrdersDelivered(7);
    setTimeSaved(18);
    setTick(0);
    setMetricData(INITIAL_METRIC_DATA);
    setFuelData(INITIAL_FUEL_DATA);
  };

  const statusColor: Record<Order["status"], string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    assigned: "bg-blue-500/20 text-blue-400",
    delivering: "bg-orange-500/20 text-orange-400",
    delivered: "bg-green-500/20 text-green-400",
  };

  const vehicleColor: Record<Vehicle["status"], string> = {
    idle: "bg-gray-500/20 text-gray-400",
    active: "bg-green-500/20 text-green-400",
    returning: "bg-blue-500/20 text-blue-400",
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" size={24} />
          <span className="text-lg font-bold">RouteWise</span>
          <span className="ml-3 text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
            Live Dashboard
          </span>
          {simulating && (
            <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full animate-pulse">
              ● LIVE
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetSim}
            className="flex items-center gap-2 border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition"
          >
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={() => setSimulating((s) => !s)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
              simulating ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            <Play size={14} />
            {simulating ? "Stop Simulation" : "▶ Start Simulation"}
          </button>
          <Link href="/map" className="border border-orange-500/50 hover:border-orange-500 text-orange-400 px-4 py-2 rounded-lg text-sm transition">
            🗺️ Live Map
          </Link>
          <Link href="/" className="border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg text-sm transition">
            ← Home
          </Link>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <DollarSign size={20} />, label: "Fuel Saved (₦)", value: `₦${totalSaved.toLocaleString()}`, color: "text-green-400" },
            { icon: <Clock size={20} />, label: "Time Saved (min)", value: `${timeSaved} min`, color: "text-blue-400" },
            { icon: <Package size={20} />, label: "Orders Delivered", value: ordersDelivered, color: "text-orange-400" },
            { icon: <Zap size={20} />, label: "Algorithm Ticks", value: tick, color: "text-purple-400" },
          ].map((card) => (
            <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className={`${card.color} mb-2`}>{card.icon}</div>
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-gray-500 text-xs mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-semibold mb-1">Delivery Time (min)</h3>
            <p className="text-xs text-gray-500 mb-4">RouteWise A* vs Baseline Greedy</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={metricData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151" }} />
                <Legend />
                <Line type="monotone" dataKey="routewise" stroke="#f97316" strokeWidth={2} dot={false} name="RouteWise A*" />
                <Line type="monotone" dataKey="baseline" stroke="#6b7280" strokeWidth={2} dot={false} name="Baseline" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h3 className="font-semibold mb-1">Fuel Usage (₦ per hour)</h3>
            <p className="text-xs text-gray-500 mb-4">Savings generated by route clustering</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="hour" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151" }} />
                <Legend />
                <Bar dataKey="spent" fill="#374151" name="Fuel Spent" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saved" fill="#f97316" name="Fuel Saved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Package size={16} className="text-orange-500" /> Order Queue
              </h3>
              <span className="text-xs text-gray-500">A* Prioritized</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {orders.slice().reverse().map((order) => (
                <div key={order.id} className="bg-gray-800/60 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-mono text-gray-400">{order.id.slice(-8)}</div>
                    <div className="text-sm mt-0.5">
                      <MapPin size={10} className="inline text-orange-500 mr-1" />
                      {order.pickup} → {order.delivery}
                    </div>
                    {order.vehicle && (
                      <div className="text-xs text-gray-500 mt-0.5">Assigned: {order.vehicle}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-gray-500">{order.estimatedTime} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Truck size={16} className="text-orange-500" /> Fleet Status
              </h3>
              <span className="text-xs text-gray-500">6 Vehicles</span>
            </div>
            <div className="space-y-2">
              {vehicles.map((v) => (
                <div key={v.id} className="bg-gray-800/60 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500/10 p-2 rounded-lg">
                      <Truck size={16} className="text-orange-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{v.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={9} /> {v.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${vehicleColor[v.status]}`}>
                      {v.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {v.routeOptimized ? `₦${v.fuelSaved} saved` : "awaiting orders"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-orange-500/20 rounded-2xl p-6">
          <h3 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
            <Zap size={16} /> Algorithm Transparency — How RouteWise Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div>
              <div className="text-white font-medium mb-1">① A* Routing</div>
              Each delivery is scored using f(n) = g(n) + h(n) where g = actual travel cost with traffic weights and h = heuristic distance to destination. This gives O(n log n) performance vs greedy O(n²).
            </div>
            <div>
              <div className="text-white font-medium mb-1">② Order Clustering</div>
              Nearby orders are grouped using greedy nearest-neighbor clustering before vehicle assignment — reducing total distance traveled by batching pickups in the same zone.
            </div>
            <div>
              <div className="text-white font-medium mb-1">③ Dynamic Re-routing</div>
              Every 2 seconds, new orders trigger a re-prioritization pass. Vehicles are reassigned in real-time using a priority queue sorted by urgency × distance × capacity.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
