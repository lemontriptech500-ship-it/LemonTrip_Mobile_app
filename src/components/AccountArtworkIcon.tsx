import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type AccountArtworkName =
  | 'profile'
  | 'payment'
  | 'settings'
  | 'appearance'
  | 'language'
  | 'currency'
  | 'email'
  | 'booking'
  | 'notifications'
  | 'security'
  | 'password'
  | 'device'
  | 'privacy'
  | 'document'
  | 'help'
  | 'support';

const darkGreen = '#063b24';
const green = '#0b5d35';
const yellow = '#ffd21a';

export function AccountArtworkIcon({ name, size = 30 }: { name: AccountArtworkName; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" accessibilityRole="image">
      <Circle cx="24" cy="24" r="15" fill="#fff6bd" />
      {name === 'profile' ? <>
        <Circle cx="24" cy="18" r="4.5" stroke={darkGreen} strokeWidth="1.8" />
        <Path d="M14.5 34c1.5-5.2 4.7-7.8 9.5-7.8s8 2.6 9.5 7.8" stroke={green} strokeWidth="1.8" strokeLinecap="round" />
      </> : null}
      {name === 'payment' ? <>
        <Rect x="13" y="16" width="22" height="16" rx="3" stroke={darkGreen} strokeWidth="1.8" />
        <Path d="M14 21h20M17 27h5" stroke={green} strokeWidth="1.8" strokeLinecap="round" />
        <Circle cx="30" cy="27" r="2" fill={yellow} stroke={darkGreen} strokeWidth="1.2" />
      </> : null}
      {name === 'settings' ? <>
        <Circle cx="24" cy="24" r="7" stroke={darkGreen} strokeWidth="1.8" />
        <Circle cx="24" cy="24" r="2.5" fill={yellow} stroke={green} strokeWidth="1.5" />
        <Path d="M24 12v4m0 16v4m12-12h-4m-16 0h-4m20.5-8.5-2.8 2.8m-11.4 11.4-2.8 2.8m17 0-2.8-2.8M16.3 16.3l-2.8-2.8" stroke={darkGreen} strokeWidth="1.8" strokeLinecap="round" />
      </> : null}
      {name === 'appearance' ? <>
        <Circle cx="24" cy="24" r="10" stroke={darkGreen} strokeWidth="1.8" />
        <Path d="M24 14a10 10 0 0 1 0 20V14Z" fill={yellow} stroke={green} strokeWidth="1.4" />
      </> : null}
      {name === 'language' ? <>
        <Circle cx="24" cy="24" r="10" stroke={darkGreen} strokeWidth="1.8" />
        <Path d="M14 24h20M24 14c3 3 4.5 6.3 4.5 10S27 31 24 34c-3-3-4.5-6.3-4.5-10S21 17 24 14Z" stroke={green} strokeWidth="1.5" />
        <Path d="m29 13 5 5m-5 0 5-5" stroke={darkGreen} strokeWidth="1.6" strokeLinecap="round" />
      </> : null}
      {name === 'currency' ? <>
        <Rect x="13" y="16" width="22" height="16" rx="3" stroke={darkGreen} strokeWidth="1.8" />
        <Path d="M16 20h16" stroke={green} strokeWidth="1.7" strokeLinecap="round" />
        <Circle cx="24" cy="26" r="4" fill={yellow} stroke={darkGreen} strokeWidth="1.5" />
        <Path d="M22 25h4m-3-2v6" stroke={darkGreen} strokeWidth="1.2" strokeLinecap="round" />
      </> : null}
      {name === 'email' ? <>
        <Rect x="13" y="17" width="22" height="15" rx="2.5" stroke={darkGreen} strokeWidth="1.8" />
        <Path d="m15 19 9 7 9-7" stroke={green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </> : null}
      {name === 'booking' ? <>
        <Rect x="14" y="16" width="20" height="19" rx="3" stroke={darkGreen} strokeWidth="1.8" />
        <Path d="M19 13v6m10-6v6M14 22h20" stroke={green} strokeWidth="1.8" strokeLinecap="round" />
        <Path d="m20 28 2.5 2.5L28 25" stroke={darkGreen} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </> : null}
      {name === 'notifications' ? <>
        <Path d="M16 30h16l-2-3v-6a6 6 0 0 0-12 0v6l-2 3Z" stroke={darkGreen} strokeWidth="1.8" strokeLinejoin="round" />
        <Path d="M21 33a3 3 0 0 0 6 0" stroke={green} strokeWidth="1.8" strokeLinecap="round" />
        <Circle cx="33" cy="16" r="3" fill={yellow} stroke={darkGreen} strokeWidth="1.2" />
      </> : null}
      {name === 'security' ? <>
        <Path d="M24 13 34 17v7c0 6-4 10-10 13-6-3-10-7-10-13v-7l10-4Z" stroke={darkGreen} strokeWidth="1.8" strokeLinejoin="round" />
        <Path d="m19.5 24 3 3 6-7" stroke={green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </> : null}
      {name === 'password' ? <>
        <Circle cx="20" cy="23" r="6" stroke={darkGreen} strokeWidth="1.8" />
        <Path d="m24.5 27.5 9 9m-3-3 3-3m-6 0 3-3" stroke={green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx="20" cy="23" r="2" fill={yellow} />
      </> : null}
      {name === 'device' ? <>
        <Rect x="17" y="12" width="14" height="24" rx="3" stroke={darkGreen} strokeWidth="1.8" />
        <Path d="M22 16h4m-3 16h2" stroke={green} strokeWidth="1.6" strokeLinecap="round" />
        <Circle cx="24" cy="34" r="1" fill={yellow} />
      </> : null}
      {name === 'privacy' ? <>
        <Path d="M12 24s4.5-8 12-8 12 8 12 8-4.5 8-12 8-12-8-12-8Z" stroke={darkGreen} strokeWidth="1.8" strokeLinejoin="round" />
        <Circle cx="24" cy="24" r="4" stroke={green} strokeWidth="1.8" />
        <Circle cx="24" cy="24" r="1.5" fill={yellow} />
      </> : null}
      {name === 'document' ? <>
        <Path d="M17 13h10l5 5v17H17V13Z" stroke={darkGreen} strokeWidth="1.8" strokeLinejoin="round" />
        <Path d="M27 13v6h5m-11 4h7m-7 4h7" stroke={green} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M20 31h5" stroke={yellow} strokeWidth="2.2" strokeLinecap="round" />
      </> : null}
      {name === 'help' ? <>
        <Path d="M14 17c4-2 7-2 10 0 3-2 6-2 10 0v17c-4-2-7-2-10 0-3-2-6-2-10 0V17Z" stroke={darkGreen} strokeWidth="1.8" strokeLinejoin="round" />
        <Path d="M24 17v17m-6-12h3m9 0h-3" stroke={green} strokeWidth="1.6" strokeLinecap="round" />
        <Circle cx="33" cy="14" r="3" fill={yellow} stroke={darkGreen} strokeWidth="1.2" />
      </> : null}
      {name === 'support' ? <>
        <Path d="M14 25v-2a10 10 0 0 1 20 0v2m-20 0h4v8h-2a2 2 0 0 1-2-2v-6Zm20 0h-4v8h2a2 2 0 0 0 2-2v-6Z" stroke={darkGreen} strokeWidth="1.8" strokeLinejoin="round" />
        <Path d="M28 34c-1 2-3 3-6 3" stroke={green} strokeWidth="1.8" strokeLinecap="round" />
        <Circle cx="34" cy="17" r="3" fill={yellow} stroke={darkGreen} strokeWidth="1.2" />
      </> : null}
    </Svg>
  );
}