const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');
const fs = require('fs');

const isVercel = Boolean(process.env.VERCEL);
const mongoUri = String(process.env.MONGODB_URI || process.env.COSMOS_MONGO_URI || '').trim();
const mongoDbName = String(process.env.MONGODB_DB_NAME || process.env.COSMOS_MONGO_DB_NAME || 'whitleos').trim();
const mongoCollectionName = String(process.env.MONGODB_COLLECTION || process.env.COSMOS_MONGO_COLLECTION || 'appState').trim();
const mongoStateDocId = String(process.env.MONGODB_STATE_DOC_ID || process.env.COSMOS_MONGO_STATE_DOC_ID || 'whitleos-state-v1').trim();
const hasMongoCredentials = Boolean(mongoUri);
const kvRestUrl = process.env.KV_REST_API_URL ? String(process.env.KV_REST_API_URL).replace(/\/+$/, '') : '';
const kvRestToken = process.env.KV_REST_API_TOKEN ? String(process.env.KV_REST_API_TOKEN).trim() : '';
const hasKvCredentials = Boolean(kvRestUrl && kvRestToken);
const kvDataKey = process.env.KV_DATA_KEY || 'whitleos:db:v1';

let MongoClient = null;
if (hasMongoCredentials) {
  try {
    ({ MongoClient } = require('mongodb'));
  } catch (_err) {
    console.error('[db] MONGODB_URI is set but mongodb package is not installed. Run: npm install mongodb');
  }
}
const hasMongoConnection = Boolean(hasMongoCredentials && MongoClient);

const initialData = {
  journal: [],
  steps: [],
  meals: [],
  workouts: [],
  healthData: [],
  webhooks: [],
  connections: [],
  users: [],
  analytics: { loginsByDate: {} },
};

function normalizeData(data) {
  const source = data && typeof data === 'object' ? data : {};
  return {
    journal: Array.isArray(source.journal) ? source.journal : [],
    steps: Array.isArray(source.steps) ? source.steps : [],
    meals: Array.isArray(source.meals) ? source.meals : [],
    workouts: Array.isArray(source.workouts) ? source.workouts : [],
    healthData: Array.isArray(source.healthData) ? source.healthData : [],
    webhooks: Array.isArray(source.webhooks) ? source.webhooks : [],
    connections: Array.isArray(source.connections) ? source.connections : [],
    users: Array.isArray(source.users) ? source.users : [],
    analytics:
      source.analytics && typeof source.analytics === 'object'
        ? {
            ...source.analytics,
            loginsByDate:
              source.analytics.loginsByDate && typeof source.analytics.loginsByDate === 'object'
                ? source.analytics.loginsByDate
                : {},
          }
        : { loginsByDate: {} },
  };
}

const localFile = process.env.LOWDB_FILE || (isVercel ? '/tmp/whitleos-db.json' : path.join(__dirname, 'db.json'));
if (!fs.existsSync(localFile)) {
  fs.writeFileSync(localFile, JSON.stringify(initialData, null, 2));
}
const adapter = new JSONFile(localFile);
const localDb = new Low(adapter, initialData);
let mongoClientPromise = null;

async function getMongoCollection() {
  if (!hasMongoConnection) return null;

  if (!mongoClientPromise) {
    const maxPoolSize = Math.min(100, Math.max(1, Number(process.env.MONGODB_MAX_POOL_SIZE) || 10));
    mongoClientPromise = (async () => {
      const client = new MongoClient(mongoUri, {
        maxPoolSize,
        retryWrites: true,
      });
      await client.connect();
      return client;
    })().catch((err) => {
      mongoClientPromise = null;
      throw err;
    });
  }

  const client = await mongoClientPromise;
  return client.db(mongoDbName).collection(mongoCollectionName);
}

async function readFromMongo() {
  const collection = await getMongoCollection();
  if (!collection) return initialData;

  const doc = await collection.findOne({ _id: mongoStateDocId });
  if (!doc || !doc.state || typeof doc.state !== 'object') return initialData;
  return doc.state;
}

async function writeToMongo(data) {
  const collection = await getMongoCollection();
  if (!collection) return;

  await collection.updateOne(
    { _id: mongoStateDocId },
    {
      $set: {
        state: data,
        updatedAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  );
}

async function runKvCommand(command) {
  try {
    const response = await fetch(kvRestUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${kvRestToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`KV command failed (${response.status}): ${message}`);
    }
    const body = await response.json();
    if (body.error) {
      throw new Error(body.error);
    }
    return body.result;
  } catch (err) {
    const op = String(command[0] || '').toUpperCase();
    if (op !== 'GET' && op !== 'SET') {
      throw err;
    }

    const key = encodeURIComponent(String(command[1] || ''));
    const tail = op === 'SET' ? `/${encodeURIComponent(String(command[2] || ''))}` : '';
    const fallbackUrl = `${kvRestUrl.toString().replace(/\/+$/, '')}/${op.toLowerCase()}/${key}${tail}`;
    const response = await fetch(fallbackUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${kvRestToken}` },
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`KV fallback failed (${response.status}): ${message}`);
    }
    const body = await response.json();
    if (body.error) {
      throw new Error(body.error);
    }
    return body.result;
  }
}

async function readFromKv() {
  const payload = await runKvCommand(['GET', kvDataKey]);
  if (!payload) return initialData;
  const decoded = Buffer.from(String(payload), 'base64').toString('utf8');
  return JSON.parse(decoded);
}

async function writeToKv(data) {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64');
  await runKvCommand(['SET', kvDataKey, payload]);
}

class HybridDb {
  constructor() {
    this.data = normalizeData(initialData);
    this.storage = 'lowdb';
  }

  async read() {
    if (hasMongoConnection) {
      try {
        const remoteData = await readFromMongo();
        this.data = normalizeData(remoteData || initialData);
        this.storage = 'mongo';
        return;
      } catch (err) {
        console.error('[db] failed reading from MongoDB/Cosmos, trying fallback', err.message || err);
      }
    }

    if (hasKvCredentials) {
      try {
        const remoteData = await readFromKv();
        this.data = normalizeData(remoteData || initialData);
        this.storage = 'kv';
        return;
      } catch (err) {
        console.error('[db] failed reading from Vercel KV, falling back to local file', err.message || err);
      }
    }

    await localDb.read();
    this.data = normalizeData(localDb.data || initialData);
    this.storage = 'lowdb';
  }

  async write() {
    if (hasMongoConnection) {
      try {
        await writeToMongo(this.data);
        this.storage = 'mongo';
        return;
      } catch (err) {
        console.error('[db] failed writing to MongoDB/Cosmos, trying fallback', err.message || err);
      }
    }

    if (hasKvCredentials) {
      try {
        await writeToKv(this.data);
        this.storage = 'kv';
        return;
      } catch (err) {
        console.error('[db] failed writing to Vercel KV, falling back to local file', err.message || err);
      }
    }

    localDb.data = this.data;
    await localDb.write();
    this.storage = 'lowdb';
  }
}

const db = new HybridDb();
const hasPersistentStorage = Boolean(hasMongoConnection || hasKvCredentials);

function getPreferredStorage() {
  if (hasMongoConnection) return 'mongo';
  if (hasKvCredentials) return 'kv';
  return 'lowdb';
}

module.exports = { db, hasKvCredentials, hasMongoConnection, hasPersistentStorage, getPreferredStorage };
