import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');
    const passengers = parseInt(searchParams.get('passengers') || '1');
    const travelClass = searchParams.get('travelClass');
    const airlinesParam = searchParams.get('airlines');

    const where: Prisma.FlightWhereInput = {
      status: { not: 'CANCELLED' },
    };

    if (origin) where.origin = origin.toUpperCase();
    if (destination) where.destination = destination.toUpperCase();
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.departureTime = { gte: startDate, lte: endDate };
    }

    if (airlinesParam) {
      const airlines = airlinesParam.split(',').map((a) => a.trim());
      where.airlineName = { in: airlines };
    }

    if (travelClass) {
      const seatField = `${travelClass.toLowerCase()}Seats`;
      if (travelClass === 'ECONOMY') where.economySeats = { gte: passengers };
      else if (travelClass === 'BUSINESS') where.businessSeats = { gte: passengers };
      else if (travelClass === 'FIRST') where.firstSeats = { gte: passengers };
    }

    const flights = await prisma.flight.findMany({
      where,
      orderBy: { departureTime: 'asc' },
    });

    const flightsWithAvailability = flights.map((flight) => {
      const bookedEconomy = 0;
      const bookedBusiness = 0;
      const bookedFirst = 0;
      let availableSeats = 0;

      if (travelClass === 'ECONOMY' || !travelClass) {
        availableSeats = flight.economySeats - bookedEconomy;
      } else if (travelClass === 'BUSINESS') {
        availableSeats = flight.businessSeats - bookedBusiness;
      } else if (travelClass === 'FIRST') {
        availableSeats = flight.firstSeats - bookedFirst;
      }

      return {
        ...flight,
        availableSeats,
      };
    });

    return NextResponse.json(flightsWithAvailability);
  } catch (error) {
    console.error('Search flights error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const flight = await prisma.flight.create({
      data: {
        airlineName: body.airlineName,
        flightNumber: body.flightNumber,
        origin: body.origin.toUpperCase(),
        destination: body.destination.toUpperCase(),
        departureTime: new Date(body.departureTime),
        arrivalTime: new Date(body.arrivalTime),
        durationMinutes: body.durationMinutes,
        economySeats: body.economySeats,
        businessSeats: body.businessSeats,
        firstSeats: body.firstSeats,
        economyPrice: body.economyPrice,
        businessPrice: body.businessPrice,
        firstPrice: body.firstPrice,
      },
    });
    return NextResponse.json(flight, { status: 201 });
  } catch (error) {
    console.error('Create flight error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
