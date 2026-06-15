import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Navbar } from '@/components/layout/navbar';

export const metadata: Metadata = {
  title: 'SkyBook — Multi-Airline Ticket Booking',
  description: 'Search, book, and track flights from multiple airlines in one place',
  icons: {
    icon: [
      { url: '/favicon_io/favicon.ico', sizes: 'any' },
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/favicon_io/apple-touch-icon.png' },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-ui antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1000] focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded-lg">
          Skip to main content
        </a>
        <Providers>
          <Navbar />
          <main id="main-content" className="min-h-screen">{children}</main>
          <footer className="border-t py-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SkyBook — All airlines, one platform.</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
