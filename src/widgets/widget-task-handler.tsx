import type { WidgetTaskHandlerProps } from 'react-native-android-widget';

import {
  Trip,
  UpcomingTripWidget,
} from './UpcomingTripWidget';

import {
  getBookings,
  loadBookings,
  Booking,
} from '../utils/bookingStore';

const nameToWidget = {
  UpcomingTrip: UpcomingTripWidget,
};

function getUpcomingTrip(): Trip | undefined {
  const bookings = getBookings();

  if (!bookings.length) {
    return undefined;
  }

  // Prefer bookings marked as upcoming/confirmed.
  // If no status is available, use the first booking.
  const upcomingBooking =
    bookings.find(
      (booking) =>
        booking.status === 'upcoming' ||
        booking.status === 'confirmed'
    ) ?? bookings[0];

  if (!upcomingBooking) {
    return undefined;
  }

  const destination =
    upcomingBooking.destination ||
    upcomingBooking.itemName ||
    upcomingBooking.serviceName;

  const date =
    upcomingBooking.tripDate ||
    upcomingBooking.bookedAt ||
    'Date not available';

  const daysLeft = calculateDaysLeft(
    upcomingBooking.tripDate
  );

  return {
    destination,
    from: getFromCode(upcomingBooking),
    to: getToCode(upcomingBooking),
    date,
    daysLeft,
    status:
      upcomingBooking.status === 'completed'
        ? 'Completed'
        : upcomingBooking.status === 'cancelled'
          ? 'Cancelled'
          : 'Confirmed',
  };
}

function calculateDaysLeft(
  tripDate?: string
): number {
  if (!tripDate) {
    return 0;
  }

  const targetDate = new Date(tripDate);

  if (Number.isNaN(targetDate.getTime())) {
    return 0;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const difference =
    targetDate.getTime() - today.getTime();

  return Math.max(
    0,
    Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    )
  );
}

function getFromCode(
  booking: Booking
): string {
  const service = booking.serviceName.toLowerCase();

  if (service.includes('hotel')) {
    return 'STAY';
  }

  return 'TRIP';
}

function getToCode(
  booking: Booking
): string {
  if (booking.destination) {
    return booking.destination;
  }

  return booking.itemName;
}

export async function widgetTaskHandler(
  props: WidgetTaskHandlerProps
) {
  const widgetInfo = props.widgetInfo;

  const Widget =
    nameToWidget[
      widgetInfo.widgetName as keyof typeof nameToWidget
    ];

  // Unknown widget
  if (!Widget) {
    return;
  }

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      // Make sure the latest saved bookings
      // are loaded from AsyncStorage.
      await loadBookings();

      const trip = getUpcomingTrip();

      props.renderWidget(
        <Widget trip={trip} />
      );

      break;
    }

    default:
      break;
  }
}