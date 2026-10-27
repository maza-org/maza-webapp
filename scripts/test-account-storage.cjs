const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { test } = require('node:test');

function fixture() {
  const values = new Map();
  let token = 'token-a';
  const sent = [];
  const storage = {
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => { values.set(key, value); },
  };
  const account = (id, nextToken) => {
    values.set('maza_user', JSON.stringify({ id }));
    token = nextToken;
  };
  const output = ts.transpileModule(fs.readFileSync(require.resolve('../src/services/offlineQueue.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, {
    exports: module.exports,
    module,
    require: (name) => {
      if (name === '@react-native-async-storage/async-storage') return storage;
      if (name === './secure-storage') return { getStoredAuthToken: async () => token };
      if (name === './api') return { API_BASE: 'https://example.invalid/api' };
      if (name === 'axios') return { request: async (request) => { sent.push(request); } };
      throw new Error(name);
    },
  });
  account('a', 'token-a');
  return { values, sent, account, ...module.exports };
}

test('pending work is never submitted through another account', async () => {
  const f = fixture();
  await f.queueOfflineRequest({ method: 'post', url: '/quizzes/a/submit', data: { answers: ['a'] } });
  f.account('b', 'token-b');
  assert.equal((await f.flushOfflineQueue()).synced, 0);
  assert.equal(f.sent.length, 0);
  f.account('a', 'token-a');
  assert.equal((await f.flushOfflineQueue()).synced, 1);
  assert.equal(f.sent[0].headers.Authorization, 'Bearer token-a');
});

test('concurrent additions and flush do not erase learner actions', async () => {
  const f = fixture();
  await Promise.all(Array.from({ length: 12 }, (_, index) =>
    f.queueOfflineRequest({ method: 'post', url: `/lessons/${index}/complete` })));
  await Promise.all([
    f.flushOfflineQueue(),
    f.queueOfflineRequest({ method: 'post', url: '/lessons/last/complete' }),
  ]);
  await f.flushOfflineQueue();
  assert.equal(f.sent.length, 13);
  assert.equal(new Set(f.sent.map((request) => request.url)).size, 13);
});

test('ownerless legacy actions are retained but cannot be sent as a new user', async () => {
  const f = fixture();
  f.values.set('maza_offline_request_queue', JSON.stringify([{ method: 'post', url: '/legacy' }]));
  await f.flushOfflineQueue();
  assert.equal(f.sent.length, 0);
  assert.ok(f.values.has('maza_offline_request_queue'));
});

test('corrupt account queues fail visibly rather than overwriting pending data', async () => {
  const f = fixture();
  f.values.set('maza_offline_request_queue:a', '{broken');
  await assert.rejects(f.queueOfflineRequest({ method: 'post', url: '/new' }));
  assert.equal(f.values.get('maza_offline_request_queue:a'), '{broken');
});

test('external URLs cannot receive the account bearer token', async () => {
  const f = fixture();
  for (const url of ['https://example.invalid/steal', '//example.invalid/steal', '/\\example.invalid/steal']) {
    await assert.rejects(f.queueOfflineRequest({ method: 'post', url }));
  }
  f.values.set('maza_offline_request_queue:a', JSON.stringify([{ method: 'post', url: 'https://example.invalid/steal' }]));
  assert.equal((await f.flushOfflineQueue()).remaining, 1);
  assert.equal(f.sent.length, 0);
});
