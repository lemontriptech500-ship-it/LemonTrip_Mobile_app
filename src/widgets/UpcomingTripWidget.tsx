import { Colors } from '@/constants/colors';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface Trip {
  destination: string;
  from: string;
  to: string;
  date: string;
  daysLeft: number;
  status: string;
}

interface UpcomingTripWidgetProps {
  trip?: Trip;
}

export function UpcomingTripWidget({
  trip,
}: UpcomingTripWidgetProps) {
  // --------------------------------------------------
  // EMPTY STATE
  // --------------------------------------------------

  if (!trip) {
    return (
      <FlexWidget
        style={{
          width: 'match_parent',
          height: 'match_parent',
          padding: 18,
          backgroundColor: Colors.surface,
          borderRadius: 22,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <TextWidget
          text="LEMONTRIP"
          style={{
            fontSize: 11,
            fontWeight: 'bold',
            color: Colors.primary,
            marginBottom: 7,
          }}
        />

        <TextWidget
          text="No upcoming trips"
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: Colors.textDark,
          }}
        />

        <TextWidget
          text="Plan your next journey with LemonTrip"
          style={{
            fontSize: 12,
            color: Colors.textLight,
            marginTop: 5,
          }}
        />
      </FlexWidget>
    );
  }

  // --------------------------------------------------
  // UPCOMING TRIP
  // --------------------------------------------------

  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 'match_parent',
        padding: 18,
        backgroundColor: Colors.surface,
        borderRadius: 22,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Header */}

      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="UPCOMING TRIP"
          style={{
            fontSize: 11,
            fontWeight: 'bold',
            color: Colors.textLight,
          }}
        />

        <TextWidget
          text="LEMONTRIP"
          style={{
            fontSize: 9,
            fontWeight: 'bold',
            color: Colors.primary,
          }}
        />
      </FlexWidget>

      {/* Destination */}

      <FlexWidget
        style={{
          width: 'match_parent',
          marginTop: 10,
          flexDirection: 'column',
        }}
      >
        <TextWidget
          text={trip.destination}
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: Colors.textDark,
          }}
        />

        <TextWidget
          text={`${trip.from}  ->  ${trip.to}`}
          style={{
            fontSize: 13,
            fontWeight: 'bold',
            color: Colors.textLight,
            marginTop: 4,
          }}
        />
      </FlexWidget>

      {/* Date + Days Left */}

      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 12,
        }}
      >
        <FlexWidget
          style={{
            flexDirection: 'column',
          }}
        >
          <TextWidget
            text="TRAVEL DATE"
            style={{
              fontSize: 9,
              fontWeight: 'bold',
              color: Colors.textLight,
            }}
          />

          <TextWidget
            text={trip.date}
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: Colors.textDark,
              marginTop: 2,
            }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: Colors.surfaceMuted,
            borderRadius: 12,
          }}
        >
          <TextWidget
            text={
              trip.daysLeft === 0
                ? 'Today'
                : `${trip.daysLeft} days left`
            }
            style={{
              fontSize: 11,
              fontWeight: 'bold',
              color: Colors.primary,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Status */}

      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 10,
        }}
      >
        <TextWidget
          text="STATUS"
          style={{
            fontSize: 9,
            fontWeight: 'bold',
            color: Colors.textLight,
          }}
        />

        <TextWidget
          text={`  ${trip.status}`}
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: Colors.success,
            marginLeft: 3,
          }}
        />
      </FlexWidget>

      {/* Footer */}

      <FlexWidget
        style={{
          width: 'match_parent',
          marginTop: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="LemonTrip"
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: Colors.textDark,
          }}
        />

        <TextWidget
          text="View Trip  >"
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: Colors.primary,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}