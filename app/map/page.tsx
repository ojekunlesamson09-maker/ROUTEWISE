"use client";
import dynamic from "next/dynamic";

const MapClient = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-orange-500 text-4xl mb-4">🗺️</div>
        <div className="text-white text-lg font-semibold">
          Loading Lagos Map...
        </div>
        <div className="text-gray-500 text-sm mt-2">
          Initializing RouteWise Navigation
        </div>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return <MapClient />;
}