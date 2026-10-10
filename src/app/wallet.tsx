import { TextSize, FontWeight, FontFamily } from '@/constants/typography';
import { Text } from '@/components/ui/Text';
import { Action, Copy, FeatureScreen, Panel, Row } from '@/components/FeatureScreen';
import { Colors } from '@/constants/colors';
import { supportContact } from '@/constants/navigation';
import { useAuth } from '@/utils/authStore';
import { loadWallet, type WalletData } from '@/utils/featureApi';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

export default function WalletScreen() {
  const user = useAuth(); const [wallet, setWallet] = useState<{ actor: string; data: WalletData } | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  useEffect(() => { let active = true; if (!user || !process.env.EXPO_PUBLIC_WALLET_API_URL) return; void Promise.resolve().then(() => { if (active) setLoading(true); return loadWallet(); }).then(data => { if (active) setWallet({ actor: user.id, data }); }).catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'Wallet unavailable.'); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [user]);
  const openWebsite = async () => { try { await Linking.openURL(`${supportContact.website}/wallet`); } catch { Alert.alert('LemonTrip wallet', `Open ${supportContact.website}/wallet in your browser.`); } };
  const verified = user && wallet?.actor === user.id ? wallet.data : null;
  return <FeatureScreen title="Your travel wallet" subtitle="Balance, payments, and a little extra for your next trip." eyebrow="LEMONTRIP WALLET"><View style={styles.balance}><View pointerEvents="none" style={styles.balanceRing} /><View style={styles.balanceHeader}><Text style={styles.label}>AVAILABLE BALANCE</Text><View style={styles.balanceIcon}><Ionicons name="wallet-outline" size={20} color={Colors.primaryDark} /></View></View><Text style={styles.amount}>{verified ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: verified.currency }).format(verified.balance) : '—'}</Text><Text style={styles.note}>{loading ? 'Checking your balance…' : !user ? 'Sign in to access your wallet' : verified ? 'Verified wallet balance' : 'Your balance is unavailable right now'}</Text>{!user ? <Action label="Sign in" onPress={() => router.push('/login')} /> : <Action label="Add money" onPress={() => router.push('/wallet/add-money')} />}</View>{error ? <Copy>{error}</Copy> : null}<Panel title="Manage your payments"><Row title="Transactions" detail="Top-ups, bookings and refunds" icon="receipt-outline" route="/wallet/transactions" /><Row title="Add money" detail="Top up securely" icon="add-circle-outline" route="/wallet/add-money" /><Row title="Payment methods" detail="Choose how to pay" icon="card-outline" route="/wallet/payment-methods" /><Row title="Coupons & promo codes" detail="A little extra for your journey" icon="pricetag-outline" route="/wallet/coupons" /><Row title="Payment status" detail="Track a payment" icon="checkmark-circle-outline" route="/wallet/payment-status" /></Panel><Panel title="Need another way to access your wallet?"><Copy>View your wallet on the LemonTrip website using your website sign-in.</Copy><Action label="Open website wallet" onPress={() => void openWebsite()} secondary /><Row title="Wallet support" icon="headset-outline" route="/contact" /></Panel></FeatureScreen>;
}
const styles = StyleSheet.create({
  balance: { position: 'relative', overflow: 'hidden', backgroundColor: Colors.primaryDark, borderRadius: 23, borderWidth: 1, borderColor: Colors.onDarkBorder, padding: 20, gap: 15 },
  balanceRing: { position: 'absolute', width: 150, height: 150, right: -62, top: -76, borderWidth: 1, borderColor: Colors.onDarkBorder, borderRadius: 75 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Colors.accent },
  label: { fontFamily: FontFamily.sans, fontSize: TextSize.micro, letterSpacing: 1.4, fontWeight: FontWeight.extraBold, color: Colors.accent },
  amount: { fontFamily: FontFamily.sans, fontSize: TextSize.heroLarge, fontWeight: FontWeight.extraBold, color: Colors.white },
  note: { fontFamily: FontFamily.sans, fontSize: TextSize.body, color: Colors.onDarkMuted },
});
