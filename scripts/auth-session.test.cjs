/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

function harness({ platform = 'android', token = 'saved-refresh', refresh, writeFails = false } = {}) {
  let stored = token;
  const calls = [];
  const session = { user: { id: 'returning-user' }, accessToken: 'access', refreshToken: 'rotated-refresh' };
  const modules = {
    react: { useState: () => [], useEffect: () => {} },
    'react-native': { Platform: { OS: platform } },
    'expo-secure-store': {
      getItemAsync: async () => stored,
      setItemAsync: async (_key, value) => { if (writeFails) throw new Error('Storage unavailable'); stored = value; },
      deleteItemAsync: async () => { stored = null; },
    },
    '@/utils/checkoutStore': { clearCheckoutDetails() {} },
    '@/utils/firebasePhoneAuthService': { signOutFirebasePhoneUser: async () => {} },
    '@/utils/googleNativeAuth': { signOutGoogleUser() {} },
    '@/utils/authApi': {
      refreshAuthSession: async value => { calls.push(value); return refresh ? refresh() : session; },
      revokeAuthSession: async () => {},
    },
  };
  const source = fs.readFileSync(path.join(__dirname, '..', 'src/utils/authStore.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => {
    assert.ok(name in modules, `Unexpected dependency: ${name}`);
    return modules[name];
  } });
  return { auth: exports, calls, stored: () => stored, session };
}

test('native saved login is restored once and the rotated token is persisted', async () => {
  const h = harness();
  const first = h.auth.restoreSession();
  assert.equal(h.auth.restoreSession(), first);
  await first;
  assert.equal(h.auth.getUser().id, 'returning-user');
  assert.equal(h.auth.getAccessToken(), 'access');
  assert.equal(h.stored(), 'rotated-refresh');
  await h.auth.restoreSession();
  assert.equal(h.calls.length, 1);
});

test('a new native user has no session and does not call refresh', async () => {
  const h = harness({ token: null });
  await h.auth.restoreSession();
  assert.equal(h.auth.getUser(), null);
  assert.equal(h.calls.length, 0);
});

test('web startup restores through its HTTP-only cookie without SecureStore', async () => {
  const h = harness({ platform: 'web', token: null });
  await h.auth.restoreSession();
  assert.deepEqual(h.calls, ['']);
  assert.equal(h.auth.getUser().id, 'returning-user');
  assert.equal(h.stored(), null);
});

test('an invalid or revoked refresh session clears saved credentials', async () => {
  const h = harness({ refresh: () => { throw Object.assign(new Error('Session expired'), { status: 401 }); } });
  await h.auth.restoreSession();
  assert.equal(h.auth.getUser(), null);
  assert.equal(h.stored(), null);
});

test('a temporary connection failure preserves saved credentials for the next launch', async () => {
  const h = harness({ refresh: () => { throw new Error('Offline'); } });
  await h.auth.restoreSession();
  assert.equal(h.auth.getUser(), null);
  assert.equal(h.stored(), 'saved-refresh');
});

test('a token storage failure does not discard a successfully restored session', async () => {
  const h = harness({ writeFails: true });
  await h.auth.restoreSession();
  assert.equal(h.auth.getUser().id, 'returning-user');
});

test('logout while refresh is pending cannot restore the logged-out user', async () => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const h = harness({ refresh: () => pending });
  const restoring = h.auth.restoreSession();
  await Promise.resolve();
  h.auth.logout();
  resolve(h.session);
  await restoring;
  assert.equal(h.auth.getUser(), null);
  assert.equal(h.stored(), null);
});

test('a newer login is never overwritten by a slow startup refresh', async () => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const h = harness({ refresh: () => pending });
  const restoring = h.auth.restoreSession();
  await Promise.resolve();
  await h.auth.login({ user: { id: 'new-user' }, accessToken: 'new-access', refreshToken: 'new-refresh' });
  resolve(h.session);
  await restoring;
  assert.equal(h.auth.getUser().id, 'new-user');
  assert.equal(h.stored(), 'new-refresh');
});
