/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const root = path.join(__dirname, '..');

function harness() {
  const cache = new Map();
  const stored = new Map();
  const storage = {
    getItem: async key => stored.get(key) ?? null,
    setItem: async (key, value) => { stored.set(key, value); },
  };
  const effects = [];
  const react = {
    useCallback: callback => callback,
    useEffect: callback => { effects.push(callback); },
    useSyncExternalStore: (_, snapshot) => snapshot(),
    Children: { map: (children, callback) => Array.isArray(children) ? children.map(callback) : children == null ? children : callback(children) },
  };
  const modules = {
    react,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'react-native': { Text: 'Text', TextInput: 'TextInput', StyleSheet: { flatten: style => Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style } },
    '@react-native-async-storage/async-storage': { __esModule: true, default: storage },
    '@/utils/authStore': { useAuth: () => null },
  };
  function load(name, parent = path.join(root, 'src/utils/intl.ts')) {
    if (name in modules) return modules[name];
    let file = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(parent), name);
    if (name === './authStore') return modules['@/utils/authStore'];
    if (!path.extname(file)) file += fs.existsSync(file + '.ts') ? '.ts' : '.tsx';
    if (cache.has(file)) return cache.get(file);
    if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
    const exports = {};
    cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    } }).outputText;
    vm.runInNewContext(code, { exports, require: dependency => load(dependency, file), Intl, Date, Map, Set, Promise, AbortController, setTimeout, clearTimeout }, { filename: file });
    return exports;
  }
  return { load, storage, stored, flushEffects: () => { while (effects.length) effects.shift()(); } };
}
const settle = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

test('Hindi translates sentences, case variants and preserves whitespace', () => {
  const { load } = harness();
  const { translateCopy } = load('@/i18n/translate');
  assert.equal(translateCopy('  SEARCH TRIPS\n', 'Hindi'), '  यात्राएँ खोजें\n');
  assert.equal(translateCopy('Search Trips', 'English'), 'Search Trips');
});

test('dynamic values are preserved and short templates do not steal complete sentences', () => {
  const { load } = harness();
  const { translateCopy } = load('@/i18n/translate');
  assert.equal(translateCopy('Passenger 3', 'Hindi'), 'यात्री 3');
  assert.equal(translateCopy('2 passengers', 'Hindi'), '2 यात्री');
  assert.equal(translateCopy('2h 35m', 'Hindi'), '2 घंटे 35 मिनट');
  assert.equal(translateCopy('Welcome, Asha Sharma', 'Hindi'), 'स्वागत है, Asha Sharma');
  assert.equal(translateCopy('Jordan ExampleUser XYZ', 'Hindi'), 'Jordan ExampleUser XYZ');
  assert.equal(translateCopy('REF-123456', 'Hindi'), 'REF-123456');
});

test('every generated translation preserves its interpolation parameters', () => {
  const generated = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/hi.json'), 'utf8'));
  for (const [source, translated] of Object.entries(generated)) {
    assert.deepEqual((translated.match(/\{\d+\}/g) ?? []).sort(), (source.match(/\{\d+\}/g) ?? []).sort(), source);
  }
  assert.ok(Object.keys(generated).length > 2300 - 1);
});

test('mixed text and numeric children translate as a sentence', () => {
  const h = harness();
  h.load('@/utils/intl').setIntlPreferences('Hindi', 'INR');
  const { Text } = h.load('@/components/ui/Text');
  const node = Text({ children: ['Passenger ', 3] });
  assert.equal(node.props.children, 'यात्री 3');
  const nested = { type: 'strong', props: { children: 'Asha' } };
  const rich = Text({ children: ['Home', nested] });
  assert.equal(rich.props.children[0], 'होम');
  assert.equal(rich.props.children[1], nested);
});

test('inputs translate prompts without modifying what the user typed', () => {
  const h = harness();
  h.load('@/utils/intl').setIntlPreferences('Hindi', 'INR');
  const { TextInput } = h.load('@/components/ui/Text');
  const node = TextInput({ value: 'Asha Sharma', placeholder: 'Search', accessibilityLabel: 'Search' });
  assert.equal(node.props.value, 'Asha Sharma');
  assert.equal(node.props.placeholder, 'खोजें');
  assert.equal(node.props.accessibilityLabel, 'खोजें');
});

test('mounted preference consumers share the selection immediately', async () => {
  const h = harness();
  const { usePreferences } = h.load('@/utils/preferencesStore');
  const first = usePreferences();
  usePreferences();
  h.flushEffects();
  await settle();
  await first.update({ language: 'Hindi' });
  assert.equal(usePreferences().value.language, 'Hindi');
  assert.equal(h.load('@/utils/intl').getAppLanguage(), 'Hindi');
  assert.equal(JSON.parse(h.stored.get('lemontrip-ui:guest:preferences')).language, 'Hindi');
});

test('a delayed initial read cannot undo a newer language choice', async () => {
  const h = harness();
  let completeRead;
  h.storage.getItem = () => new Promise(resolve => { completeRead = resolve; });
  const { usePreferences } = h.load('@/utils/preferencesStore');
  const prefs = usePreferences();
  h.flushEffects();
  await prefs.update({ language: 'Hindi' });
  completeRead(JSON.stringify({ language: 'English', currency: 'INR' }));
  await settle();
  assert.equal(usePreferences().value.language, 'Hindi');
});

test('rapid language changes write to storage in the same order', async () => {
  const h = harness();
  let finishFirst;
  const written = [];
  h.storage.setItem = async (_, value) => {
    written.push(JSON.parse(value).language);
    if (written.length === 1) await new Promise(resolve => { finishFirst = resolve; });
  };
  const { usePreferences } = h.load('@/utils/preferencesStore');
  const prefs = usePreferences();
  const first = prefs.update({ language: 'Hindi' });
  const second = prefs.update({ language: 'English' });
  await settle();
  assert.deepEqual(written, ['Hindi']);
  finishFirst();
  await Promise.all([first, second]);
  assert.deepEqual(written, ['Hindi', 'English']);
  assert.equal(usePreferences().value.language, 'English');
});

test('storage failure restores the previous language with an error', async () => {
  const h = harness();
  h.storage.setItem = async () => { throw new Error('storage unavailable'); };
  const { usePreferences } = h.load('@/utils/preferencesStore');
  const prefs = usePreferences();
  await prefs.update({ language: 'Hindi' });
  const restored = usePreferences();
  assert.equal(restored.value.language, 'English');
  assert.ok(restored.error);
});
