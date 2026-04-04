import "server-only";

import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

import { connectToDatabase, hasMongoConfigured } from "@/lib/db";
import { normalizeEmail } from "@/lib/utils";
import ContactSubmission from "@/models/ContactSubmission";
import JournalEntry from "@/models/JournalEntry";
import Location from "@/models/Location";
import Meal from "@/models/Meal";
import StepEntry from "@/models/StepEntry";
import User from "@/models/User";
import Waitlist from "@/models/Waitlist";
import Workout from "@/models/Workout";

const LOCAL_DB_FILE = path.join(process.cwd(), "server", "db.json");

const initialState = {
  users: [],
  waitlist: [],
  locations: [],
  meals: [],
  workouts: [],
  steps: [],
  journal: [],
  contacts: [],
};

if (!global.whitelooLocalWriteQueue) {
  global.whitelooLocalWriteQueue = Promise.resolve();
}

function normalizeState(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    users: Array.isArray(source.users) ? source.users : [],
    waitlist: Array.isArray(source.waitlist) ? source.waitlist : [],
    locations: Array.isArray(source.locations) ? source.locations : [],
    meals: Array.isArray(source.meals) ? source.meals : [],
    workouts: Array.isArray(source.workouts) ? source.workouts : [],
    steps: Array.isArray(source.steps) ? source.steps : [],
    journal: Array.isArray(source.journal) ? source.journal : [],
    contacts: Array.isArray(source.contacts) ? source.contacts : [],
  };
}

function withTimestamps(record, existing) {
  const now = new Date().toISOString();
  return {
    ...record,
    createdAt: existing?.createdAt || record.createdAt || now,
    updatedAt: now,
  };
}

