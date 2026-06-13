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

    const bookings = await prisma.booking.findMany({
      where: { status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
      include: { flight: true, payment: true },
    });

    const revenueByAirline: Record<string, number> = {};
    const revenueByFlight: Record<string, number> = {};
    const revenueByClass: Record<string, number> = {};
    const bookingsPerDay: Record<string, number> = {};

    for (const booking of bookings) {
      const airline = booking.flight.airlineName;
      const flightKey = `${airline} ${booking.flight.flightNumber}`;
      const dateKey = booking.createdAt.toISOString().split('T')[0];

      revenueByAirline[airline] = (revenueByAirline[airline] || 0) + booking.totalPrice;
      revenueByFlight[flightKey] = (revenueByFlight[flightKey] || 0) + booking.totalPrice;
      bookingsPerDay[dateKey] = (bookingsPerDay[dateKey] || 0) + 1;

      for (const passenger of await prisma.passengerDetail.findMany({
        where: { bookingId: booking.id },
      })) {
        revenueByClass[passenger.travelClass] =
          (revenueByClass[passenger.travelClass] || 0) +
          booking.totalPrice / (await prisma.passengerDetail.count({ where: { bookingId: booking.id } }));
      }
    }

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalBookings = bookings.length;

    return NextResponse.json({
      totalRevenue,
      totalBookings,
      revenueByAirline,
      revenueByFlight,
      revenueByClass,
      bookingsPerDay: Object.entries(bookingsPerDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
    });
  } catch (error) {
    console.error('Revenue report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
