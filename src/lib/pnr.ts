import { prisma } from './prisma';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRandomPNR(): string {
  let pnr = '';
  for (let i = 0; i < 6; i++) {
    pnr += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return pnr;
}

export async function generateUniquePNR(): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    const pnr = generateRandomPNR();
    const existing = await prisma.booking.findUnique({ where: { pnr } });
    if (!existing) return pnr;
    attempts++;
  }
  throw new Error('Failed to generate unique PNR after 10 attempts');
}
