import { UserRole, BookingStatus, TravelClass, FlightStatus } from '@prisma/client';

export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
  travelClass: TravelClass;
  airlines?: string[];
}

export interface BookingFlowState {
  flightId: string;
  travelClass: TravelClass;
  passengers: number;
  passengerDetails: PassengerFormData[];
  selectedSeats: string[];
  totalPrice: number;
  bookingId?: string;
  pnr?: string;
}

export interface PassengerFormData {
  fullName: string;
  dateOfBirth: string;
  passportNumber?: string;
}

export interface SeatMap {
  rows: SeatRow[];
}

export interface SeatRow {
  rowNumber: number;
  seats: Seat[];
}

export interface Seat {
  id: string;
  number: string;
  isOccupied: boolean;
  travelClass: TravelClass;
}

export interface FlightWithBooking {
  id: string;
  airlineName: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  durationMinutes: number;
  economyPrice: number;
  businessPrice: number;
  firstPrice: number;
  economySeats: number;
  businessSeats: number;
  firstSeats: number;
  status: FlightStatus;
  availableSeats: number;
}

export type { UserRole, BookingStatus, TravelClass, FlightStatus };
