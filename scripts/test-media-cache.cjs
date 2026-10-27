const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { test } = require('node:test');

function fixture({ fail = false, status = 200, expectedBytes = 10, pause } = {}) {
  const files = new Map();
  let downloads = 0;
  const storage = new Map();
  const fileSystem = {
    cacheDirectory: 'file:///cache/',
    documentDirectory: 'file:///documents/',
    makeDirectoryAsync: async () => {},
    getInfoAsync: async (uri) => files.has(uri)
      ? { exists: true, isDirectory: false, size: files.get(uri).length }
      : { exists: false },
    readAsStringAsync: async (uri) => { if (!files.has(uri)) throw new Error('missing'); return files.get(uri); },
    writeAsStringAsync: async (uri, value) => { files.set(uri, value); },
    deleteAsync: async (uri) => { files.delete(uri); },
    moveAsync: async ({ from, to }) => { files.set(to, files.get(from)); files.delete(from); },
    downloadAsync: async (_, uri) => {
      downloads += 1;
      files.set(uri, '1234567890');
      if (pause) await pause;
      if (fail) throw new Error('connection interrupted');
      return { uri, status, headers: { 'content-length': String(expectedBytes) } };
    },
  };
  const compiled = ts.transpileModule(fs.readFileSync(require.resolve('../src/utils/mediaCache.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports,
    require: (name) => {
      if (name === 'expo-file-system/legacy') return fileSystem;
      if (name === '../services/api') return { API_BASE: 'https://backend.example/api' };
      if (name === '@react-native-async-storage/async-storage') return {
        getItem: async (key) => storage.get(key) ?? null,
        setItem: async (key, value) => { storage.set(key, value); },
      };
      throw new Error(name);
    },
  });
  return { files, downloads: () => downloads, ...module.exports };
}
const url = 'https://media.example/video.mp4';

test('interrupted downloads cannot become playable cached files', async () => {
  const f = fixture({ fail: true });
  assert.equal(await f.cacheMediaInBackground(url), null);
  assert.equal(await f.getCachedMediaUri(url), null);
  assert.equal(f.files.size, 0);
});

test('HTTP errors and truncated responses cannot become cached lessons', async () => {
  for (const options of [{ status: 404 }, { expectedBytes: 100 }]) {
    const f = fixture(options);
    assert.equal(await f.cacheMediaInBackground(url), null);
    assert.equal(await f.getCachedMediaUri(url), null);
    assert.equal(f.files.size, 0);
  }
});

test('concurrent consumers share one completed download', async () => {
  const f = fixture();
  const [first, second] = await Promise.all([f.cacheMediaInBackground(url), f.cacheMediaInBackground(url)]);
  assert.ok(first?.endsWith('.mp4'));
  assert.equal(first, second);
  assert.equal(f.downloads(), 1);
  assert.equal(await f.getCachedMediaUri(url), first);
  await f.cacheMediaInBackground(url);
  assert.equal(f.downloads(), 1);
});

test('unverified legacy cache files are not reused', async () => {
  const f = fixture();
  const uri = await f.cacheMediaInBackground(url);
  f.files.delete(uri + '.complete');
  assert.equal(await f.getCachedMediaUri(url), null);
});

test('registered offline downloads remain available without a temporary-cache marker', async () => {
  const f = fixture();
  const uri = 'file:///documents/downloaded.mp4';
  f.files.set(uri, 'complete offline video');
  await f.registerOfflineMedia(url, uri);
  assert.equal(await f.getCachedMediaUri(url), uri);
  assert.equal(f.downloads(), 0);
});

test('a second screen cannot open a file while it is still downloading', async () => {
  let resume;
  const pause = new Promise((resolve) => { resume = resolve; });
  const f = fixture({ pause });
  const download = f.cacheMediaInBackground(url);
  await new Promise(setImmediate);
  assert.equal(await f.getCachedMediaUri(url), null);
  resume();
  const uri = await download;
  assert.equal(await f.getCachedMediaUri(url), uri);
});
