"use client";

import { useState } from "react";
import { Loader2, Zap, RotateCcw } from "lucide-react"; 

export default function ControlPanel() {
  const [loading, setLoading] = useState(false);

  const handleAction = async (endpoint: string, successMsg: string) => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok) {
        alert(`✅ ${successMsg}`);
        window.location.reload(); 
      } else {
        alert("Gagal: " + (data.message || data.error));
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-slate-200 w-72 transition-all hover:shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Zap size={20} />
        </div>
        <div>
            <h3 className="font-bold text-slate-800 leading-none">AI Dispatcher</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-1">POWERED BY GEMINI</p>
        </div>
      </div>

      <div className="space-y-2">
        <button
            onClick={() => handleAction('/api/assign', 'Optimasi Selesai! Driver telah ditugaskan.')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-all shadow-md disabled:opacity-70"
        >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Auto Assign Orders"}
        </button>

        <button
            onClick={() => handleAction('/api/reset', 'Sistem berhasil di-reset.')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 px-4 rounded-lg font-medium text-sm transition-all"
        >
            <RotateCcw size={16} />
            Reset Simulation
        </button>
      </div>
    </div>
  );
}