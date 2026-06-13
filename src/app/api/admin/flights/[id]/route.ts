import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendFlightCancellation } from '@/lib/email';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const flight = await prisma.flight.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
      include: {
        bookings: {
          where: { status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
          include: { user: true },
        },
      },
    });

    let notifiedCount = 0;
    for (const booking of flight.bookings) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          cancellationRefund: booking.totalPrice,
        },
      });

      if (booking.user?.email) {
        await sendFlightCancellation(
          booking.user.email,
          booking.user.id,
          booking.id,
          booking.pnr,
          flight.airlineName,
          flight.flightNumber
        );
        notifiedCount++;
      }
    }

    return NextResponse.json({
      message: 'Flight cancelled successfully',
      affectedBookings: flight.bookings.length,
      notifiedPassengers: notifiedCount,
    });
  } catch (error) {
    console.error('Admin cancel flight error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
