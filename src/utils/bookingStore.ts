import { useState, useEffect } from 'react';

export interface Booking {
  id: string;
  serviceName: string;
  itemName: string;
  price: string;
  bookedAt: string;
}

let bookings: Booking[] = [];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

export function addBooking(booking: Booking) {
  bookings = [booking, ...bookings];
  notify();
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