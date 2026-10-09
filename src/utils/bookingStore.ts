import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export const BOOKINGS_KEY = 'lemontrip-bookings';

export interface Booking {
  id: string;
  serviceName: string;
  itemName: string;
  price: string;
  bookedAt: string;
  tripDate?: string;
  destination?: string;
  status?: 'upcoming' | 'completed' | 'cancelled' | 'confirmed';
}

export type BookingStatus = NonNullable<Booking['status']>;

let bookings: Booking[] = [];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

async function persist() {
  try {
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.warn('Could not save bookings:', error);
  }
}

export async function loadBookings() {
  try {
    const raw = await AsyncStorage.getItem(BOOKINGS_KEY);
    if (!raw) return;

    const stored = JSON.parse(raw) as Booking[];
    const knownIds = new Set(bookings.map((b) => b.id));
    bookings = [...bookings, ...stored.filter((b) => !knownIds.has(b.id))];
    notify();
  } catch (error) {
    console.warn('Could not load bookings:', error);
  }
}

if (Platform.OS !== 'web' || typeof window !== 'undefined') {
  void loadBookings();
}

export function addBooking(booking: Booking) {
  bookings = [booking, ...bookings];
  notify();
  persist();
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  const exists = bookings.some((b) => b.id === id);
  if (!exists) return false;

  bookings = bookings.map((b) => (b.id === id ? { ...b, status } : b));
  notify();
  persist();
  return true;
}

export function getBookings() {
  return bookings;
}

export function useBookings() {
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);
  return bookings;
}