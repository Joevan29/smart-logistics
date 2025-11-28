import { NextResponse } from 'next/server';
import { query } from '@/src/lib/db';
import { GoogleGenAI } from "@google/genai"; 
import { pusherServer } from '@/src/lib/pusher'; 

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST() {
  try {
    const driversRes = await query("SELECT id, name, vehicle_type, current_lat, current_lng FROM drivers WHERE status = 'idle'");
    const shipmentsRes = await query("SELECT id, weight, destination_lat, destination_lng FROM shipments WHERE status = 'pending'");

    const drivers = driversRes.rows;
    const shipments = shipmentsRes.rows;

    if (drivers.length === 0 || shipments.length === 0) {
      return NextResponse.json({ message: "Data tidak cukup." }, { status: 400 });
    }

    const promptData = `
      Anda adalah AI Logistics Planner yang ahli dalam Vehicle Routing Problem (VRP).
      
      DATA DRIVER:
      ${JSON.stringify(drivers)}

      DATA SHIPMENT:
      ${JSON.stringify(shipments)}

      TUGAS:
      Buatlah rute pengiriman yang efisien.
      
      ATURAN PENTING:
      1. KAPACITAS: 
         - Motor: Max total berat 20kg.
         - Van: Max total berat 100kg.
         - Truck: Max total berat 500kg.
      2. MULTI-STOP: Satu driver BOLEH mengambil LEBIH DARI 1 paket (maksimal 3 paket per driver) JIKA lokasinya searah atau berdekatan.
      3. URUTAN: Tentukan urutan pengiriman (route_order) yang paling efisien secara jarak.
      
      OUTPUT FORMAT (JSON RAW ARRAY):
      [
        {"driver_id": 1, "shipment_id": 10, "route_order": 1},
        {"driver_id": 1, "shipment_id": 12, "route_order": 2}, 
        {"driver_id": 2, "shipment_id": 15, "route_order": 1}
      ]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", 
      contents: promptData,
      config: { responseMimeType: "application/json" }
    });

    const textOutput = response.text; 
    const assignments = JSON.parse(textOutput || "[]");

    if (assignments.length > 0) {
        for (const item of assignments) {
            if (item.driver_id && item.shipment_id) {
                await query(
                    "UPDATE shipments SET driver_id = $1, status = 'assigned', route_order = $2 WHERE id = $3",
                    [item.driver_id, item.route_order, item.shipment_id]
                );

                await query(
                    "UPDATE drivers SET status = 'busy' WHERE id = $1",
                    [item.driver_id]
                );
            }
        }

        await pusherServer.trigger('map-channel', 'update-data', {
          message: `Rute Optimasi Selesai! Beberapa driver mungkin membawa banyak paket.`,
          assignments
        });
    }

    return NextResponse.json({ success: true, count: assignments.length, assignments });

  } catch (error: any) {
    console.error("System Error:", error);
    return NextResponse.json({ error: error?.message || 'Error server' }, { status: 500 });
  }
}