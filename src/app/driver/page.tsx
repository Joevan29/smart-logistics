"use client";

import { useState, useEffect } from 'react';
import { MapPin, Package, Navigation, CheckCircle, Truck } from 'lucide-react';
import Pusher from 'pusher-js';
import { Driver, Shipment } from '@/src/types';

export default function DriverApp() {
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [activeShipment, setActiveShipment] = useState<Shipment | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Data Awal
  const fetchData = async () => {
    const [resD, resS] = await Promise.all([fetch('/api/drivers'), fetch('/api/shipments')]);
    const dData = await resD.json();
    const sData = await resS.json();
    setDrivers(dData);

    if (selectedDriverId) {
      const myJob = sData.find((s: Shipment) => s.driver_id === selectedDriverId && s.status !== 'delivered');
      setActiveShipment(myJob || null);
    }
  };

  useEffect(() => {
    fetchData();
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe('map-channel');
    channel.bind('update-data', () => fetchData());
    return () => { pusher.unsubscribe('map-channel'); };
  }, [selectedDriverId]);

  const updateStatus = async (status: 'in_transit' | 'delivered') => {
    if (!selectedDriverId || !activeShipment) return;
    setLoading(true);
    
    await fetch('/api/driver/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        driver_id: selectedDriverId, 
        shipment_id: activeShipment.id, 
        status 
      })
    });

    setLoading(false);
    fetchData(); 
  };

  if (!selectedDriverId) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-300">
            <Truck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Driver Login</h1>
          <p className="text-slate-500 mb-8 text-sm">Pilih akun untuk mulai simulasi</p>
          
          <div className="grid gap-3">
            {drivers.map(d => (
              <button 
                key={d.id}
                onClick={() => setSelectedDriverId(d.id)}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl group-hover:bg-white">
                  {d.vehicle_type === 'motor' ? '🛵' : '🚚'}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{d.name}</p>
                  <p className="text-xs text-slate-500 uppercase">{d.vehicle_type} • ID: {d.id}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto border-x border-slate-200 shadow-2xl relative flex flex-col">
      
      <div className="bg-slate-900 text-white p-6 rounded-b-[2.5rem] shadow-xl z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-slate-400 text-xs font-medium mb-1">Selamat Bekerja,</p>
            <h2 className="text-xl font-bold">{drivers.find(d => d.id === selectedDriverId)?.name}</h2>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${activeShipment ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-300">Status Saat Ini</p>
            <p className="font-bold text-lg">{activeShipment ? '🟢 ON DUTY' : '⚪ IDLE (Menunggu)'}</p>
          </div>
          <button onClick={() => setSelectedDriverId(null)} className="text-xs text-slate-300 underline">Logout</button>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center">
        {activeShipment ? (
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 space-y-6 animate-in slide-in-from-bottom-10">
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold mb-3">
                ORDER MASUK
              </span>
              <h3 className="text-2xl font-bold text-slate-900">Rp {Number(activeShipment.price).toLocaleString('id-ID')}</h3>
              <p className="text-slate-500 text-sm">{activeShipment.tracking_id}</p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  <div className="w-0.5 h-10 bg-slate-200 my-1"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div className="space-y-6 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs">Lokasi Jemput</p>
                    <p className="font-medium text-slate-800">{activeShipment.origin_address}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Lokasi Antar</p>
                    <p className="font-medium text-slate-800">{activeShipment.destination_address}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
               <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                 <Package size={16} /> Berat Paket
               </span>
               <span className="font-bold text-slate-900">{activeShipment.weight} kg</span>
            </div>

            <div className="pt-2">
              {activeShipment.status === 'assigned' && (
                <button 
                  onClick={() => updateStatus('in_transit')}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {loading ? 'Memproses...' : <><Navigation size={20}/> Mulai Pengantaran</>}
                </button>
              )}
              
              {activeShipment.status === 'in_transit' && (
                <button 
                  onClick={() => updateStatus('delivered')}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {loading ? 'Memproses...' : <><CheckCircle size={20}/> Selesaikan Order</>}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 opacity-50">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Truck className="text-slate-400 w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Mencari Order...</h3>
            <p className="text-sm text-slate-500">Tunggu admin menugaskan paket.</p>
          </div>
        )}
      </div>

    </div>
  );
}