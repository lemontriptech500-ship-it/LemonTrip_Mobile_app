import { Brand } from '@/constants/colors';
import { Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Actual Great Vibes Regular glyph outlines for "trip", bundled so the splash
// renders immediately without waiting for font loading. See the font OFL license.
const TRIP_OUTLINE = 'M244 12Q231 31 215.0 60.0Q199 89 185.5 116.0Q172 143 165 157H257Q257 161 253.5 170.0Q250 179 240 183H153Q141 210 125.5 248.0Q110 286 95.5 327.0Q81 368 71.5 403.5Q62 439 62 461Q62 491 70.0 505.5Q78 520 99 520Q126 520 151.0 493.5Q176 467 198.5 427.0Q221 387 238 347Q250 347 250 356Q239 383 223.0 415.0Q207 447 186.5 476.5Q166 506 140.5 524.5Q115 543 84 543Q42 543 27.0 519.5Q12 496 12 459Q12 432 22.0 393.5Q32 355 46.5 314.0Q61 273 75.0 237.5Q89 202 97 183H33Q33 175 40.0 166.0Q47 157 55 157H108Q116 141 126.5 117.0Q137 93 155 64Q170 40 193.5 26.0Q217 12 244 12ZM239 344Q247 327 260.0 289.5Q273 252 287.0 206.0Q301 160 308 119Q311 103 319.0 95.5Q327 88 336 88Q349 88 360.0 100.5Q371 113 371 136Q371 164 354.5 184.0Q338 204 314 222Q324 223 335.0 223.5Q346 224 359 224Q406 224 452 218Q454 224 454 227Q454 240 446.5 260.0Q439 280 431 296Q427 305 415.0 328.5Q403 352 389.0 381.5Q375 411 365.5 439.5Q356 468 356 488Q356 514 376 514Q395 514 429.0 469.5Q463 425 497 347Q509 347 509 356Q498 383 481.5 415.0Q465 447 445.0 475.5Q425 504 402.0 522.5Q379 541 354 541Q335 541 316.0 525.5Q297 510 297 475Q297 444 309.0 414.5Q321 385 336.0 359.0Q351 333 363.0 313.0Q375 293 375 281Q375 263 352.5 255.0Q330 247 294 246Q276 292 267.0 314.0Q258 336 250 356Q234 356 239 344ZM525 540Q488 540 473.0 518.5Q458 497 458 469Q458 454 461.5 438.5Q465 423 470 410L537 239Q540 231 540 225Q540 215 535.0 207.5Q530 200 528 197L583 195Q598 194 604.5 198.5Q611 203 611 209Q611 215 604 231Q594 255 577.0 291.0Q560 327 543.5 365.0Q527 403 515.5 436.0Q504 469 504 487Q504 500 510.5 509.0Q517 518 533 518Q554 518 574.5 501.5Q595 485 613.0 459.0Q631 433 646.5 403.0Q662 373 673 347Q685 347 685 356Q675 381 659.0 413.0Q643 445 622.5 473.5Q602 502 577.5 521.0Q553 540 525 540ZM614 133Q601 133 591.5 123.0Q582 113 582 99Q582 82 596.0 68.5Q610 55 627 55Q641 55 651.0 64.0Q661 73 661 87Q661 105 647.0 119.0Q633 133 614 133ZM516 813Q504 813 491.5 809.5Q479 806 466 808Q472 802 489.0 773.5Q506 745 529.0 702.5Q552 660 576.5 610.5Q601 561 624.0 512.5Q647 464 663.5 422.5Q680 381 685 356Q680 356 676.0 354.0Q672 352 673 347Q673 347 679.0 329.0Q685 311 691.0 285.5Q697 260 697 239Q697 225 694.0 215.0Q691 205 683 204L733 196Q739 195 744.0 194.5Q749 194 753 194Q762 194 765.5 200.5Q769 207 769 227Q769 252 760.5 290.5Q752 329 741 358Q752 340 769.5 312.0Q787 284 810.0 255.0Q833 226 858.0 206.5Q883 187 907 187Q912 187 920 189Q948 196 959.5 216.5Q971 237 971 265Q971 295 959.5 331.0Q948 367 929.0 401.5Q910 436 887 464Q859 499 820.0 520.0Q781 541 740 541Q703 541 671 522L576 761Q562 791 549.0 802.0Q536 813 516 813ZM708 520Q736 520 771.0 494.0Q806 468 838.5 427.5Q871 387 893 346Q908 318 915.0 294.5Q922 271 922 254Q922 215 894 215Q881 215 860.5 229.0Q840 243 813 280Q784 320 749.5 380.5Q715 441 679 508Q691 520 708 520Z';
const WORDMARK_WIDTH = 983;
const WORDMARK_HEIGHT = 825;

export function TripWordmark({ progress, width = 240 }: { progress: Animated.Value; width?: number }) {
  const height = width * (WORDMARK_HEIGHT / WORDMARK_WIDTH);

  // Reveal left-to-right by animating the width of an overflow-hidden wrapper.
  // The inner Svg keeps its full size, so the wrapper simply crops it.
  const revealWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
    extrapolate: 'clamp',
  });

  return (
    // Fixed-size outer box keeps layout stable (and centering correct) during the reveal.
    <Animated.View style={{ width, height, alignItems: 'flex-start' }}>
      <Animated.View style={{ width: revealWidth, height, overflow: 'hidden' }}>
        <Svg
          width={width}
          height={height}
          viewBox={`0 0 ${WORDMARK_WIDTH} ${WORDMARK_HEIGHT}`}
          accessible
          accessibilityRole="image"
          accessibilityLabel="Trip"
        >
          <Path
            d={TRIP_OUTLINE}
            fill={Brand.lemon}
            stroke={Brand.lemon}
            strokeWidth={4}
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

/*
 * Usage (in your splash screen):
 *
 * const progress = useRef(new Animated.Value(0)).current;
 *
 * useEffect(() => {
 *   Animated.timing(progress, {
 *     toValue: 1,
 *     duration: 1400,
 *     useNativeDriver: false, // required: width can't run on the native driver
 *   }).start();
 * }, [progress]);
 *
 * <TripWordmark progress={progress} />
 */