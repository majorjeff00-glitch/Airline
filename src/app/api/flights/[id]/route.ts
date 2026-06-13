import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: params.id },
      include: {
        bookings: {
          where: { status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
          include: { passengers: true },
        },
      },
    });

    if (!flight) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    }

    const occupiedSeats = flight.bookings
      .flatMap((b) => b.passengers.map((p) => p.seatNumber))
      .filter(Boolean) as string[];

    return NextResponse.json({ ...flight, occupiedSeats });
  } catch (error) {
    console.error('Get flight error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const flight = await prisma.flight.update({
      where: { id: params.id },
      data: {
        airlineName: body.airlineName,
        flightNumber: body.flightNumber,
        origin: body.origin?.toUpperCase(),
        destination: body.destination?.toUpperCase(),
        departureTime: body.departureTime ? new Date(body.departureTime) : undefined,
        arrivalTime: body.arrivalTime ? new Date(body.arrivalTime) : undefined,
        durationMinutes: body.durationMinutes,
        economySeats: body.economySeats,
        businessSeats: body.businessSeats,
        firstSeats: body.firstSeats,
        economyPrice: body.economyPrice,
        businessPrice: body.businessPrice,
        firstPrice: body.firstPrice,
        status: body.status,
      },
    });
    return NextResponse.json(flight);
  } catch (error) {
    console.error('Update flight error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
          where: {
            status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          },
          include: { user: true },
        },
      },
    });

    for (const booking of flight.bookings) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          cancellationRefund: booking.totalPrice,
        },
      });

      if (booking.user?.email) {
        const { sendFlightCancellation } = await import('@/lib/email');
        await sendFlightCancellation(
          booking.user.email,
          booking.user.id,
          booking.id,
          booking.pnr,
          flight.airlineName,
          flight.flightNumber
        );
      }
    }

    return NextResponse.json({ message: 'Flight cancelled', notifiedPassengers: flight.bookings.length });
  } catch (error) {
    console.error('Cancel flight error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
