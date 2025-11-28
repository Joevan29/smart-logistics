"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Driver, Shipment } from '@/src/types';

const truckIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #2563eb; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            🚛
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -20]
});

// Icon Paket (Merah)
const packageIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #dc2626; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            📦
         </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -20]
});

export default function LogisticsMap() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resDrivers, resShipments] = await Promise.all([
          fetch('/api/drivers'),
          fetch('/api/shipments')
        ]);
        
        const dataDrivers: Driver[] = await resDrivers.json();
        const dataShipments: Shipment[] = await resShipments.json();

        setDrivers(dataDrivers);
        setShipments(dataShipments);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }

    fetchData(); // Fetch pertama
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-slate-200 shadow-xl z-0 relative bg-slate-100">
      <MapContainer 
        center={[-6.1950, 106.8230]} 
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {drivers.map((driver) => (
           <Marker 
              key={`driver-${driver.id}`}
              position={[Number(driver.current_lat), Number(driver.current_lng)]} 
              icon={truckIcon}
            >
              <Popup>
                <div className="font-sans min-w-[120px]">
                  <h3 className="font-bold text-blue-600 text-lg">{driver.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase font-semibold">
                      {driver.vehicle_type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded text-white capitalize ${driver.status === 'busy' ? 'bg-orange-500' : 'bg-green-500'}`}>
                      {driver.status}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
        ))}

        {shipments.map((pkg) => (
            <Marker 
              key={`shipment-${pkg.id}`}
              position={[Number(pkg.destination_lat), Number(pkg.destination_lng)]} 
              icon={packageIcon}
            >
              <Popup>
                <div className="font-sans min-w-[150px]">
                  <h3 className="font-bold text-red-600">📦 {pkg.tracking_id}</h3>
                  <p className="text-sm mt-1 text-slate-600 leading-tight">{pkg.destination_address}</p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-mono bg-slate-100 px-1 rounded">{pkg.status}</span>
                    <span className="font-bold text-sm text-slate-800">Rp {Number(pkg.price).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
        ))}

        {shipments.map((pkg) => {
          if (pkg.status === 'assigned' && pkg.driver_id) {
            const assignedDriver = drivers.find(d => d.id === pkg.driver_id);
            if (assignedDriver) {
              return (
                <Polyline 
                  key={`route-${pkg.id}`}
                  positions={[
                    [assignedDriver.current_lat, assignedDriver.current_lng],
                    [pkg.destination_lat, pkg.destination_lng] 
                  ]}
                  pathOptions={{ 
                    color: '#6366f1',
                    weight: 4,
                    dashArray: '10, 10',
                    opacity: 0.7 
                  }}
                />
              );
            }
          }
          return null;
        })}

      </MapContainer>
    </div>
  );
}