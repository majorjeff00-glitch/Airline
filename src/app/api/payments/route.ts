import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmation } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, cardNumber, cardHolder, expiryDate, cvv } = body;

    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      return NextResponse.json(
        { error: 'All payment fields are required' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        flight: true,
        passengers: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Booking is not in pending status' },
        { status: 400 }
      );
    }

    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: booking.totalPrice,
        status: 'COMPLETED',
        transactionId,
      },
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
      include: { flight: true, passengers: true },
    });

    if (booking.user?.email) {
      await sendBookingConfirmation(
        booking.user.email,
        booking.user.id,
        booking.id,
        booking.pnr,
        booking.flight.airlineName,
        booking.flight.flightNumber,
        booking.flight.origin,
        booking.flight.destination,
        booking.flight.departureTime,
        booking.totalPrice
      );
    }

    return NextResponse.json({
      success: true,
      payment,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
