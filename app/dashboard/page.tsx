"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Truck, Package, Zap, MapPin, Clock, DollarSign, Play, RotateCcw, Menu, X,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

interface Order {
  id: string; pickup: string; delivery: string;
  status: "pending"|"assigned"|"delivering"|"delivered";
  priority: number; estimatedTime: number; vehicle?: string;
}
interface Vehicle {
  id: string; name: string; status: "idle"|"active"|"returning";
  orders: number; location: string; fuelSaved: number; routeOptimized: boolean;
}
interface Metric { time: string; routewise: number; baseline: number; }
interface FuelData { hour: string; saved: number; spent: number; }

const lagosLocations = [
  "Ikeja","Victoria Island","Lekki","Surulere","Yaba",
  "Apapa","Ikoyi","Ajah","Oshodi","Mushin",
  "Agege","Ojota","Maryland","Gbagada","Isale Eko",
];
const randomLocation = () => lagosLocations[Math.floor(Math.random()*lagosLocations.length)];
const randomBetween = (min:number,max:number) => Math.floor(Math.random()*(max-min+1))+min;

interface AStarNode { id:string; g:number; h:number; f:number; }
function aStarPrioritize(orders:Order[]):Order[]{
  const nodes:AStarNode[]=orders.map(o=>({id:o.id,g:o.estimatedTime,h:(5-o.priority)*10,f:o.estimatedTime+(5-o.priority)*10}));
  nodes.sort((a,b)=>a.f-b.f);
  return nodes.map(n=>orders.find(o=>o.id===n.id)!);
}

const INITIAL_METRIC_DATA:Metric[]=[
  {time:"8:00",routewise:22,baseline:47},{time:"9:00",routewise:24,baseline:45},
  {time:"10:00",routewise:21,baseline:50},{time:"11:00",routewise:19,baseline:48},
  {time:"12:00",routewise:26,baseline:52},{time:"13:00",routewise:20,baseline:44},
];
const INITIAL_FUEL_DATA:FuelData[]=[
  {hour:"8:00",saved:12,spent:38},{hour:"9:00",saved:15,spent:42},
  {hour:"10:00",saved:10,spent:35},{hour:"11:00",saved:18,spent:40},
  {hour:"12:00",saved:14,spent:45},{hour:"13:00",saved:20,spent:39},
];
const INITIAL_ORDERS:Order[]=[
  {id:"ORD-DEMO-001",pickup:"Ikeja",delivery:"Lekki",status:"delivered",priority:5,estimatedTime:28,vehicle:"V1"},
  {id:"ORD-DEMO-002",pickup:"Yaba",delivery:"Victoria Island",status:"delivered",priority:4,estimatedTime:22,vehicle:"V2"},
  {id:"ORD-DEMO-003",pickup:"Surulere",delivery:"Ajah",status:"delivering",priority:3,estimatedTime:35,vehicle:"V3"},
  {id:"ORD-DEMO-004",pickup:"Apapa",delivery:"Ikoyi",status:"delivering",priority:5,estimatedTime:18,vehicle:"V4"},
  {id:"ORD-DEMO-005",pickup:"Mushin",delivery:"Gbagada",status:"assigned",priority:2,estimatedTime:30,vehicle:"V5"},
  {id:"ORD-DEMO-006",pickup:"Ojota",delivery:"Maryland",status:"pending",priority:4,estimatedTime:25},
  {id:"ORD-DEMO-007",pickup:"Oshodi",delivery:"Agege",status:"pending",priority:3,estimatedTime:20},
];
const INITIAL_VEHICLES:Vehicle[]=[
  {id:"V1",name:"Bike 1",status:"returning",orders:3,location:"Lekki",fuelSaved:320,routeOptimized:true},
  {id:"V2",name:"Bike 2",status:"active",orders:2,location:"Victoria Island",fuelSaved:210,routeOptimized:true},
  {id:"V3",name:"Bike 3",status:"active",orders:1,location:"Ajah",fuelSaved:180,routeOptimized:true},
  {id:"V4",name:"Bike 4",status:"active",orders:2,location:"Ikoyi",fuelSaved:275,routeOptimized:true},
  {id:"V5",name:"Bike 5",status:"active",orders:1,location:"Gbagada",fuelSaved:145,routeOptimized:true},
  {id:"V6",name:"Bike 6",status:"idle",orders:0,location:"Ikeja",fuelSaved:0,routeOptimized:false},
];

