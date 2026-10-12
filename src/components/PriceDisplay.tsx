import { FontFamily } from '@/constants/typography';
import { Colors } from '@/constants/colors';
import { convertReferenceAmount, formatLocalizedCurrency, translate, useAppLanguage, useSelectedCurrency } from '@/utils/intl';
import { useEffect, useState } from 'react';
import { Text, View, type StyleProp, type TextStyle } from 'react-native';

/** Keeps the provider's payable price primary and labels the converted reference estimate. */
export function PriceDisplay({ amount, currency, amountStyle, estimate = true }: { amount: number; currency: string; amountStyle?: StyleProp<TextStyle>; estimate?: boolean }) {
  useAppLanguage();
  const selected = useSelectedCurrency();
  const [converted, setConverted] = useState<{ amount: number; currency: string; rateDate: string; sourceAmount: number; sourceCurrency: string } | null>(null);
  useEffect(() => {
    let live = true;
    if (!estimate || currency === selected) return;
    void convertReferenceAmount(amount, currency, selected).then((result) => {
      if (live) setConverted(result ? { amount: result.amount, currency: result.currency, rateDate: result.rateDate, sourceAmount: amount, sourceCurrency: currency } : null);
    });
    return () => { live = false; };
  }, [amount, currency, estimate, selected]);
  const visibleConversion = estimate && converted?.sourceAmount === amount && converted.sourceCurrency === currency && converted.currency === selected ? converted : null;
  return (
    <View>
      <Text style={[{ fontFamily: FontFamily.sans, color: Colors.textDark }, amountStyle]}>{formatLocalizedCurrency(amount, currency)}</Text>
      {visibleConversion ? <Text accessibilityLabel={`Approximate converted price ${formatLocalizedCurrency(visibleConversion.amount, visibleConversion.currency)} using reference rate dated ${visibleConversion.rateDate}`} style={{ marginTop: 2, fontFamily: FontFamily.sans, fontSize: 11, color: Colors.textLight }}>
        ≈ {formatLocalizedCurrency(visibleConversion.amount, visibleConversion.currency)} · {translate('Indicative rate')} {visibleConversion.rateDate} · Frankfurter
      </Text> : null}
    </View>
  );
}
