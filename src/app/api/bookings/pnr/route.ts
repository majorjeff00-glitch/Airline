import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pnr = searchParams.get('pnr');
    const lastName = searchParams.get('lastName');

    if (!pnr) {
      return NextResponse.json(
        { error: 'PNR is required' },
        { status: 400 }
      );
    }

    const where: any = { pnr: pnr.toUpperCase() };

    const booking = await prisma.booking.findFirst({
      where,
      include: {
        flight: true,
        passengers: true,
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (lastName) {
      const hasMatchingPassenger = booking.passengers.some((p) =>
        p.fullName.toLowerCase().includes(lastName.toLowerCase())
      );
      if (!hasMatchingPassenger) {
        return NextResponse.json(
          { error: 'Booking not found with that last name' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('PNR lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
