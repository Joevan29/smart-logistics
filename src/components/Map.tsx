"use client";

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Pusher from 'pusher-js';
import { Driver, Shipment } from '@/src/types';

const getDriverColor = (id: number) => {
  const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#db2777'];
  return colors[id % colors.length];
};

// --- Custom Icons ---
const createIcon = (emoji: string, color: string) => L.divIcon({
  className: 'custom-map-icon',
  html: `
    <div style="
      background-color: ${color};
      width: 36px; height: 36px;
      border-radius: 50% 50% 0 50%;
      transform: rotate(45deg);
      display: flex; align-items: center; justify-content: center;
      border: 3px solid white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    ">
      <div style="transform: rotate(-45deg); font-size: 18px;">${emoji}</div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -30]
});

export default function LogisticsMap() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [driverRoutes, setDriverRoutes] = useState<Record<number, [number, number][]>>({});

  const fetchData = async () => {
    try {
      const [resDrivers, resShipments] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/shipments')
      ]);
      setDrivers(await resDrivers.json());
      setShipments(await resShipments.json());
    } catch (err) {
      console.error("Error data:", err);
    }
  };

  const calculateRoutes = async (currentDrivers: Driver[], currentShipments: Shipment[]) => {
    const newRoutes: Record<number, [number, number][]> = {};
    const assignedShipments: Record<number, Shipment[]> = {};
    
    currentShipments.forEach(pkg => {
        if (pkg.status === 'assigned' && pkg.driver_id) {
            if (!assignedShipments[pkg.driver_id]) assignedShipments[pkg.driver_id] = [];
            assignedShipments[pkg.driver_id].push(pkg);
        }
    });

    for (const [driverId, packages] of Object.entries(assignedShipments)) {
        const dId = Number(driverId);
        const driver = currentDrivers.find(d => d.id === dId);
        
        if (driver) {
            packages.sort((a, b) => (a.route_order || 0) - (b.route_order || 0));
            
            let coordsString = `${driver.current_lng},${driver.current_lat}`;
            packages.forEach(pkg => coordsString += `;${pkg.destination_lng},${pkg.destination_lat}`);

            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.routes?.[0]) {
                    newRoutes[dId] = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
                }
            } catch (error) { console.error("Routing error", error); }
        }
    }
    setDriverRoutes(newRoutes);
  };

  useEffect(() => {
    fetchData();
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe('map-channel');
    channel.bind('update-data', () => { fetchData(); });
    return () => { pusher.unsubscribe('map-channel'); };
  }, []);

  useEffect(() => {
    if (drivers.length && shipments.length) calculateRoutes(drivers, shipments);
  }, [shipments, drivers]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-inner bg-slate-100 relative z-0">
      <MapContainer 
        center={[-6.2000, 106.8166]} 
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; CartoDB'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {drivers.map((driver) => (
           <Marker 
              key={`driver-${driver.id}`}
              position={[Number(driver.current_lat), Number(driver.current_lng)]} 
              icon={createIcon(driver.vehicle_type === 'motor' ? '🛵' : driver.vehicle_type === 'truck' ? '🚚' : '🚐', getDriverColor(driver.id))}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">
                        {driver.vehicle_type === 'motor' ? '🛵' : driver.vehicle_type === 'truck' ? '🚚' : '🚐'}
                    </span>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm leading-none">{driver.name}</h3>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold">{driver.vehicle_type} • ID: #{driver.id}</span>
                    </div>
                  </div>
                  <div className={`text-xs text-center py-1 px-2 rounded-full font-bold text-white ${driver.status === 'busy' ? 'bg-indigo-500' : 'bg-emerald-500'}`}>
                    Status: {driver.status.toUpperCase()}
                  </div>
                </div>
              </Popup>
            </Marker>
        ))}

        {shipments.map((pkg) => (
            <Marker 
              key={`shipment-${pkg.id}`}
              position={[Number(pkg.destination_lat), Number(pkg.destination_lng)]} 
              icon={createIcon('📦', pkg.status === 'assigned' ? getDriverColor(pkg.driver_id || 0) : '#64748b')}
            >
              <Popup>
                <div className="p-1 min-w-[160px]">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 text-sm">📦 {pkg.tracking_id}</h3>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                      {pkg.weight} kg
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-500 mb-2 leading-relaxed bg-slate-50 p-1.5 rounded border border-slate-100">
                    📍 {pkg.destination_address}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${pkg.status === 'assigned' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                      {pkg.status}
                    </span>
                    {pkg.route_order && (
                        <span className="text-[10px] font-bold text-indigo-600">Stop #{pkg.route_order}</span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
        ))}

        {Object.entries(driverRoutes).map(([driverId, positions]) => (
            <Polyline 
                key={`route-driver-${driverId}`}
                positions={positions}
                pathOptions={{ 
                    color: getDriverColor(Number(driverId)), 
                    weight: 4, 
                    opacity: 0.8,
                    dashArray: '10, 10',
                    lineCap: 'round'
                }}
            />
        ))}

      </MapContainer>
    </div>
  );
}