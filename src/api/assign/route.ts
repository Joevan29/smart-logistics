import { NextResponse } from 'next/server';
import { query } from '@/src/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST() {
  try {
    const driversRes = await query("SELECT id, name, current_lat, current_lng FROM drivers WHERE status = 'idle'");
    const shipmentsRes = await query("SELECT id, destination_lat, destination_lng FROM shipments WHERE status = 'pending'");

    const drivers = driversRes.rows;
    const shipments = shipmentsRes.rows;

    if (drivers.length === 0 || shipments.length === 0) {
      return NextResponse.json({ message: "Tidak ada driver atau paket yang tersedia" }, { status: 400 });
    }

    const prompt = `
      Anda adalah sistem optimasi logistik. Tugas anda memasangkan Driver ke Shipment berdasarkan jarak terdekat (Euclidean Distance).
      
      DATA DRIVER:
      ${JSON.stringify(drivers)}

      DATA SHIPMENT:
      ${JSON.stringify(shipments)}

      ATURAN:
      1. Satu driver hanya boleh membawa 1 paket (untuk saat ini).
      2. Prioritaskan jarak terpendek.
      
      OUTPUT:
      Berikan HANYA JSON array berisi pasangan ID. Jangan ada teks lain atau markdown.
      Format: [{"driver_id": 1, "shipment_id": 10}, ...]
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const assignments = JSON.parse(text);

    for (const item of assignments) {
        await query(
            "UPDATE shipments SET driver_id = $1, status = 'assigned' WHERE id = $2",
            [item.driver_id, item.shipment_id]
        );

        await query(
            "UPDATE drivers SET status = 'busy' WHERE id = $1",
            [item.driver_id]
        );
    }

    return NextResponse.json({ success: true, assignments });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: 'AI gagal memproses' }, { status: 500 });
  }
}