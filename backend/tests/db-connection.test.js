const test = require('node:test');
const assert = require('node:assert/strict');

process.env.MONGO_URI = '';
const db = require('../config/db');

test('db helper reports disconnected state when no Mongo URI is configured', () => {
  assert.equal(typeof db.isDbConnected, 'function');
  assert.equal(db.isDbConnected(), false);
});

test('db helper throws a clear error when database is unavailable', async () => {
  await assert.rejects(
    () => db.ensureDbConnection(),
    /Database is not configured|Database unavailable/
  );
});