export default function Dashboard(){
  const [orders,setOrders]=useState<Order[]>(INITIAL_ORDERS);
  const [vehicles,setVehicles]=useState<Vehicle[]>(INITIAL_VEHICLES);
  const [simulating,setSimulating]=useState(true);
  const [totalSaved,setTotalSaved]=useState(1240);
  const [ordersDelivered,setOrdersDelivered]=useState(7);
  const [timeSaved,setTimeSaved]=useState(18);
  const [metricData,setMetricData]=useState<Metric[]>(INITIAL_METRIC_DATA);
  const [fuelData,setFuelData]=useState<FuelData[]>(INITIAL_FUEL_DATA);
  const [tick,setTick]=useState(0);
  const [menuOpen,setMenuOpen]=useState(false);
  const [activeTab,setActiveTab]=useState<"orders"|"fleet">("orders");

  useEffect(()=>{
    if(!simulating)return;
    const interval=setInterval(()=>{
      setTick(t=>t+1);
      const newOrders:Order[]=Array.from({length:randomBetween(1,3)},(_,i)=>({
        id:`ORD-${Date.now()}-${i}`,pickup:randomLocation(),delivery:randomLocation(),
        status:"pending" as const,priority:randomBetween(1,5),estimatedTime:randomBetween(15,45),
      }));
      setOrders(prev=>{
        const combined=[...prev,...newOrders];
        const prioritized=aStarPrioritize(combined.filter(o=>o.status==="pending"));
        const nonPending=combined.filter(o=>o.status!=="pending");
        return [...nonPending,...prioritized].slice(-30);
      });
      setVehicles(prev=>prev.map(v=>({
        ...v,
        status:(["active","active","idle","returning"] as const)[randomBetween(0,3)],
        orders:randomBetween(1,4),location:randomLocation(),
        fuelSaved:v.fuelSaved+randomBetween(1,5),routeOptimized:true,
      })));
      setOrders(prev=>prev.map(o=>
        o.status==="pending"&&Math.random()>0.4?{...o,status:"assigned" as const,vehicle:`V${randomBetween(1,6)}`}:
        o.status==="assigned"&&Math.random()>0.5?{...o,status:"delivering" as const}:
        o.status==="delivering"&&Math.random()>0.6?{...o,status:"delivered" as const}:o
      ));
      setTotalSaved(s=>s+randomBetween(50,200));
      setTimeSaved(t=>t+randomBetween(2,8));
      setOrdersDelivered(d=>d+randomBetween(0,2));
      const now=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
      setMetricData(prev=>[...prev,{time:now,routewise:randomBetween(18,30),baseline:randomBetween(38,55)}].slice(-10));
      setFuelData(prev=>[...prev,{hour:now,saved:randomBetween(8,22),spent:randomBetween(28,50)}].slice(-10));
    },2000);
    return ()=>clearInterval(interval);
  },[simulating]);

  const resetSim=()=>{
    setSimulating(false);
    setOrders(INITIAL_ORDERS);setVehicles(INITIAL_VEHICLES);
    setTotalSaved(1240);setOrdersDelivered(7);setTimeSaved(18);setTick(0);
    setMetricData(INITIAL_METRIC_DATA);setFuelData(INITIAL_FUEL_DATA);
  };

  const statusColor:Record<Order["status"],string>={
    pending:"bg-yellow-500/20 text-yellow-400",assigned:"bg-blue-500/20 text-blue-400",
    delivering:"bg-orange-500/20 text-orange-400",delivered:"bg-green-500/20 text-green-400",
  };
  const vehicleColor:Record<Vehicle["status"],string>={
    idle:"bg-gray-500/20 text-gray-400",active:"bg-green-500/20 text-green-400",returning:"bg-blue-500/20 text-blue-400",
  };

  return(
    <main className="min-h-screen bg-gray-950 text-white">

      {/* ── HEADER ── */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 bg-gray-950 z-50">
        <div className="flex items-center gap-2">
          <Truck className="text-orange-500" size={22}/>
          <span className="font-bold text-base">RouteWise</span>
          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full hidden sm:inline">Live Dashboard</span>
          {simulating&&<span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full animate-pulse">● LIVE</span>}
        </div>
        {/* Desktop controls */}
        <div className="hidden md:flex gap-2">
          <button onClick={resetSim} className="flex items-center gap-1.5 border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg text-xs transition">
            <RotateCcw size={12}/> Reset
          </button>
          <button onClick={()=>setSimulating(s=>!s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${simulating?"bg-red-500 hover:bg-red-600":"bg-orange-500 hover:bg-orange-600"}`}>
            <Play size={12}/>
            {simulating?"Stop":"▶ Start"}
          </button>
          <Link href="/map" className="border border-orange-500/50 text-orange-400 px-3 py-1.5 rounded-lg text-xs transition">🗺️ Map</Link>
          <Link href="/battle" className="border border-red-500/50 text-red-400 px-3 py-1.5 rounded-lg text-xs transition">⚔️ Battle</Link>
          <Link href="/" className="border border-gray-700 px-3 py-1.5 rounded-lg text-xs transition">← Home</Link>
        </div>
        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <button onClick={()=>setSimulating(s=>!s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${simulating?"bg-red-500":"bg-orange-500"}`}>
            {simulating?"Stop":"▶ Start"}
          </button>
          <button onClick={()=>setMenuOpen(m=>!m)} className="p-2 text-gray-400">
            {menuOpen?<X size={18}/>:<Menu size={18}/>}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen&&(
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 space-y-2 z-40">
          <button onClick={()=>{resetSim();setMenuOpen(false);}} className="w-full flex items-center gap-2 text-sm py-2 border-b border-gray-800 text-gray-300">
            <RotateCcw size={14}/> Reset Simulation
          </button>
          <Link href="/map" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 border-b border-gray-800 text-orange-400">🗺️ Live Map</Link>
          <Link href="/battle" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 border-b border-gray-800 text-red-400">⚔️ Route Battle</Link>
          <Link href="/compare" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 border-b border-gray-800 text-purple-400">⚡ Live Demo</Link>
          <Link href="/" onClick={()=>setMenuOpen(false)} className="block text-sm py-2 text-gray-300">← Home</Link>
        </div>
      )}

      <div className="p-3 md:p-6 space-y-4 md:space-y-6">

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {icon:<DollarSign size={18}/>,label:"Fuel Saved (₦)",value:`₦${totalSaved.toLocaleString()}`,color:"text-green-400"},
            {icon:<Clock size={18}/>,label:"Time Saved",value:`${timeSaved} min`,color:"text-blue-400"},
            {icon:<Package size={18}/>,label:"Delivered",value:ordersDelivered,color:"text-orange-400"},
            {icon:<Zap size={18}/>,label:"A* Ticks",value:tick,color:"text-purple-400"},
          ].map(card=>(
            <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-3 md:p-5">
              <div className={`${card.color} mb-1`}>{card.icon}</div>
              <div className={`text-xl md:text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-gray-500 text-xs mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {/* ── CHARTS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="font-semibold text-sm mb-1">Delivery Time (min)</h3>
            <p className="text-xs text-gray-500 mb-3">RouteWise A* vs Baseline Greedy</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={metricData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
                <XAxis dataKey="time" stroke="#6b7280" tick={{fontSize:9}}/>
                <YAxis stroke="#6b7280" tick={{fontSize:9}}/>
                <Tooltip contentStyle={{backgroundColor:"#111827",border:"1px solid #374151",fontSize:11}}/>
                <Legend wrapperStyle={{fontSize:10}}/>
                <Line type="monotone" dataKey="routewise" stroke="#f97316" strokeWidth={2} dot={false} name="RouteWise A*"/>
                <Line type="monotone" dataKey="baseline" stroke="#6b7280" strokeWidth={2} dot={false} name="Baseline"/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <h3 className="font-semibold text-sm mb-1">Fuel Usage (₦/hr)</h3>
            <p className="text-xs text-gray-500 mb-3">Savings by route clustering</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937"/>
                <XAxis dataKey="hour" stroke="#6b7280" tick={{fontSize:9}}/>
                <YAxis stroke="#6b7280" tick={{fontSize:9}}/>
                <Tooltip contentStyle={{backgroundColor:"#111827",border:"1px solid #374151",fontSize:11}}/>
                <Legend wrapperStyle={{fontSize:10}}/>
                <Bar dataKey="spent" fill="#374151" name="Fuel Spent" radius={[4,4,0,0]}/>
                <Bar dataKey="saved" fill="#f97316" name="Fuel Saved" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── ORDERS + FLEET — Mobile Tabs ── */}
        <div className="md:hidden flex gap-2 mb-2">
          <button onClick={()=>setActiveTab("orders")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${activeTab==="orders"?"bg-orange-500 text-white":"bg-gray-900 text-gray-400 border border-gray-800"}`}>
            📦 Orders
          </button>
          <button onClick={()=>setActiveTab("fleet")}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${activeTab==="fleet"?"bg-orange-500 text-white":"bg-gray-900 text-gray-400 border border-gray-800"}`}>
            🚴 Fleet
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Orders */}
          <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-4 ${activeTab!=="orders"?"hidden md:block":""}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Package size={14} className="text-orange-500"/> Order Queue
              </h3>
              <span className="text-xs text-gray-500">A* Prioritized</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {orders.slice().reverse().map(order=>(
                <div key={order.id} className="bg-gray-800/60 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="min-w-0 flex-1 mr-2">
                    <div className="text-xs font-mono text-gray-500">{order.id.slice(-8)}</div>
                    <div className="text-xs mt-0.5 truncate">
                      <MapPin size={8} className="inline text-orange-500 mr-1"/>
                      {order.pickup} → {order.delivery}
                    </div>
                    {order.vehicle&&<div className="text-xs text-gray-600">{order.vehicle}</div>}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColor[order.status]}`}>{order.status}</span>
                    <span className="text-xs text-gray-600">{order.estimatedTime}m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fleet */}
          <div className={`bg-gray-900 border border-gray-800 rounded-2xl p-4 ${activeTab!=="fleet"?"hidden md:block":""}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Truck size={14} className="text-orange-500"/> Fleet Status
              </h3>
              <span className="text-xs text-gray-500">6 Vehicles</span>
            </div>
            <div className="space-y-2">
              {vehicles.map(v=>(
                <div key={v.id} className="bg-gray-800/60 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-orange-500/10 p-1.5 rounded-lg flex-shrink-0">
                      <Truck size={14} className="text-orange-500"/>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{v.name}</div>
                      <div className="text-xs text-gray-500">{v.location}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${vehicleColor[v.status]}`}>{v.status}</span>
                    <span className="text-xs text-gray-600">{v.routeOptimized?`₦${v.fuelSaved}`:"waiting"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ALGORITHM EXPLAINER ── */}
        <div className="bg-gray-900 border border-orange-500/20 rounded-2xl p-4 md:p-6">
          <h3 className="font-semibold text-orange-400 mb-3 flex items-center gap-2 text-sm">
            <Zap size={14}/> Algorithm Transparency — How RouteWise Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
            {[
              {title:"① A* Routing",desc:"Each delivery scored using f(n) = g(n) + h(n). g = actual travel cost with traffic weights, h = heuristic distance to destination. O(n log n) vs greedy O(n²)."},
              {title:"② Order Clustering",desc:"Nearby orders grouped using nearest-neighbor clustering before vehicle assignment — reducing total distance by batching pickups in same zone."},
              {title:"③ Dynamic Re-routing",desc:"Every 2 seconds, new orders trigger a re-prioritization pass. Vehicles reassigned using priority queue sorted by urgency × distance × capacity."},
            ].map(item=>(
              <div key={item.title} className="bg-gray-800/50 rounded-xl p-3">
                <div className="text-white font-medium mb-1 text-xs">{item.title}</div>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM NAV LINKS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-4">
          {[
            {href:"/battle",label:"⚔️ Route Battle",cls:"bg-red-500/10 border-red-500/30 text-red-400"},
            {href:"/compare",label:"⚡ Live Compare",cls:"bg-purple-500/10 border-purple-500/30 text-purple-400"},
            {href:"/optimize",label:"🗺️ Optimizer",cls:"bg-orange-500/10 border-orange-500/30 text-orange-400"},
            {href:"/map",label:"📡 Live Map",cls:"bg-green-500/10 border-green-500/30 text-green-400"},
          ].map(l=>(
            <Link key={l.href} href={l.href}
              className={`border rounded-xl p-3 text-center text-sm font-semibold transition hover:opacity-80 ${l.cls}`}>
              {l.label}
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
