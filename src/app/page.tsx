'use client';

import dynamic from 'next/dynamic';
import ControlPanel from '@/src/components/ControlPanel';
import { Package, Truck, Users, BarChart3 } from 'lucide-react';

const LogisticsMap = dynamic(() => import('@/src/components/Map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 animate-pulse flex flex-col items-center justify-center text-slate-400">
      <div className="h-8 w-8 border-4 border-slate-300 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-medium">Initializing Satellite Map...</p>
    </div>
  ) 
});

export default function Home() {
  return (
    <main className="h-screen w-screen bg-slate-50 flex overflow-hidden">
      
      <div className="absolute top-4 left-4 z-[400] w-64 flex flex-col gap-4 pointer-events-none">
        
        <div className="bg-white/95 backdrop-blur shadow-xl border border-slate-200 p-4 rounded-2xl pointer-events-auto">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Truck className="text-indigo-600" />
                FleetCommand
            </h1>
            <p className="text-xs text-slate-500 mt-1">AI-Powered Logistics V2.0</p>
        </div>

        <div className="bg-white/95 backdrop-blur shadow-xl border border-slate-200 p-4 rounded-2xl pointer-events-auto space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Users size={18} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Active Drivers</p>
                    <p className="text-lg font-bold text-slate-800">24 <span className="text-xs font-normal text-slate-400">/ 30</span></p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                    <Package size={18} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pending Orders</p>
                    <p className="text-lg font-bold text-slate-800">12 <span className="text-xs font-normal text-slate-400">Shipments</span></p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <BarChart3 size={18} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Efficiency</p>
                    <p className="text-lg font-bold text-slate-800">94% <span className="text-xs font-normal text-emerald-500">▲ 2.4%</span></p>
                </div>
            </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative h-full w-full">
        <ControlPanel />
        <LogisticsMap />
      </div>

    </main>
  );
}