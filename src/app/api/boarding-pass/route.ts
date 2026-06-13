import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { generateBoardingPassPDF } = await import('@/lib/pdf');

    const pdfBuffer = await generateBoardingPassPDF({
      pnr: body.pnr,
      passengerName: body.passengerName,
      airlineName: body.airlineName,
      flightNumber: body.flightNumber,
      origin: body.origin,
      destination: body.destination,
      departureTime: new Date(body.departureTime),
      arrivalTime: new Date(body.arrivalTime),
      seatNumber: body.seatNumber,
      gate: body.gate,
      boardingTime: body.boardingTime,
      travelClass: body.travelClass,
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="boarding-pass-${body.pnr}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Generate boarding pass error:', error);
    return NextResponse.json(
      { error: 'Failed to generate boarding pass' },
      { status: 500 }
    );
  }
}
