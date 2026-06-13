import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const airlineName = searchParams.get('airlineName');
    const flightNumber = searchParams.get('flightNumber');
    const date = searchParams.get('date');

    if (!airlineName || !flightNumber) {
      return NextResponse.json(
        { error: 'Airline name and flight number are required' },
        { status: 400 }
      );
    }

    const where: any = {
      airlineName,
      flightNumber,
    };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.departureTime = { gte: startDate, lte: endDate };
    }

    const flights = await prisma.flight.findMany({
      where,
      orderBy: { departureTime: 'asc' },
    });

    if (flights.length === 0) {
      return NextResponse.json(
        { error: 'No flights found matching the criteria' },
        { status: 404 }
      );
    }

    const statuses = flights.map((f) => ({
      airlineName: f.airlineName,
      flightNumber: f.flightNumber,
      origin: f.origin,
      destination: f.destination,
      departureTime: f.departureTime,
      arrivalTime: f.arrivalTime,
      status: f.status,
    }));

    return NextResponse.json(statuses);
  } catch (error) {
    console.error('Flight status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
