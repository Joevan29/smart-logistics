import { NextResponse } from 'next/server';
import { query } from '@/src/lib/db';
import { pusherServer } from '@/src/lib/pusher';

export async function POST() {
  try {
    await query("UPDATE drivers SET status = 'idle'");
    await query("UPDATE shipments SET status = 'pending', driver_id = NULL");

    await pusherServer.trigger('map-channel', 'update-data', {
      message: 'System reset',
    });

    return NextResponse.json({ message: "System Reset Successfully" });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset' }, { status: 500 });
  }
}