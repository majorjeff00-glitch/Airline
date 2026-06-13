'use client';

import { useState } from 'react';
import { ArmchairIcon } from 'lucide-react';

interface Seat {
  id: string;
  number: string;
  isOccupied: boolean;
  travelClass: string;
}

interface SeatMapProps {
  occupiedSeats: string[];
  travelClass: string;
  passengers: number;
  onSeatsChange: (seats: string[]) => void;
}

export function SeatMap({ occupiedSeats, travelClass, passengers, onSeatsChange }: SeatMapProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    let maxRows = 0;
    let letters: string[] = [];

    if (travelClass === 'FIRST') {
      maxRows = 4;
      letters = ['A', 'C', 'D', 'F'];
    } else if (travelClass === 'BUSINESS') {
      maxRows = 8;
      letters = ['A', 'C', 'D', 'F'];
    } else {
      maxRows = 20;
      letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    }

    for (let row = 1; row <= maxRows; row++) {
      for (const letter of letters) {
        const seatNumber = `${row}${letter}`;
        seats.push({
          id: seatNumber,
          number: seatNumber,
          isOccupied: occupiedSeats.includes(seatNumber),
          travelClass,
        });
      }
    }
    return seats;
  };

  const seats = generateSeats();

  const handleSeatClick = (seatNumber: string) => {
    if (occupiedSeats.includes(seatNumber)) return;

    setSelectedSeats((prev) => {
      const isSelected = prev.includes(seatNumber);
      let updated: string[];
      if (isSelected) {
        updated = prev.filter((s) => s !== seatNumber);
      } else {
        if (prev.length >= passengers) {
          updated = [...prev.slice(1), seatNumber];
        } else {
          updated = [...prev, seatNumber];
        }
      }
      onSeatsChange(updated);
      return updated;
    });
  };

  const groupedByRow = seats.reduce((acc, seat) => {
    const row = seat.number.match(/^\d+/)?.[0] || '0';
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  const sortedRows = Object.keys(groupedByRow).sort((a, b) => parseInt(a) - parseInt(b));

  const getSeatLabel = (seatNumber: string): string => {
    const match = seatNumber.match(/^(\d+)([A-Z])$/);
    if (!match) return '';
    const letter = match[2];
    const labels: Record<string, string> = { A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F' };
    return labels[letter] || '';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded border-2 border-border bg-background" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded border-2 border-brand-primary bg-brand-primary" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded border-2 border-transparent bg-muted opacity-50" /> Occupied
        </span>
      </div>

      <div className="flex justify-center">
        <svg className="w-16 h-8 text-muted-foreground/30 mb-2" viewBox="0 0 100 40" fill="none">
          <path d="M10 35 Q50 0 90 35" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>

      <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory">
        <div className="flex flex-col items-center gap-1 min-w-[300px]">
          <div className="grid grid-cols-8 gap-1 text-xs text-muted-foreground mb-1">
            {travelClass === 'ECONOMY' ? (
              <>
                <div /><div className="text-center">A</div><div className="text-center">B</div><div className="text-center">C</div><div /><div className="text-center">D</div><div className="text-center">E</div><div className="text-center">F</div>
              </>
            ) : (
              <>
                <div /><div className="text-center">A</div><div className="text-center">C</div><div /><div /><div className="text-center">D</div><div className="text-center">F</div><div />
              </>
            )}
          </div>

          {sortedRows.map((rowNum) => (
            <div key={rowNum} className="grid grid-cols-8 gap-1 items-center">
              <div className="text-xs text-muted-foreground text-right pr-1 w-6">{rowNum}</div>
              {(() => {
                const rowSeats = groupedByRow[rowNum];
                const letters = travelClass === 'ECONOMY' ? ['A', 'B', 'C', '', 'D', 'E', 'F'] : ['A', 'C', '', '', 'D', 'F'];
                return letters.map((letter, idx) => {
                  if (!letter) return <div key={`empty-${idx}`} />;
                  const seat = rowSeats.find((s) => s.number === `${rowNum}${letter}`);
                  if (!seat) return <div key={`no-${letter}`} />;
                  const isSelected = selectedSeats.includes(seat.number);
                  const isOccupied = seat.isOccupied;

                  return (
                    <button
                      key={seat.number}
                      onClick={() => handleSeatClick(seat.number)}
                      disabled={isOccupied}
                      aria-label={`Row ${rowNum}, Seat ${letter}, ${isOccupied ? 'Occupied' : isSelected ? 'Selected' : 'Available'} ${travelClass}`}
                      className={`
                        w-9 h-9 rounded-md text-xs font-medium transition-all duration-200 snap-start
                        ${isOccupied
                          ? 'bg-muted opacity-50 cursor-not-allowed border-2 border-transparent'
                          : isSelected
                          ? 'bg-brand-primary text-white border-2 border-brand-dark scale-110 shadow-md'
                          : 'bg-background border-2 border-border hover:border-brand-primary hover:bg-brand-light cursor-pointer'
                        }
                      `}
                    >
                      {letter}
                    </button>
                  );
                });
              })()}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground mt-4">
        {selectedSeats.length === 0
          ? `Select up to ${passengers} seat${passengers > 1 ? 's' : ''}`
          : `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} selected: ${selectedSeats.join(', ')}`}
      </div>
    </div>
  );
}
