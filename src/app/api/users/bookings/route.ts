import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';

    const now = new Date();
    let where: any = { userId };

    if (filter === 'upcoming') {
      where.flight = { departureTime: { gte: now } };
      where.status = { notIn: ['CANCELLED', 'NO_SHOW'] };
    } else if (filter === 'past') {
      where.flight = { departureTime: { lt: now } };
    } else if (filter === 'cancelled') {
      where.status = 'CANCELLED';
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        flight: true,
        passengers: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Get user bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
