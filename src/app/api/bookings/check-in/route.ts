import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pnr, seatChanges } = body;

    const booking = await prisma.booking.findUnique({
      where: { pnr: pnr.toUpperCase() },
      include: { flight: true, passengers: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const hoursUntilDeparture =
      (new Date(booking.flight.departureTime).getTime() - Date.now()) /
      (1000 * 60 * 60);

    if (hoursUntilDeparture > 24 || hoursUntilDeparture < 2) {
      return NextResponse.json(
        { error: 'Check-in is only available 24h to 2h before departure' },
        { status: 400 }
      );
    }

    if (seatChanges && seatChanges.length > 0) {
      for (const change of seatChanges) {
        await prisma.passengerDetail.update({
          where: { id: change.passengerId },
          data: { seatNumber: change.newSeat },
        });
      }
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CHECKED_IN' },
      include: { flight: true, passengers: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
