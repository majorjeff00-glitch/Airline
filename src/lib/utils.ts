import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getAirlineColor(airline: string): string {
  const colors: Record<string, string> = {
    'demo airways': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'fastjet': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'skylink': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'delta': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'united': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'emirates': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'american airlines': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  };
  const key = airline.toLowerCase();
  return colors[key] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    DELAYED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    BOARDING: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    DEPARTED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    CHECKED_IN: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    BOARDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    NO_SHOW: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return map[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}
