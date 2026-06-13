import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        flight: true,
        passengers: true,
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { action } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { flight: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (action === 'cancel') {
      const hoursUntilDeparture =
        (new Date(booking.flight.departureTime).getTime() - Date.now()) /
        (1000 * 60 * 60);
      const daysUntilDeparture = hoursUntilDeparture / 24;

      let refundPercentage = 0;
      if (daysUntilDeparture > 7) refundPercentage = 100;
      else if (daysUntilDeparture >= 2) refundPercentage = 50;

      const refundAmount = (booking.totalPrice * refundPercentage) / 100;

      const updated = await prisma.booking.update({
        where: { id: params.id },
        data: {
          status: 'CANCELLED',
          cancellationRefund: refundAmount,
        },
        include: { flight: true, passengers: true },
      });

      return NextResponse.json(updated);
    }

    if (action === 'check-in') {
      const hoursUntilDeparture =
        (new Date(booking.flight.departureTime).getTime() - Date.now()) /
        (1000 * 60 * 60);

      if (hoursUntilDeparture > 24 || hoursUntilDeparture < 2) {
        return NextResponse.json(
          { error: 'Check-in is only available 24h to 2h before departure' },
          { status: 400 }
        );
      }

      if (body.seatChanges) {
        for (const change of body.seatChanges) {
          await prisma.passengerDetail.update({
            where: { id: change.passengerId },
            data: { seatNumber: change.newSeat },
          });
        }
      }

      const updated = await prisma.booking.update({
        where: { id: params.id },
        data: { status: 'CHECKED_IN' },
        include: { flight: true, passengers: true },
      });

      return NextResponse.json(updated);
    }

    if (action === 'board') {
      const updated = await prisma.booking.update({
        where: { id: params.id },
        data: { status: 'BOARDED' },
        include: { flight: true, passengers: true },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
