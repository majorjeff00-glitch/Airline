import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/layout/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Airline Booking - Multi-Airline Ticket System',
  description: 'Search, book, and track flights from multiple airlines',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="border-t py-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Airline Booking. All airlines, one platform.</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
