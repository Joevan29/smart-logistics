'use client';

import dynamic from 'next/dynamic';
import ControlPanel from '@/src/components/ControlPanel';
import { Activity, Package, Truck, DollarSign } from 'lucide-react';

const LogisticsMap = dynamic(() => import('@/src/components/Map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-slate-100 animate-pulse rounded-xl flex flex-col items-center justify-center text-slate-400">
      <div className="h-8 w-8 border-4 border-slate-300 border-t-slate-500 rounded-full animate-spin mb-2"></div>
      <p>Memuat Peta Logistik...</p>
    </div>
  ) 
});

export default function Home() {
  const stats = [
    { 
      label: "Active Fleet", 
      value: "2 Drivers", 
      desc: "Currently on duty",
      icon: Truck, 
      color: "text-blue-600",
      bg: "bg-blue-50" 
    },
    { 
      label: "Pending Orders", 
      value: "3 Shipments", 
      desc: "Waiting for assignment",
      icon: Package, 
      color: "text-orange-600",
      bg: "bg-orange-50" 
    },
    { 
      label: "Est. Revenue", 
      value: "Rp 275.000", 
      desc: "From active orders",
      icon: DollarSign, 
      color: "text-green-600",
      bg: "bg-green-50" 
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Fleet Command Center</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Monitoring System & AI Dispatcher
            </p>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              Export Report
            </button>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
              + New Shipment
            </button>
          </div>
        </div>

        <div className="relative w-full h-[600px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
            
            <ControlPanel /> 
            
            <LogisticsMap />
            
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-default">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <h3 className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-400 font-medium">
                <Activity size={14} className="mr-1 text-slate-400" />
                {stat.desc}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}