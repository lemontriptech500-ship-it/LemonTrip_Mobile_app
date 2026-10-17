import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { FontFamily, FontWeight, TextSize } from '@/constants/typography';
import { APP_API_URL } from '@/utils/apiConfig';
import { registerCheckoutHost, type CheckoutRequest } from '@/utils/razorpayBus';
import { RazorpayCancelled } from '@/utils/razorpayTypes';

// react-native-webview is optional here: without it the host never registers and the app uses the browser-sheet fallback.
let WebViewComponent: any = null;
// eslint-disable-next-line @typescript-eslint/no-require-imports
try { WebViewComponent = require('react-native-webview').WebView; } catch { WebViewComponent = null; }

const RETURN_URL = 'lemontripmobile://razorpay-result'; // must match an allowed prefix in the backend's /pay/checkout page

function parseQuery(url: string) {
  const out: Record<string, string> = {};
  const query = (url.split('?')[1] ?? '').split('#')[0];
  query.split('&').forEach((pair) => {
    if (!pair) return;
    const [key, value = ''] = pair.split('=');
    try { out[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, ' ')); } catch { /* ignore malformed pair */ }
  });
  return out;
}

// Android UPI apps arrive as intent://host/path#Intent;scheme=upi;...;end  ->  upi://host/path
function intentToUrl(url: string) {
  const match = /^intent:\/\/(.*?)#Intent;(.*)$/i.exec(url);
  if (!match) return url;
  const scheme = /(?:^|;)scheme=([^;]+)/.exec(match[2])?.[1];
  return scheme ? `${scheme}://${match[1]}` : url;
}

export function RazorpayCheckoutHost() {
  const insets = useSafeAreaInsets();
  const [request, setRequest] = useState<CheckoutRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const settled = useRef(false);

  useEffect(() => {
    if (!WebViewComponent) return undefined;
    return registerCheckoutHost((next) => { settled.current = false; setLoading(true); setRequest(next); });
  }, []);

  const finish = (action: (r: CheckoutRequest) => void) => {
    if (!request || settled.current) return;
    settled.current = true;
    const current = request;
    setRequest(null);
    action(current);
  };
  const cancel = () => finish((r) => r.reject(new RazorpayCancelled()));
  const askCancel = () => Alert.alert('Cancel payment?', 'You have not been charged yet.', [{ text: 'Keep paying', style: 'cancel' }, { text: 'Cancel payment', style: 'destructive', onPress: cancel }]);

  const complete = (url: string) => {
    const query = parseQuery(url);
    if (query.status === 'cancelled') { cancel(); return; }
    if (query.status !== 'success') { finish((r) => r.reject(new Error(query.reason || 'Payment failed. Please try again.'))); return; }
    const { razorpay_payment_id: paymentId, razorpay_order_id: orderId, razorpay_signature: signature } = query;
    if (!paymentId || !orderId || !signature) { finish((r) => r.reject(new Error('Payment details were not returned. If money was deducted, contact support.'))); return; }
    finish((r) => r.resolve({ razorpayPaymentId: paymentId, razorpayOrderId: orderId, razorpaySignature: signature }));
  };

  const onShouldStart = (event: { url: string }) => {
    const url = event.url;
    if (url.startsWith(RETURN_URL)) { complete(url); return false; }
    if (/^(https?:|about:|data:|blob:)/i.test(url)) return true;
    // UPI apps and other custom schemes open outside the WebView.
    Linking.openURL(url.startsWith('intent:') ? intentToUrl(url) : url).catch(() => undefined);
    return false;
  };

  if (!WebViewComponent) return null;
  const options = request?.options;
  const params = options ? new URLSearchParams({
    order: options.orderId, name: options.name, description: options.description, redirect: RETURN_URL,
    email: options.prefill?.email ?? '', contact: options.prefill?.contact ?? '', customer: options.prefill?.name ?? '',
  }).toString() : '';

  return (
    <Modal visible={!!request} animationType="slide" onRequestClose={askCancel} statusBarTranslucent>
      <View style={[s.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 8 }]}>
        <View style={s.header}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close payment" onPress={askCancel} style={s.close}><Ionicons name="close" size={24} color={Colors.textDark} /></TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Secure payment</Text>
            <Text style={s.sub}>Razorpay · test mode</Text>
          </View>
          <Ionicons name="lock-closed" size={18} color={Colors.primary} />
        </View>
        {request ? (
          <View style={{ flex: 1 }}>
            <WebViewComponent
              key={request.options.orderId}
              source={{ uri: `${APP_API_URL}/pay/checkout?${params}` }}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              setSupportMultipleWindows={false}
              thirdPartyCookiesEnabled
              sharedCookiesEnabled
              onShouldStartLoadWithRequest={onShouldStart}
              onLoadEnd={() => setLoading(false)}
              onError={() => finish((r) => r.reject(new Error('Could not load the payment page. Check that your phone can reach the server.')))}
              onHttpError={(e: { nativeEvent: { statusCode: number } }) => { if (e.nativeEvent.statusCode >= 400) finish((r) => r.reject(new Error(`The payment page returned an error (${e.nativeEvent.statusCode}).`))); }}
              style={{ flex: 1, backgroundColor: Colors.background }}
            />
            {loading ? <View style={s.loading} pointerEvents="none"><ActivityIndicator size="large" color={Colors.primary} /></View> : null}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  close: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface },
  title: { fontFamily: FontFamily.sans, fontSize: TextSize.body, fontWeight: FontWeight.extraBold, color: Colors.textDark },
  sub: { fontFamily: FontFamily.sans, fontSize: TextSize.caption, color: Colors.textLight },
  loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
});