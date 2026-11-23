const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const envModule = path.join(__dirname, '../src/config/env.js');

function loadConfig(overrides = {}) {
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    MONGODB_URI: 'mongodb://localhost/dot',
    JWT_SECRET: 'configuration-test-secret',
    GOOGLE_CLIENT_ID: 'configuration-test-client',
    GOOGLE_CLIENT_SECRET: 'configuration-test-secret',
    CLIENT_URL: 'https://frontend.example/',
    GOOGLE_CALLBACK_URL: 'https://api.example/api/auth/google/callback',
    ...overrides,
  };
  const script = `const config = require(${JSON.stringify(envModule)}); process.stdout.write(JSON.stringify({ clientUrl: config.clientUrl, googleCallbackUrl: config.googleCallbackUrl }));`;
  return execFileSync(process.execPath, ['-e', script], { env, encoding: 'utf8' });
}

test('production origins normalize trailing slashes and keep the callback URL exact', () => {
  assert.deepEqual(JSON.parse(loadConfig()), {
    clientUrl: 'https://frontend.example',
    googleCallbackUrl: 'https://api.example/api/auth/google/callback',
  });
});

test('production requires explicit frontend and Google callback URLs', () => {
  assert.throws(() => loadConfig({ CLIENT_URL: '' }), /CLIENT_URL/);
  assert.throws(() => loadConfig({ GOOGLE_CALLBACK_URL: '' }), /GOOGLE_CALLBACK_URL/);
});

test('production rejects insecure and incorrectly shaped OAuth URLs', () => {
  assert.throws(
    () => loadConfig({ CLIENT_URL: 'http://frontend.example' }),
    /CLIENT_URL must use HTTPS/,
  );
  assert.throws(
    () => loadConfig({ GOOGLE_CALLBACK_URL: 'https://api.example/wrong-path' }),
    /must use \/api\/auth\/google\/callback/,
  );
  assert.throws(
    () => loadConfig({ GOOGLE_CALLBACK_URL: 'https://frontend.example/api/auth/google/callback' }),
    /must use the backend origin/,
  );
});
