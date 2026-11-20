const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

process.env.MONGODB_URI ||= 'memory';
process.env.JWT_SECRET ||= 'integration-test-secret-with-enough-length';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.GOOGLE_CLIENT_ID ||= 'integration-client-id';
process.env.GOOGLE_CLIENT_SECRET ||= 'integration-client-secret';
process.env.CLIENT_URL ||= 'http://localhost:5173';

const User = require('../src/models/User');
const Connection = require('../src/models/Connection');
const ConnectionCode = require('../src/models/ConnectionCode');
const Task = require('../src/models/Task');
const RefreshToken = require('../src/models/RefreshToken');
const connectionService = require('../src/services/connection.service');
const authService = require('../src/services/auth.service');
const env = require('../src/config/env');
const jwt = require('jsonwebtoken');
const { signToken } = require('../src/utils/jwt');
const { io: createSocketClient } = require('socket.io-client');

let replicaSet;
let socketServer;
let apiOrigin;
let sequence = 0;

async function makeUser(name) {
  sequence += 1;
  return User.create({
    googleId: `integration-google-${sequence}`,
    name,
    email: `integration-${sequence}@example.test`,
    avatar: `https://example.test/${sequence}.png`,
  });
}

before(async () => {
  replicaSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replicaSet.getUri('dot_connection_test'));
  await Promise.all([User.init(), Connection.init(), ConnectionCode.init(), Task.init(), RefreshToken.init()]);
  const app = require('../src/app');
  const { attachSocketServer } = require('../src/config/socket');
  const httpServer = http.createServer(app);
  socketServer = attachSocketServer(httpServer);
  await new Promise((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
  apiOrigin = `http://127.0.0.1:${httpServer.address().port}`;
});

after(async () => {
  await new Promise((resolve) => socketServer?.close(resolve));
  await mongoose.disconnect();
  await replicaSet?.stop();
});

test('two Google accounts can connect once with a 10-minute code', async () => {
  const alice = await makeUser('Alice Example');
  const bob = await makeUser('Bob Example');
  const charlie = await makeUser('Charlie Example');

  const generated = await connectionService.generateCode(alice._id);
  const bobCode = await connectionService.generateCode(bob._id);
  assert.match(generated.code, /^[A-HJ-NP-Z2-9]{6}$/);
  assert.ok(generated.expiresAt.getTime() - Date.now() <= 10 * 60 * 1000);
  assert.equal((await connectionService.getStatus(alice._id)).status, 'waiting');
  assert.deepEqual(await connectionService.generateCode(alice._id), generated);

  const bobStatus = await connectionService.connectWithCode(bob._id, generated.code.toLowerCase());
  assert.equal(bobStatus.status, 'connected');
  assert.equal(bobStatus.partner.email, alice.email);
  assert.equal(bobStatus.partner.avatar, alice.avatar);

  const aliceStatus = await connectionService.getStatus(alice._id);
  assert.equal(aliceStatus.status, 'connected');
  assert.equal(aliceStatus.partner.email, bob.email);
  await assert.rejects(connectionService.connectWithCode(charlie._id, bobCode.code), /invalid, expired, or already used/);
  await assert.rejects(connectionService.connectWithCode(bob._id, generated.code), /invalid, expired, or already used/);
  await assert.rejects(connectionService.connectWithCode(alice._id, generated.code), /invalid, expired, or already used/);
});

test('one code cannot connect two different accounts concurrently', async () => {
  const owner = await makeUser('Casey Owner');
  const first = await makeUser('Drew First');
  const second = await makeUser('Evan Second');
  const { code } = await connectionService.generateCode(owner._id);

  const attempts = await Promise.allSettled([
    connectionService.connectWithCode(first._id, code),
    connectionService.connectWithCode(second._id, code),
  ]);
  assert.equal(attempts.filter((attempt) => attempt.status === 'fulfilled').length, 1);

  const ownerStatus = await connectionService.getStatus(owner._id);
  assert.equal(ownerStatus.status, 'connected');
  const [firstStatus, secondStatus] = await Promise.all([
    connectionService.getStatus(first._id),
    connectionService.getStatus(second._id),
  ]);
  assert.notEqual(firstStatus.status, secondStatus.status);
  assert.equal([firstStatus, secondStatus].filter((value) => value.status === 'connected').length, 1);
});

test('a user cannot win concurrent connection attempts from two different people', async () => {
  const firstOwner = await makeUser('Ira First Owner');
  const secondOwner = await makeUser('Jules Second Owner');
  const sharedUser = await makeUser('Kai Shared User');
  const firstCode = await connectionService.generateCode(firstOwner._id);
  const secondCode = await connectionService.generateCode(secondOwner._id);

  const attempts = await Promise.allSettled([
    connectionService.connectWithCode(sharedUser._id, firstCode.code),
    connectionService.connectWithCode(sharedUser._id, secondCode.code),
  ]);
  assert.equal(attempts.filter((attempt) => attempt.status === 'fulfilled').length, 1);

  const sharedStatus = await connectionService.getStatus(sharedUser._id);
  assert.equal(sharedStatus.status, 'connected');
  const otherOwner = sharedStatus.partner.email === firstOwner.email ? secondOwner : firstOwner;
  assert.notEqual((await connectionService.getStatus(otherOwner._id)).status, 'connected');
});

test('users cannot connect to themselves or attach to a second account', async () => {
  const owner = await makeUser('Frank Owner');
  const partner = await makeUser('Gray Partner');
  const anotherPerson = await makeUser('Harper Another');

  const ownCode = await connectionService.generateCode(owner._id);
  await assert.rejects(connectionService.connectWithCode(owner._id, ownCode.code), /own code/);

  await connectionService.connectWithCode(partner._id, ownCode.code);
  const anotherCode = await connectionService.generateCode(anotherPerson._id);
  await assert.rejects(connectionService.connectWithCode(partner._id, anotherCode.code), /already connected/);
});

test('expired codes cannot be used and the owner can get a fresh code', async () => {
  const owner = await makeUser('Lane Expired Code');
  const guest = await makeUser('Milan Expired Guest');
  const expiredCode = await ConnectionCode.create({
    ownerId: owner._id,
    code: 'ZZZZZ9',
    expiresAt: new Date(Date.now() - 1000),
  });

  await assert.rejects(connectionService.connectWithCode(guest._id, expiredCode.code), /invalid, expired, or already used/);
  const fresh = await connectionService.generateCode(owner._id);
  assert.notEqual(fresh.code, expiredCode.code);
  assert.ok(fresh.expiresAt.getTime() > Date.now());
});

test('refresh tokens are hashed, rotate once, and preserve a fixed 20-day expiration', async () => {
  const beforeLogin = Date.now();
  const session = await authService.loginWithGoogle({
    googleId: 'refresh-test-google',
    email: 'refresh-test@example.test',
    name: 'Refresh Test User',
    avatar: '',
  });
  const initialHash = authService.hashRefreshToken(session.refreshToken);
  const originalRecord = await RefreshToken.findOne({ tokenHash: initialHash }).select('+tokenHash');

  assert.ok(originalRecord);
  assert.notEqual(originalRecord.tokenHash, session.refreshToken);
  assert.ok(Math.abs(originalRecord.expiresAt.getTime() - (beforeLogin + 20 * 24 * 60 * 60 * 1000)) < 2000);
  assert.equal(jwt.decode(session.accessToken).type, 'access');
  assert.ok(jwt.decode(session.accessToken).exp * 1000 <= Date.now() + 15 * 60 * 1000);

  const rotated = await authService.refreshSession(session.refreshToken);
  assert.notEqual(rotated.refreshToken, session.refreshToken);
  assert.equal(rotated.refreshTokenExpiresAt.getTime(), originalRecord.expiresAt.getTime());
  assert.ok((await RefreshToken.findById(originalRecord._id)).revokedAt);
  assert.ok(await RefreshToken.findOne({ tokenHash: authService.hashRefreshToken(rotated.refreshToken), revokedAt: null }));

  await assert.rejects(authService.refreshSession(session.refreshToken), /reuse detected/);
  assert.equal(await RefreshToken.countDocuments({ familyId: originalRecord.familyId, revokedAt: null }), 0);
});

test('parallel refresh-token reuse revokes the entire session family', async () => {
  const session = await authService.loginWithGoogle({
    googleId: 'parallel-refresh-google',
    email: 'parallel-refresh@example.test',
    name: 'Parallel Refresh User',
    avatar: '',
  });
  const record = await RefreshToken.findOne({ tokenHash: authService.hashRefreshToken(session.refreshToken) });
  const outcomes = await Promise.allSettled([
    authService.refreshSession(session.refreshToken),
    authService.refreshSession(session.refreshToken),
  ]);

  assert.equal(outcomes.filter((outcome) => outcome.status === 'fulfilled').length, 1);
  assert.equal(await RefreshToken.countDocuments({ familyId: record.familyId, revokedAt: null }), 0);
});

test('logout revokes the refresh-token family and refresh/logout routes enforce Origin', async () => {
  const session = await authService.loginWithGoogle({
    googleId: 'refresh-cookie-google',
    email: 'refresh-cookie@example.test',
    name: 'Refresh Cookie User',
    avatar: '',
  });
  const originalHash = authService.hashRefreshToken(session.refreshToken);
  const invalidOrigin = await fetch(`${apiOrigin}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      Origin: 'https://attacker.example',
      Cookie: `dot_refresh_session=${session.refreshToken}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
  assert.equal(invalidOrigin.status, 403);
  assert.equal((await RefreshToken.findOne({ tokenHash: originalHash }).select('+tokenHash')).revokedAt, null);

  const expiredAccessToken = jwt.sign(
    { sub: session.user.id.toString(), type: 'access', sessionExp: Math.floor(Date.now() / 1000) + 20 * 24 * 60 * 60 },
    env.jwtSecret,
    { expiresIn: -1 }
  );
  const expiredProfileResponse = await fetch(`${apiOrigin}/api/auth/me`, {
    headers: { Authorization: `Bearer ${expiredAccessToken}` },
  });
  assert.equal(expiredProfileResponse.status, 401);

  const expiredSessionAccessToken = jwt.sign(
    { sub: session.user.id.toString(), type: 'access', sessionExp: Math.floor(Date.now() / 1000) - 1 },
    env.jwtSecret,
    { expiresIn: '15m' }
  );
  const expiredSessionResponse = await fetch(`${apiOrigin}/api/auth/me`, {
    headers: { Authorization: `Bearer ${expiredSessionAccessToken}` },
  });
  assert.equal(expiredSessionResponse.status, 401);

  const refreshResponse = await fetch(`${apiOrigin}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      Origin: env.clientUrl,
      Cookie: `dot_refresh_session=${session.refreshToken}`,
      'Content-Type': 'application/json',
      'X-Dot-CSRF': '1',
    },
    body: '{}',
  });
  assert.equal(refreshResponse.status, 200);
  const refreshed = await refreshResponse.json();
  assert.ok(refreshed.data.accessToken);
  assert.equal(Object.hasOwn(refreshed.data, 'refreshToken'), false);
  const cookie = refreshResponse.headers.getSetCookie()[0];
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /SameSite=/i);
  assert.match(cookie, /Path=\/api\/auth/i);
  if (env.isProd) assert.match(cookie, /Secure/i);
  const nextToken = cookie.match(/dot_refresh_session=([^;]+)/)?.[1];
  assert.ok(nextToken);

  const restoredProfileResponse = await fetch(`${apiOrigin}/api/auth/me`, {
    headers: { Authorization: `Bearer ${refreshed.data.accessToken}` },
  });
  assert.equal(restoredProfileResponse.status, 200);
  assert.equal((await restoredProfileResponse.json()).data.email, 'refresh-cookie@example.test');

  const logoutResponse = await fetch(`${apiOrigin}/api/auth/logout`, {
    method: 'POST',
    headers: {
      Origin: env.clientUrl,
      Cookie: `dot_refresh_session=${nextToken}`,
      'Content-Type': 'application/json',
      'X-Dot-CSRF': '1',
    },
    body: '{}',
  });
  assert.equal(logoutResponse.status, 204);
  assert.match(logoutResponse.headers.getSetCookie()[0], /Expires=/i);
  const storedRotated = await RefreshToken.findOne({ tokenHash: authService.hashRefreshToken(nextToken) });
  assert.ok(storedRotated.revokedAt);
});

test('authenticated API and Socket.IO update the waiting account in realtime', async () => {
  const alice = await makeUser('Morgan Socket Owner');
  const bob = await makeUser('Nico Socket Guest');
  const aliceToken = signToken({ sub: alice._id.toString() });
  const bobToken = signToken({ sub: bob._id.toString() });
  const aliceSocket = createSocketClient(apiOrigin, { auth: { token: aliceToken }, transports: ['websocket'] });

  try {
    await new Promise((resolve, reject) => {
      aliceSocket.once('connect', resolve);
      aliceSocket.once('connect_error', reject);
    });

    const codeResponse = await fetch(`${apiOrigin}/api/connections/code`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    assert.equal(codeResponse.status, 200);
    const { data: codeData } = await codeResponse.json();

    const realtimeUpdate = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Realtime update was not received')), 3000);
      aliceSocket.once('connection:updated', (value) => {
        clearTimeout(timeout);
        resolve(value);
      });
    });

    const connectResponse = await fetch(`${apiOrigin}/api/connections/connect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bobToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: codeData.code }),
    });
    assert.equal(connectResponse.status, 200);
    const connectPayload = await connectResponse.json();
    assert.equal(connectPayload.data.partner.email, alice.email);
    assert.deepEqual(await realtimeUpdate, { status: 'connected' });

    const loginResponse = await fetch(`${apiOrigin}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-google@example.test', password: 'password' }),
    });
    assert.equal(loginResponse.status, 404);

    for (let attempt = 0; attempt < 9; attempt += 1) {
      const response = await fetch(`${apiOrigin}/api/connections/connect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${bobToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'AAAAAA' }),
      });
      assert.equal(response.status, 400);
    }
    const limitedResponse = await fetch(`${apiOrigin}/api/connections/connect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bobToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'AAAAAA' }),
    });
    assert.equal(limitedResponse.status, 429);

    const aliceStatusResponse = await fetch(`${apiOrigin}/api/connections/me`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const aliceStatus = await aliceStatusResponse.json();
    assert.equal(aliceStatus.data.status, 'connected');
    assert.equal(aliceStatus.data.partner.email, bob.email);

    const taskDate = '2030-11-20';
    const taskEvent = () => new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Task change was not received in realtime')), 3000);
      aliceSocket.once('tasks:updated', (event) => {
        clearTimeout(timeout);
        resolve(event);
      });
    });
    const createEvent = taskEvent();
    const createTaskResponse = await fetch(`${apiOrigin}/api/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bobToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskDate, title: 'Plan dinner', description: 'Pick a recipe', priority: 'High' }),
    });
    assert.equal(createTaskResponse.status, 201);
    const createdTask = (await createTaskResponse.json()).data;
    assert.equal(createdTask.creator.name, bob.name);
    assert.equal((await createEvent).action, 'created');

    const partnerTasksResponse = await fetch(`${apiOrigin}/api/tasks?date=${taskDate}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const partnerTasks = await partnerTasksResponse.json();
    assert.equal(partnerTasks.data.tasks.length, 1);
    assert.equal(partnerTasks.data.tasks[0].title, 'Plan dinner');

    const deniedEdit = await fetch(`${apiOrigin}/api/tasks/${createdTask._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${aliceToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' }),
    });
    assert.equal(deniedEdit.status, 404);

    const updateEvent = taskEvent();
    const updateTaskResponse = await fetch(`${apiOrigin}/api/tasks/${createdTask._id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${bobToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Completed' }),
    });
    assert.equal(updateTaskResponse.status, 200);
    assert.equal((await updateEvent).action, 'updated');

    const updatedTasksResponse = await fetch(`${apiOrigin}/api/tasks?date=${taskDate}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    const updatedTasks = (await updatedTasksResponse.json()).data.tasks;
    assert.equal(updatedTasks[0].status, 'Completed');
    assert.ok(updatedTasks[0].completedAt);

    const otherDateResponse = await fetch(`${apiOrigin}/api/tasks?date=2030-11-19`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    });
    assert.equal((await otherDateResponse.json()).data.tasks.length, 0);

    const deleteEvent = taskEvent();
    const deleteTaskResponse = await fetch(`${apiOrigin}/api/tasks/${createdTask._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${bobToken}` },
    });
    assert.equal(deleteTaskResponse.status, 200);
    assert.equal((await deleteEvent).action, 'deleted');

    const outsider = await makeUser('Unauthenticated Partner');
    const outsiderToken = signToken({ sub: outsider._id.toString() });
    const unconnectedTasks = await fetch(`${apiOrigin}/api/tasks?date=${taskDate}`, {
      headers: { Authorization: `Bearer ${outsiderToken}` },
    });
    assert.equal(unconnectedTasks.status, 403);
  } finally {
    aliceSocket.disconnect();
  }
});