function sortByRecent(items, primary = "createdAt") {
  return [...items].sort((a, b) => {
    const aTime = new Date(a[primary] || a.createdAt || 0).getTime();
    const bTime = new Date(b[primary] || b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

async function ensureLocalDbFile() {
  await fs.mkdir(path.dirname(LOCAL_DB_FILE), { recursive: true });
  try {
    await fs.access(LOCAL_DB_FILE);
  } catch {
    await fs.writeFile(LOCAL_DB_FILE, JSON.stringify(initialState, null, 2), "utf8");
  }
}

async function readLocalState() {
  await ensureLocalDbFile();
  const raw = await fs.readFile(LOCAL_DB_FILE, "utf8");
  return normalizeState(raw ? JSON.parse(raw) : initialState);
}

async function writeLocalState(state) {
  await fs.writeFile(LOCAL_DB_FILE, JSON.stringify(state, null, 2), "utf8");
}

async function mutateLocalState(mutator) {
  const run = async () => {
    const state = await readLocalState();
    const result = await mutator(state);
    await writeLocalState(state);
    return result;
  };

  const next = global.whitelooLocalWriteQueue.then(run, run);
  global.whitelooLocalWriteQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

function storageMode() {
  return hasMongoConfigured() ? "mongo" : "local";
}

export function getStorageMode() {
  return storageMode();
}

export async function getUserById(id) {
  if (storageMode() === "mongo") {
    await connectToDatabase();
    return User.findById(id).lean();
  }

  const state = await readLocalState();
  return state.users.find((entry) => entry.id === String(id)) || null;
}

export async function getUserByEmail(email) {
  const normalized = normalizeEmail(email);

  if (storageMode() === "mongo") {
    await connectToDatabase();
    return User.findOne({ email: normalized });
  }

  const state = await readLocalState();
  return state.users.find((entry) => normalizeEmail(entry.email) === normalized) || null;
}

export async function createUser(data) {
  if (storageMode() === "mongo") {
    await connectToDatabase();
    return User.create(data);
  }

  return mutateLocalState(async (state) => {
    const created = withTimestamps(
      {
        id: randomUUID(),
        preferences: {},
        subscription: {},
        ...data,
      },
      null
    );
    state.users.unshift(created);
    return created;
  });
}

export async function listUsers() {
  if (storageMode() === "mongo") {
    await connectToDatabase();
    return User.find().sort({ createdAt: -1 }).lean();
  }

  const state = await readLocalState();
  return sortByRecent(state.users);
}

export async function updateUserPreferences(userId, preferences) {
  if (storageMode() === "mongo") {
    await connectToDatabase();
    return User.findByIdAndUpdate(userId, { preferences }, { new: true });
  }

  return mutateLocalState(async (state) => {
    const index = state.users.findIndex((entry) => entry.id === String(userId));
    if (index === -1) return null;
    state.users[index] = withTimestamps(
      {
        ...state.users[index],
        preferences,
      },
      state.users[index]
    );
    return state.users[index];
  });
}

export async function upsertAdminUser({ email, name, passwordHash }) {
  const normalized = normalizeEmail(email);

  if (storageMode() === "mongo") {
    await connectToDatabase();
    const existing = await User.findOne({ email: normalized });
    if (!existing) {
      return User.create({
        name,
        email: normalized,
        password: passwordHash,
        role: "admin",
      });
    }

    existing.name = name;
    existing.email = normalized;
    existing.password = passwordHash;
    existing.role = "admin";
    await existing.save();
    return existing;
  }

  return mutateLocalState(async (state) => {
    const existingIndex = state.users.findIndex(
      (entry) => normalizeEmail(entry.email) === normalized
    );
    const base = existingIndex >= 0 ? state.users[existingIndex] : null;
    const nextUser = withTimestamps(
      {
        id: base?.id || randomUUID(),
        name,
        email: normalized,
        password: passwordHash,
        role: "admin",
        preferences: base?.preferences || {},
        subscription: base?.subscription || {},
      },
      base
    );

    if (existingIndex >= 0) {
      state.users[existingIndex] = nextUser;
    } else {
      state.users.unshift(nextUser);
    }
    return nextUser;
  });
}

export async function listWaitlist() {
  if (storageMode() === "mongo") {
    await connectToDatabase();
    return Waitlist.find().sort({ createdAt: -1 }).lean();
  }

  const state = await readLocalState();
  return sortByRecent(state.waitlist);
}

export async function getWaitlistEntryByEmail(email) {
  const normalized = normalizeEmail(email);

  if (storageMode() === "mongo") {
    await connectToDatabase();
    return Waitlist.findOne({ email: normalized }).lean();
  }

  const state = await readLocalState();
  return state.waitlist.find((entry) => normalizeEmail(entry.email) === normalized) || null;
}

export async function createWaitlistEntry(email) {
  const normalized = normalizeEmail(email);

  if (storageMode() === "mongo") {
    await connectToDatabase();
    return Waitlist.create({ email: normalized });
  }

  return mutateLocalState(async (state) => {
    const entry = withTimestamps(
      {
        id: randomUUID(),
        email: normalized,
      },
      null
    );
    state.waitlist.unshift(entry);
    return entry;
  });
}

export async function listLocations() {
  if (storageMode() === "mongo") {
    await connectToDatabase();
    return Location.find().sort({ createdAt: -1 }).lean();
  }

  const state = await readLocalState();
  return sortByRecent(state.locations);
}

export async function createLocationEntry(data) {
  if (storageMode() === "mongo") {
    await connectToDatabase();
    return Location.create(data);
  }

  return mutateLocalState(async (state) => {
    const entry = withTimestamps(
      {
        id: randomUUID(),
        ...data,
      },
      null
    );
    state.locations.unshift(entry);
    return entry;
  });
}

async function listCollectionByUser({ key, model, userId, primaryField = "date" }) {
  if (storageMode() === "mongo") {
    await connectToDatabase();
    return model.find({ userId }).sort({ [primaryField]: -1, createdAt: -1 }).lean();
  }

  const state = await readLocalState();
  return sortByRecent(
    state[key].filter((entry) => entry.userId === String(userId)),
    primaryField
  );
}

async function createCollectionEntry({ key, model, userId, data }) {
  if (storageMode() === "mongo") {
    await connectToDatabase();
    return model.create({ userId, ...data });
  }

  return mutateLocalState(async (state) => {
    const entry = withTimestamps(
      {
        id: randomUUID(),
        userId: String(userId),
        ...data,
      },
      null
    );
    state[key].unshift(entry);
    return entry;
  });
}

async function deleteCollectionEntry({ key, model, userId, id }) {
  if (storageMode() === "mongo") {
    await connectToDatabase();
    return model.findOneAndDelete({ _id: id, userId });
  }

  return mutateLocalState(async (state) => {
    const index = state[key].findIndex(
      (entry) => entry.id === String(id) && entry.userId === String(userId)
    );
    if (index === -1) return null;
    const [deleted] = state[key].splice(index, 1);
    return deleted;
  });
}

export async function listMealsForUser(userId) {
  return listCollectionByUser({ key: "meals", model: Meal, userId, primaryField: "date" });
}

export async function createMealEntry(userId, data) {
  return createCollectionEntry({ key: "meals", model: Meal, userId, data });
}

export async function deleteMealEntry(userId, id) {
  return deleteCollectionEntry({ key: "meals", model: Meal, userId, id });
}

export async function listWorkoutsForUser(userId) {
  return listCollectionByUser({ key: "workouts", model: Workout, userId, primaryField: "date" });
}

export async function createWorkoutEntry(userId, data) {
  return createCollectionEntry({ key: "workouts", model: Workout, userId, data });
}

export async function deleteWorkoutEntry(userId, id) {
  return deleteCollectionEntry({ key: "workouts", model: Workout, userId, id });
}

export async function listStepsForUser(userId) {
  return listCollectionByUser({ key: "steps", model: StepEntry, userId, primaryField: "date" });
}

export async function createStepEntry(userId, data) {
  return createCollectionEntry({ key: "steps", model: StepEntry, userId, data });
}

export async function deleteStepEntry(userId, id) {
  return deleteCollectionEntry({ key: "steps", model: StepEntry, userId, id });
}

export async function listJournalEntriesForUser(userId) {
  return listCollectionByUser({
    key: "journal",
    model: JournalEntry,
    userId,
    primaryField: "date",
  });
}

export async function createJournalEntryRecord(userId, data) {
  return createCollectionEntry({ key: "journal", model: JournalEntry, userId, data });
}

export async function deleteJournalEntryRecord(userId, id) {
  return deleteCollectionEntry({ key: "journal", model: JournalEntry, userId, id });
}

export async function createContactSubmissionRecord(data) {
  if (storageMode() === "mongo") {
    await connectToDatabase();
    return ContactSubmission.create(data);
  }

  return mutateLocalState(async (state) => {
    const entry = withTimestamps(
      {
        id: randomUUID(),
        ...data,
      },
      null
    );
    state.contacts.unshift(entry);
    return entry;
  });
}
