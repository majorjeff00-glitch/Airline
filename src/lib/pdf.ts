import { jsPDF } from 'jspdf';

export async function generateBoardingPassPDF(data: {
  pnr: string;
  passengerName: string;
  airlineName: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  seatNumber: string;
  gate: string;
  boardingTime: string;
  travelClass: string;
}): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [200, 80],
  });

  const pageWidth = 200;
  const pageHeight = 80;

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 8, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BOARDING PASS', 10, 18);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`PNR: ${data.pnr}`, 10, 25);
  doc.text(`Gate: ${data.gate}`, pageWidth - 50, 25);
  doc.text(`Boarding: ${data.boardingTime}`, pageWidth - 50, 31);

  doc.setDrawColor(200, 200, 200);
  doc.line(10, 28, pageWidth - 10, 28);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.airlineName, 10, 40);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Flight: ${data.flightNumber}`, 10, 48);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(data.origin, 60, 40);
  doc.text('→', 78, 40);
  doc.text(data.destination, 90, 40);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Depart: ${data.departureTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
    60,
    48
  );
  doc.text(
    `Arrive: ${data.arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
    60,
    54
  );

  doc.setFontSize(10);
  doc.text(`Passenger: ${data.passengerName}`, 10, 60);
  doc.text(`Seat: ${data.seatNumber}`, 10, 67);
  doc.text(`Class: ${data.travelClass}`, 10, 74);

  doc.setFontSize(6);
  doc.text('This is a simulated boarding pass for demonstration purposes.', pageWidth - 100, 74);

  return Buffer.from(doc.output('arraybuffer'));
}
