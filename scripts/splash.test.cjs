/* global __dirname */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise the actual screen effects with controllable native callbacks and time.
function harness(file) {
  let now = 0, cursor = 0, timerId = 0;
  let dimensions = { width: 390, height: 844 };
  let fontResult = [true, null];
  const slots = [], effects = [], timers = new Map(), listeners = new Set();
  const routes = [], animations = [];
  let hidden = 0;
  function animation() {
    const instance = {
      stopped: false,
      start(callback) { this.callback = callback; },
      stop() { this.stopped = true; this.callback?.({ finished: false }); },
      complete(finished = true) { this.callback?.({ finished }); },
    };
    animations.push(instance);
    return instance;
  }
  const Animated = {
    Value: class {
      constructor(value) { this.value = value; }
      setValue(value) { this.value = value; }
      interpolate() { return {}; }
    },
    loop: animation, timing: animation, delay: animation, sequence: animation, parallel: animation,
    View: 'Animated.View', Text: 'Animated.Text',
  };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = value; }];
    },
    useEffect(setup, deps) {
      const index = cursor++;
      const previous = effects[index];
      if (!previous || deps.some((value, i) => value !== previous.deps[i])) {
        previous?.cleanup?.();
        effects[index] = { setup, deps, cleanup: setup() };
      }
    },
  };
  const modules = {
    react,
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    'react-native': {
      Animated, View: 'View', Platform: { select: choices => choices.ios },
      Easing: { linear: () => {}, cubic: () => {}, in: x => x },
      StyleSheet: { create: x => x, absoluteFill: {} },
      useWindowDimensions: () => dimensions,
      Dimensions: { get: () => dimensions },
      AppState: { addEventListener: (_, listener) => {
        listeners.add(listener);
        return { remove: () => listeners.delete(listener) };
      } },
    },
    'react-native-safe-area-context': { useSafeAreaInsets: () => ({ bottom: 34 }) },
    'expo-router': { router: { replace: route => routes.push(route) }, Stack: Object.assign('Stack', {}) },
    'expo-splash-screen': { hide: () => hidden++, preventAutoHideAsync: () => Promise.resolve() },
    'expo-font': { useFonts: () => fontResult },
    '@expo/vector-icons': { Ionicons: { font: { ionicons: 'ionicons.ttf' } } },
    '@/utils/preferencesStore': { usePreferences: () => {} },
    '@/constants/colors': { Brand: { forest: '#0F3D2E', lemon: '#FFD000' } },
    '@/components/TripWordmark': { TripWordmark: 'TripWordmark' },
  };
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
  } }).outputText;
  const exported = {};
  vm.runInNewContext(code, {
    exports: exported,
    require: name => {
      if (name.endsWith('.ttf')) return name;
      assert.ok(name in modules, `Unexpected dependency: ${name}`);
      return modules[name];
    },
    Date: { now: () => now },
    setTimeout: (callback, delay) => {
      const id = ++timerId;
      timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout: id => timers.delete(id),
  }, { filename: file });
  return {
    routes, animations, timers, listeners,
    render() { cursor = 0; return exported.default(); },
    advance(ms) {
      const until = now + ms;
      while (true) {
        const next = [...timers].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at;
        timers.delete(next[0]);
        next[1].callback();
      }
      now = until;
    },
    resumeAfter(ms) { now += ms; for (const listener of listeners) listener('active'); },
    resize() { dimensions = { width: 844, height: 390 }; },
    setFonts(result) { fontResult = result; },
    hidden: () => hidden,
    unmount() { for (const effect of effects) effect?.cleanup?.(); },
    replayEffects() { for (const effect of effects) if (effect) { effect.cleanup?.(); effect.cleanup = effect.setup(); } },
    transition() { return animations.findLast(instance => instance.callback); },
  };
}

const launch = () => { const h = harness('src/app/index.tsx'); h.render(); return h; };

test('normal animation opens onboarding once and clears the watchdog', () => {
  const h = launch();
  h.advance(2450);
  h.transition().complete();
  h.advance(10000);
  assert.deepEqual(h.routes, ['/onboarding']);
  assert.equal(h.timers.size, 0);
});

test('missing native completion callback cannot hold the splash', () => {
  const h = launch();
  h.advance(4000);
  assert.deepEqual(h.routes, ['/onboarding']);
  h.transition().complete();
  assert.equal(h.routes.length, 1);
});

test('an interrupted exit still opens onboarding', () => {
  const h = launch();
  h.advance(2450);
  h.transition().complete(false);
  assert.deepEqual(h.routes, ['/onboarding']);
});

test('resizing does not restart the splash deadline', () => {
  const h = launch();
  h.advance(2000);
  h.resize();
  h.render();
  h.advance(2000);
  assert.deepEqual(h.routes, ['/onboarding']);
});

test('resuming after paused timers exits immediately without duplicate navigation', () => {
  const h = launch();
  h.resumeAfter(10000);
  h.resumeAfter(1000);
  h.advance(10000);
  assert.deepEqual(h.routes, ['/onboarding']);
});

test('unmount cancels timers, animations, and background listeners', () => {
  const h = launch();
  h.advance(2450);
  const transition = h.transition();
  h.unmount();
  transition.complete();
  h.advance(10000);
  assert.deepEqual(h.routes, []);
  assert.equal(h.timers.size, 0);
  assert.equal(h.listeners.size, 0);
  assert.equal(transition.stopped, true);
});

test('Strict Mode effect replay leaves only one live splash flow', () => {
  const h = launch();
  h.replayEffects();
  h.advance(4000);
  assert.deepEqual(h.routes, ['/onboarding']);
});

test('font failure renders the app immediately', () => {
  const h = harness('src/app/_layout.tsx');
  h.setFonts([false, new Error('font failed')]);
  const view = h.render();
  assert.ok(view);
  view.props.onLayout();
  assert.equal(h.hidden(), 1);
  assert.equal(h.timers.size, 0);
});

test('stalled font loading does not block startup or hydration markup', () => {
  const h = harness('src/app/_layout.tsx');
  h.setFonts([false, null]);
  assert.ok(h.render());
  assert.equal(h.timers.size, 0);
  h.advance(2000);
  assert.ok(h.render());
});

test('font loading completion keeps the app rendered without startup timers', () => {
  const h = harness('src/app/_layout.tsx');
  h.setFonts([false, null]);
  h.render();
  h.setFonts([true, null]);
  assert.ok(h.render());
  assert.equal(h.timers.size, 0);
});
