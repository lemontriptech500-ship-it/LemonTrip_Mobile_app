import { Brand } from '@/constants/colors';
import { Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Reference geometry: compact lowercase, steep rising joins, narrow rounded
// pen strokes, and a hooked descender. This is drawn lettering, not a font.
// Each path follows a pen movement so the revised shapes still write on.
export const TRIP_STROKES = [
  { d: 'M 28 34 C 31 26 36 22 37 27 C 39 33 29 52 23 66 C 18 77 15 87 20 87 C 25 87 33 78 42 66', length: 120, start: 0, end: 0.23 },
  { d: 'M 13 53 C 26 51 39 49 49 49', length: 40, start: 0.23, end: 0.32 },
  { d: 'M 39 84 C 46 71 55 56 61 44 L 48 73 C 59 59 68 44 75 45 C 81 46 80 52 77 56', length: 140, start: 0.32, end: 0.53 },
  { d: 'M 94 45 C 86 61 76 77 77 83 C 78 94 96 76 108 59', length: 95, start: 0.53, end: 0.68 },
  { d: 'M 116 45 C 107 65 95 93 93 111 C 92 119 93 123 96 123', length: 95, start: 0.68, end: 0.81 },
  { d: 'M 107 65 C 118 51 129 41 134 45 C 145 55 125 84 114 85 C 106 86 108 77 111 71', length: 115, start: 0.81, end: 0.97 },
  { d: 'M 104 28 L 102 31', length: 8, start: 0.97, end: 1 },
] as const;

export function TripWordmark({ progress, width = 240 }: { progress: Animated.Value; width?: number }) {
  return (
    <Svg width={width} height={width * (140 / 155)} viewBox="0 0 155 140" accessible accessibilityRole="image" accessibilityLabel="Trip">
      {TRIP_STROKES.map(({ d, length, start, end }, index) => (
        <AnimatedPath
          key={index}
          d={d}
          fill="none"
          stroke={Brand.lemon}
          strokeWidth={6.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={[length, length]}
          strokeDashoffset={progress.interpolate({
            inputRange: [start, end],
            outputRange: [length, 0],
            extrapolate: 'clamp',
          })}
          opacity={progress.interpolate({
            inputRange: [start, start + 0.001],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          })}
        />
      ))}
    </Svg>
  );
}
