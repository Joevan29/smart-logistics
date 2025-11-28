import { NextResponse } from 'next/server';
import { query } from '@/src/lib/db';
import { pusherServer } from '@/src/lib/pusher';

export async function POST(req: Request) {
  try {
    const { driver_id, shipment_id, status } = await req.json();

    if (status === 'in_transit') {
        await query("UPDATE drivers SET status = 'busy' WHERE id = $1", [driver_id]);
        await query("UPDATE shipments SET status = 'in_transit' WHERE id = $1", [shipment_id]);
    } 
    else if (status === 'delivered') {
        await query("UPDATE drivers SET status = 'idle' WHERE id = $1", [driver_id]);
        await query("UPDATE shipments SET status = 'delivered' WHERE id = $1", [shipment_id]);
    }

    await pusherServer.trigger('map-channel', 'update-data', {
      message: `Driver #${driver_id} update status: ${status}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update status' }, { status: 500 });
  }
}