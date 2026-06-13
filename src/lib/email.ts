import nodemailer from 'nodemailer';
import { prisma } from './prisma';

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS) {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Ethereal Email Account:', testAccount.user);
  }
  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const t = await getTransporter();
    const info = await t.sendMail({
      from: '"Airline Booking System" <noreply@airline-booking.demo>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log('Email sent:', info.messageId);
    if (info.messageId) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    return null;
  }
}

export async function logNotification(
  userId: string | null,
  bookingId: string | null,
  type: string
) {
  try {
    await prisma.notificationLog.create({
      data: { userId, bookingId, type },
    });
  } catch (error) {
    console.error('Failed to log notification:', error);
  }
}

export async function sendBookingConfirmation(
  email: string,
  userId: string | null,
  bookingId: string,
  pnr: string,
  airlineName: string,
  flightNumber: string,
  origin: string,
  destination: string,
  departureTime: Date,
  totalPrice: number
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Booking Confirmed!</h1>
      <p>Your booking has been confirmed. Here are your details:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0;">
        <p><strong>PNR:</strong> ${pnr}</p>
        <p><strong>Airline:</strong> ${airlineName}</p>
        <p><strong>Flight:</strong> ${flightNumber}</p>
        <p><strong>Route:</strong> ${origin} → ${destination}</p>
        <p><strong>Departure:</strong> ${departureTime.toLocaleString()}</p>
        <p><strong>Total Paid:</strong> $${totalPrice.toFixed(2)}</p>
      </div>
      <p>You can view your booking and download your boarding pass at:
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings/pnr/${pnr}">
          ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/bookings/pnr/${pnr}
        </a>
      </p>
      <p>Check-in is available 24 hours before departure.</p>
      <p>Thank you for choosing ${airlineName}!</p>
    </div>
  `;

  await sendEmail({ to: email, subject: `Booking Confirmed - ${airlineName} ${flightNumber}`, html });
  await logNotification(userId, bookingId, 'BOOKING_CONFIRMATION');
}

export async function sendFlightCancellation(
  email: string,
  userId: string | null,
  bookingId: string,
  pnr: string,
  airlineName: string,
  flightNumber: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626;">Flight Cancelled</h1>
      <p>We regret to inform you that flight <strong>${airlineName} ${flightNumber}</strong> has been cancelled.</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0;">
        <p><strong>PNR:</strong> ${pnr}</p>
        <p>A full refund has been issued to your original payment method.</p>
      </div>
      <p>We apologize for the inconvenience.</p>
    </div>
  `;

  await sendEmail({ to: email, subject: `Flight Cancelled - ${airlineName} ${flightNumber}`, html });
  await logNotification(userId, bookingId, 'FLIGHT_CANCELLED');
}

export async function sendCheckInReminder(
  email: string,
  userId: string | null,
  bookingId: string,
  pnr: string,
  airlineName: string,
  flightNumber: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Check-in Reminder</h1>
      <p>Your flight <strong>${airlineName} ${flightNumber}</strong> is departing soon!</p>
      <p>Check-in is now available. You can check in online and download your boarding pass.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/check-in/${pnr}"
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Check In Now
        </a>
      </p>
    </div>
  `;

  await sendEmail({ to: email, subject: `Check-in Reminder - ${airlineName} ${flightNumber}`, html });
  await logNotification(userId, bookingId, 'CHECKIN_REMINDER');
}

export async function sendBoardingPassLink(
  email: string,
  userId: string | null,
  bookingId: string,
  pnr: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Your Boarding Pass</h1>
      <p>Your boarding pass is ready for download.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/boarding-pass/${pnr}"
           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Download Boarding Pass
        </a>
      </p>
    </div>
  `;

  await sendEmail({ to: email, subject: 'Your Boarding Pass is Ready', html });
  await logNotification(userId, bookingId, 'BOARDING_PASS');
}
