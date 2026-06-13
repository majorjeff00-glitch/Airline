# Multi-Airline Ticket Booking & Tracking System

A complete, self-contained web application for searching, booking, and tracking flight tickets from multiple airlines. Built with Next.js, PostgreSQL, and Prisma.

## Features

- **Multi-Airline Search**: Search flights across all airlines in one place
- **User Authentication**: JWT-based auth with Passenger, Agent, and Admin roles
- **Flight Management**: Admin CRUD for flights (any airline name as free text)
- **Booking Flow**: Search → Passenger Details → Seat Selection → Payment → Confirmation
- **PNR Generation**: Unique 6-character alphanumeric code per booking
- **Online Check-in**: 24h to 2h before departure with seat changes
- **Boarding Pass**: PDF generation with QR code
- **Flight Status**: Public page to check any flight by airline + flight number
- **Cancellation**: Policy-based refunds (100% >7 days, 50% 2-7 days, 0% <48h)
- **Admin Dashboard**: Revenue reports, booking trends, flight management
- **Email Notifications**: Ethereal (testing) - booking confirmation, reminders, boarding pass
- **Dark/Light Mode**: Theme support

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js with JWT
- **PDF**: jsPDF
- **Email**: Nodemailer + Ethereal

## Quick Start

### Option 1: Docker (Recommended)

```bash
docker-compose up --build
```

This starts PostgreSQL, runs migrations, seeds the database, and launches the app at `http://localhost:3000`.

### Option 2: Manual Setup

1. **Prerequisites**: Node.js 20+, PostgreSQL 16+

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Copy `.env.example` to `.env` and update the `DATABASE_URL` with your PostgreSQL connection string.

4. **Run database migrations**:
   ```bash
   npx prisma db push
   ```

5. **Seed the database**:
   ```bash
   npx tsx prisma/seed.ts
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. Open `http://localhost:3000`

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@airline.com | admin123 |
| Passenger | alice@example.com | pass123 |
| Passenger | bob@example.com | pass123 |
| Agent | agent@airline.com | pass123 |

## Test PNRs

- `ABC123` - Pending booking (Demo Airways)
- `DEF456` - Confirmed booking (FastJet)
- `GHI789` - Checked-in booking (SkyLink)
- `JKL012` - Confirmed booking (Demo Airways)

## Seed Data

The seed script creates:
- 4 users (admin, 2 passengers, 1 agent)
- 8 flights from 3 airlines (Demo Airways, FastJet, SkyLink)
- 4 bookings (pending, confirmed x2, checked-in)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth.js auth endpoints

### Flights
- `GET /api/flights` - Search flights (query params: origin, destination, date, passengers, travelClass, airlines)
- `GET /api/flights/:id` - Get flight details with occupied seats
- `POST /api/flights` - Create flight (Admin)
- `PUT /api/flights/:id` - Update flight (Admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id` - Update booking (cancel, check-in, board)
- `GET /api/bookings/pnr?pnr=XXX` - Lookup booking by PNR
- `POST /api/bookings/check-in` - Check in

### Payments
- `POST /api/payments` - Process simulated payment

### Admin
- `GET /api/admin/flights` - All flights with booking counts
- `DELETE /api/admin/flights/:id` - Cancel flight (notifies passengers)
- `GET /api/admin/bookings` - All bookings with filters
- `GET /api/admin/revenue` - Revenue reports

### Flight Status (Public)
- `GET /api/flight-status?airlineName=X&flightNumber=Y` - Check flight status

### User
- `GET /api/users/bookings` - User's bookings with filter

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Required |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `JWT_SECRET` | JWT signing secret | Required |
| `ETHEREAL_USER` | Ethereal email user (auto-create if empty) | Optional |
| `ETHEREAL_PASS` | Ethereal email pass | Optional |

## Deployment

### Railway

1. Create a new project in Railway
2. Add a PostgreSQL database
3. Deploy the app using the GitHub repo
4. Set environment variables in Railway dashboard
5. Run `npx prisma db push && npx tsx prisma/seed.ts` in the Railway shell

### Vercel

1. Connect your GitHub repo to Vercel
2. Set up a PostgreSQL database (Neon, Railway, etc.)
3. Add environment variables in Vercel dashboard
4. Deploy

## License

MIT
