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
          backgroundColor: '#FFFFFF',
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
            color: '#16856F',
            marginBottom: 7,
          }}
        />

        <TextWidget
          text="No upcoming trips"
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#172033',
          }}
        />

        <TextWidget
          text="Plan your next journey with LemonTrip"
          style={{
            fontSize: 12,
            color: '#697386',
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
        backgroundColor: '#FFFFFF',
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
            color: '#6B7280',
          }}
        />

        <TextWidget
          text="LEMONTRIP"
          style={{
            fontSize: 9,
            fontWeight: 'bold',
            color: '#16856F',
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
            color: '#111827',
          }}
        />

        <TextWidget
          text={`${trip.from}  ->  ${trip.to}`}
          style={{
            fontSize: 13,
            fontWeight: 'bold',
            color: '#596579',
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
              color: '#8A94A6',
            }}
          />

          <TextWidget
            text={trip.date}
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: '#1F2937',
              marginTop: 2,
            }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            backgroundColor: '#EEF7F5',
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
              color: '#16856F',
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
            color: '#8A94A6',
          }}
        />

        <TextWidget
          text={`  ${trip.status}`}
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: '#166534',
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
          borderTopColor: '#E5E7EB',
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
            color: '#172033',
          }}
        />

        <TextWidget
          text="View Trip  >"
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: '#16856F',
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}