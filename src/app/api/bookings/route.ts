import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateUniquePNR } from '@/lib/pnr';
import { sendBookingConfirmation } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = { userId };
    if (status) where.status = status;

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
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { flightId, travelClass, passengers: passengerData, selectedSeats } = body;

    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
    });

    if (!flight || flight.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Flight not available' }, { status: 400 });
    }

    const passengerCount = passengerData.length;
    let totalPrice = 0;
    let seatField: string;

    if (travelClass === 'ECONOMY') {
      totalPrice = flight.economyPrice * passengerCount;
      seatField = 'economySeats';
    } else if (travelClass === 'BUSINESS') {
      totalPrice = flight.businessPrice * passengerCount;
      seatField = 'businessSeats';
    } else {
      totalPrice = flight.firstPrice * passengerCount;
      seatField = 'firstSeats';
    }

    const pnr = await generateUniquePNR();

    const booking = await prisma.booking.create({
      data: {
        pnr,
        userId: session ? (session.user as any).id : null,
        flightId,
        status: 'PENDING',
        totalPrice,
        passengers: {
          create: passengerData.map((p: any, index: number) => ({
            fullName: p.fullName,
            dateOfBirth: new Date(p.dateOfBirth),
            passportNumber: p.passportNumber || null,
            seatNumber: selectedSeats?.[index] || null,
            travelClass,
          })),
        },
      },
      include: {
        flight: true,
        passengers: true,
      },
    });

    return NextResponse.json(
      {
        id: booking.id,
        pnr: booking.pnr,
        totalPrice: booking.totalPrice,
        status: booking.status,
        flight: booking.flight,
        passengers: booking.passengers,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
