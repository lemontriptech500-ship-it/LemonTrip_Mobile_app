import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export type VoucherPdfData = {
  bookingId: string;
  serviceName: string;
  itemName: string;
  destination?: string;
  dateLabel: string;
  dateValue: string;
  price: string;
  statusLabel: string;
};

const esc = (value: string) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function buildHtml(d: VoucherPdfData) {
  const row = (label: string, value: string) =>
    '<tr><td class="l">' + esc(label) + '</td><td class="v">' + esc(value) + '</td></tr>';
  return (
    '<html><head><meta charset="utf-8" /><style>' +
    'body{font-family:Arial,Helvetica,sans-serif;color:#0F3D2E;padding:28px;}' +
    '.head{background:#0F3D2E;color:#fff;padding:22px;border-radius:14px;}' +
    '.eyebrow{color:#FFD600;font-size:11px;letter-spacing:2px;font-weight:bold;}' +
    '.title{font-size:28px;font-weight:bold;margin-top:6px;}' +
    '.card{border:1px solid #D5D4CB;border-radius:14px;padding:18px;margin-top:18px;}' +
    '.svc{font-size:11px;letter-spacing:1.5px;color:#6B7280;font-weight:bold;}' +
    '.item{font-size:20px;font-weight:bold;margin-top:6px;}' +
    'table{width:100%;border-collapse:collapse;margin-top:14px;}' +
    'td{padding:9px 0;border-bottom:1px solid #EEE;font-size:14px;}' +
    '.l{color:#6B7280;}.v{text-align:right;font-weight:bold;}' +
    '.total td{font-size:17px;border-bottom:none;}' +
    '.foot{margin-top:22px;font-size:11px;color:#6B7280;}' +
    '</style></head><body>' +
    '<div class="head"><div class="eyebrow">LEMONTRIP BOOKING VOUCHER</div>' +
    '<div class="title">' + esc(d.bookingId) + '</div></div>' +
    '<div class="card"><div class="svc">' + esc(d.serviceName.toUpperCase()) + '</div>' +
    '<div class="item">' + esc(d.itemName) + '</div>' +
    '<table>' +
    row('Booking ID', d.bookingId) +
    (d.destination ? row('Destination', d.destination) : '') +
    row(d.dateLabel, d.dateValue) +
    row('Status', d.statusLabel) +
    '<tr class="total"><td class="l">Total paid</td><td class="v">' + esc(d.price) + '</td></tr>' +
    '</table></div>' +
    '<div class="foot">Need help? Contact LemonTrip support 24/7. Carry a valid photo ID.</div>' +
    '</body></html>'
  );
}

/** Web: opens print dialog (choose "Save as PDF"). Mobile: creates a PDF and opens share sheet. */
export async function downloadBookingPdf(data: VoucherPdfData) {
  const html = buildHtml(data);

  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }

  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'LemonTrip voucher ' + data.bookingId,
      UTI: 'com.adobe.pdf',
    });
  }
}
