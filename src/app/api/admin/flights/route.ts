import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const airline = searchParams.get('airline');
    const status = searchParams.get('status');

    const where: any = {};
    if (airline) where.airlineName = airline;
    if (status) where.status = status;

    const flights = await prisma.flight.findMany({
      where,
      orderBy: { departureTime: 'desc' },
      include: {
        _count: { select: { bookings: true } },
      },
    });

    return NextResponse.json(flights);
  } catch (error) {
    console.error('Admin get flights error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
