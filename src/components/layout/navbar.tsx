'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Plane, Sun, Moon, Menu, X, User, LogOut, LayoutDashboard, Search, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN';

  const navLinks = [
    { href: '/', label: 'Home', icon: Search },
    { href: '/flight-status', label: 'Flight Status', icon: ClipboardList },
  ];

  if (session) {
    navLinks.push({ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard });
  }

  if (isAdmin) {
    navLinks.push({ href: '/admin', label: 'Admin', icon: LayoutDashboard });
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Plane className="h-6 w-6 text-primary" />
              <span className="hidden sm:inline">Airline Booking</span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            {session ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                  {user?.name || user?.email}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-accent"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            {session ? (
              <>
                <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {user?.email}
                </div>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground w-full"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-primary hover:text-primary/80"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
