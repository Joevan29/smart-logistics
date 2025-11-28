"use client";

import { useState } from "react";
import { Loader2, Zap, RotateCcw, BrainCircuit } from "lucide-react"; 

export default function ControlPanel() {
  const [loading, setLoading] = useState(false);

  const handleAction = async (endpoint: string, successMsg: string) => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        console.log(successMsg);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[400] w-80">
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-5">
        
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">AI Dispatcher</h3>
            <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide">SYSTEM ONLINE</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
              onClick={() => handleAction('/api/assign', 'Optimasi Selesai!')}
              disabled={loading}
              className="group w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl font-medium text-sm transition-all shadow-lg shadow-slate-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
              <span className="flex items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} className="text-yellow-400 group-hover:text-yellow-300" />}
                Auto Assign
              </span>
              <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded">Gemini 2.0</span>
          </button>

          <button
              onClick={() => handleAction('/api/reset', 'Reset Berhasil')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 p-2.5 rounded-xl font-medium text-xs transition-all hover:border-slate-300 active:bg-slate-100"
          >
              <RotateCcw size={14} />
              Reset Simulation
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50 p-2 rounded-lg">
                <p className="text-[10px] text-slate-400 font-semibold mb-0.5">ALGORITHM</p>
                <p className="text-xs font-bold text-slate-700">Multi-Stop VRP</p>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg">
                <p className="text-[10px] text-slate-400 font-semibold mb-0.5">LATENCY</p>
                <p className="text-xs font-bold text-emerald-600">Real-time</p>
            </div>
        </div>

      </div>
    </div>
  );
}