import { NextResponse } from 'next/server';
import { query } from '@/src/lib/db';

export async function GET() {
  try {
    const activeDriversRes = await query("SELECT COUNT(*) FROM drivers WHERE status = 'busy'");
    const activeDrivers = Number(activeDriversRes.rows[0].count);

    const pendingOrdersRes = await query("SELECT COUNT(*) FROM shipments WHERE status = 'pending'");
    const pendingOrders = Number(pendingOrdersRes.rows[0].count);

    const revenueRes = await query("SELECT SUM(price) FROM shipments WHERE status != 'pending'");
    const revenue = Number(revenueRes.rows[0].sum || 0);

    return NextResponse.json({
      activeDrivers,
      pendingOrders,
      revenue
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}