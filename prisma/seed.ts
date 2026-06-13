import { PrismaClient, UserRole, FlightStatus, BookingStatus, TravelClass } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.notificationLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.passengerDetail.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const passengerPassword = await bcrypt.hash('pass123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@airline.com',
      passwordHash: adminPassword,
      name: 'System Admin',
      role: UserRole.ADMIN,
    },
  });

  const passenger1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      passwordHash: passengerPassword,
      name: 'Alice Johnson',
      role: UserRole.PASSENGER,
    },
  });

  const passenger2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      passwordHash: passengerPassword,
      name: 'Bob Smith',
      role: UserRole.PASSENGER,
    },
  });

  const agent = await prisma.user.create({
    data: {
      email: 'agent@airline.com',
      passwordHash: passengerPassword,
      name: 'Charlie Agent',
      role: UserRole.AGENT,
    },
  });

  console.log('Users created');

  // Create flights from 3 different airlines
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const nextWeek = new Date(tomorrow);
  nextWeek.setDate(nextWeek.getDate() + 7);

  function addHours(date: Date, hours: number): Date {
    const d = new Date(date);
    d.setHours(d.getHours() + hours);
    return d;
  }

  // Demo Airways flights
  const flight1 = await prisma.flight.create({
    data: {
      airlineName: 'Demo Airways',
      flightNumber: 'DA101',
      origin: 'JFK',
      destination: 'LAX',
      departureTime: new Date(tomorrow),
      arrivalTime: addHours(tomorrow, 6),
      durationMinutes: 360,
      economySeats: 150,
      businessSeats: 20,
      firstSeats: 10,
      economyPrice: 199.99,
      businessPrice: 599.99,
      firstPrice: 1299.99,
      status: FlightStatus.SCHEDULED,
    },
  });

  const flight2 = await prisma.flight.create({
    data: {
      airlineName: 'Demo Airways',
      flightNumber: 'DA202',
      origin: 'LAX',
      destination: 'ORD',
      departureTime: addHours(tomorrow, 8),
      arrivalTime: addHours(tomorrow, 12),
      durationMinutes: 240,
      economySeats: 120,
      businessSeats: 16,
      firstSeats: 8,
      economyPrice: 149.99,
      businessPrice: 449.99,
      firstPrice: 999.99,
      status: FlightStatus.SCHEDULED,
    },
  });

  const flight3 = await prisma.flight.create({
    data: {
      airlineName: 'Demo Airways',
      flightNumber: 'DA303',
      origin: 'ORD',
      destination: 'MIA',
      departureTime: new Date(dayAfter),
      arrivalTime: addHours(dayAfter, 3),
      durationMinutes: 180,
      economySeats: 130,
      businessSeats: 18,
      firstSeats: 6,
      economyPrice: 129.99,
      businessPrice: 399.99,
      firstPrice: 899.99,
      status: FlightStatus.SCHEDULED,
    },
  });

  // FastJet flights
  const flight4 = await prisma.flight.create({
    data: {
      airlineName: 'FastJet',
      flightNumber: 'FJ101',
      origin: 'JFK',
      destination: 'LHR',
      departureTime: new Date(tomorrow),
      arrivalTime: addHours(tomorrow, 7),
      durationMinutes: 420,
      economySeats: 200,
      businessSeats: 30,
      firstSeats: 12,
      economyPrice: 349.99,
      businessPrice: 899.99,
      firstPrice: 2199.99,
      status: FlightStatus.SCHEDULED,
    },
  });

  const flight5 = await prisma.flight.create({
    data: {
      airlineName: 'FastJet',
      flightNumber: 'FJ202',
      origin: 'LHR',
      destination: 'CDG',
      departureTime: new Date(dayAfter),
      arrivalTime: addHours(dayAfter, 1.5),
      durationMinutes: 90,
      economySeats: 180,
      businessSeats: 24,
      firstSeats: 0,
      economyPrice: 89.99,
      businessPrice: 249.99,
      firstPrice: 0,
      status: FlightStatus.SCHEDULED,
    },
  });

  // SkyLink flights
  const flight6 = await prisma.flight.create({
    data: {
      airlineName: 'SkyLink',
      flightNumber: 'SL101',
      origin: 'SFO',
      destination: 'NRT',
      departureTime: new Date(tomorrow),
      arrivalTime: addHours(tomorrow, 11),
      durationMinutes: 660,
      economySeats: 250,
      businessSeats: 35,
      firstSeats: 14,
      economyPrice: 499.99,
      businessPrice: 1299.99,
      firstPrice: 3499.99,
      status: FlightStatus.SCHEDULED,
    },
  });

  const flight7 = await prisma.flight.create({
    data: {
      airlineName: 'SkyLink',
      flightNumber: 'SL202',
      origin: 'NRT',
      destination: 'SIN',
      departureTime: new Date(dayAfter),
      arrivalTime: addHours(dayAfter, 7),
      durationMinutes: 420,
      economySeats: 200,
      businessSeats: 28,
      firstSeats: 10,
      economyPrice: 299.99,
      businessPrice: 799.99,
      firstPrice: 1999.99,
      status: FlightStatus.DELAYED,
    },
  });

  const flight8 = await prisma.flight.create({
    data: {
      airlineName: 'Demo Airways',
      flightNumber: 'DA404',
      origin: 'JFK',
      destination: 'SFO',
      departureTime: new Date(nextWeek),
      arrivalTime: addHours(nextWeek, 6.5),
      durationMinutes: 390,
      economySeats: 140,
      businessSeats: 18,
      firstSeats: 8,
      economyPrice: 179.99,
      businessPrice: 549.99,
      firstPrice: 1199.99,
      status: FlightStatus.SCHEDULED,
    },
  });

  console.log('Flights created');

  // Create bookings with different statuses

  // 1. Pending booking (Alice - Demo Airways)
  const booking1 = await prisma.booking.create({
    data: {
      pnr: 'ABC123',
      userId: passenger1.id,
      flightId: flight1.id,
      status: BookingStatus.PENDING,
      totalPrice: 199.99,
      passengers: {
        create: [
          {
            fullName: 'Alice Johnson',
            dateOfBirth: new Date('1990-05-15'),
            passportNumber: 'AB123456',
            seatNumber: '12A',
            travelClass: TravelClass.ECONOMY,
          },
        ],
      },
    },
    include: { passengers: true },
  });

  // 2. Confirmed booking (Alice - FastJet)
  const booking2 = await prisma.booking.create({
    data: {
      pnr: 'DEF456',
      userId: passenger1.id,
      flightId: flight4.id,
      status: BookingStatus.CONFIRMED,
      totalPrice: 1799.98,
      payment: {
        create: {
          amount: 1799.98,
          status: 'COMPLETED',
          transactionId: 'TXN1001',
        },
      },
      passengers: {
        create: [
          {
            fullName: 'Alice Johnson',
            dateOfBirth: new Date('1990-05-15'),
            passportNumber: 'AB123456',
            seatNumber: '3A',
            travelClass: TravelClass.BUSINESS,
          },
          {
            fullName: 'David Johnson',
            dateOfBirth: new Date('1988-11-20'),
            passportNumber: 'CD789012',
            seatNumber: '3B',
            travelClass: TravelClass.BUSINESS,
          },
        ],
      },
    },
    include: { passengers: true },
  });

  // 3. Checked-in booking (Bob - SkyLink)
  const booking3 = await prisma.booking.create({
    data: {
      pnr: 'GHI789',
      userId: passenger2.id,
      flightId: flight6.id,
      status: BookingStatus.CHECKED_IN,
      totalPrice: 499.99,
      payment: {
        create: {
          amount: 499.99,
          status: 'COMPLETED',
          transactionId: 'TXN1002',
        },
      },
      passengers: {
        create: [
          {
            fullName: 'Bob Smith',
            dateOfBirth: new Date('1985-03-10'),
            passportNumber: 'EF345678',
            seatNumber: '15C',
            travelClass: TravelClass.ECONOMY,
          },
        ],
      },
    },
    include: { passengers: true },
  });

  // 4. Confirmed booking (Agent for a passenger - Demo Airways)
  const booking4 = await prisma.booking.create({
    data: {
      pnr: 'JKL012',
      userId: agent.id,
      flightId: flight8.id,
      status: BookingStatus.CONFIRMED,
      totalPrice: 549.99,
      payment: {
        create: {
          amount: 549.99,
          status: 'COMPLETED',
          transactionId: 'TXN1003',
        },
      },
      passengers: {
        create: [
          {
            fullName: 'Eve Williams',
            dateOfBirth: new Date('1995-07-22'),
            passportNumber: 'GH901234',
            seatNumber: '5B',
            travelClass: TravelClass.BUSINESS,
          },
        ],
      },
    },
    include: { passengers: true },
  });

  console.log('Bookings created');
  console.log('Seed completed!');
  console.log('');
  console.log('Test Accounts:');
  console.log('  Admin: admin@airline.com / admin123');
  console.log('  Passenger: alice@example.com / pass123');
  console.log('  Passenger: bob@example.com / pass123');
  console.log('  Agent: agent@airline.com / pass123');
  console.log('');
  console.log('Test PNRs: ABC123, DEF456, GHI789, JKL012');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
