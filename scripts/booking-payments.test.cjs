/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function moduleFor(file, deps) {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exported = {};
  vm.runInNewContext(code, { exports: exported, require: name => { assert.ok(name in deps, `Unexpected import ${name}`); return deps[name]; } });
  return exported;
}
const api = moduleFor('src/utils/bookingPaymentApi.ts', {
  './apiConfig': { APP_API_URL: 'https://test.invalid' },
  './featureApi': { featureRequest: (...args) => request(...args) },
});
let request = () => { throw new Error('Unexpected request'); };
const order = { keyId: 'rzp_test_fixture', orderId: 'order_fixture123', amount: 123456, currency: 'INR', bookingId: 'booking-1', bookingReference: 'LT-TEST', testMode: true };
const receipt = { razorpayOrderId: order.orderId, razorpayPaymentId: 'pay_fixture123', razorpaySignature: 'signature' };
const input = { service: 'flights', amount: 1234.56, currency: 'INR', itemName: 'Test journey', tripDate: '2026-12-01' };
const { createBookingPaymentSession } = moduleFor('src/utils/bookingPaymentSession.ts', {
  './bookingPaymentApi': {}, './razorpayCheckout': {},
});

test('every checkout requests its own service endpoint in paise and verifies server booking IDs', async () => {
  for (const service of ['flights', 'buses', 'hotels', 'packages']) {
    request = async (_base, endpoint, options) => {
      assert.equal(endpoint, `/api/payments/razorpay/${service}/order`);
      assert.equal(options.body.amount, 1234.56);
      return order;
    };
    assert.equal(await api.createBookingPaymentOrder({ ...input, service }), order);
    request = async (_base, endpoint) => {
      assert.equal(endpoint, `/api/payments/razorpay/${service}/verify`);
      return { status: 'paid', bookingId: order.bookingId };
    };
    const verified = await api.verifyBookingPayment(service, receipt, order);
    assert.equal(verified.paymentId, receipt.razorpayPaymentId);
    assert.equal(verified.bookingId, order.bookingId);
  }
});

test('live keys, altered amounts, unverified bookings and non-INR fares are rejected', async () => {
  for (const invalid of [{ keyId: 'rzp_live_forbidden' }, { amount: 1 }, { testMode: false }, { currency: 'USD' }]) {
    request = async () => ({ ...order, ...invalid });
    await assert.rejects(api.createBookingPaymentOrder(input));
  }
  await assert.rejects(api.createBookingPaymentOrder({ ...input, currency: 'USD' }));
  request = async () => ({ status: 'paid', bookingId: 'someone-else' });
  await assert.rejects(api.verifyBookingPayment('flights', receipt, order));
  await assert.rejects(api.verifyBookingPayment('flights', { ...receipt, razorpayOrderId: 'other-order' }, order));
});

test('verification retries use the same receipt and never open Checkout again', async () => {
  let creates = 0, checkouts = 0, verifies = 0, receipts = 0;
  const session = createBookingPaymentSession({
    createOrder: async () => { creates++; return order; },
    checkout: async () => { checkouts++; return receipt; },
    verify: async (_service, saved) => { verifies++; assert.equal(saved, receipt); if (verifies === 1) throw new Error('Offline'); return { bookingId: order.bookingId, paymentId: receipt.razorpayPaymentId }; },
  });
  await assert.rejects(session.pay(input, {}, () => { receipts++; }), /Offline/);
  assert.equal(session.needsVerification(), true);
  await session.pay(input, {}, () => { receipts++; });
  assert.equal(creates, 1); assert.equal(checkouts, 1); assert.equal(verifies, 2); assert.equal(receipts, 1);
});

test('cancellation and provider failure never verify or confirm payment', async () => {
  for (const failure of ['Cancelled', 'Payment failed']) {
    let verifies = 0;
    const session = createBookingPaymentSession({
      createOrder: async () => order,
      checkout: async () => { throw new Error(failure); },
      verify: async () => { verifies++; },
    });
    await assert.rejects(session.pay(input, {}, () => assert.fail('No receipt should exist')));
    assert.equal(session.needsVerification(), false);
    assert.equal(verifies, 0);
  }
});
