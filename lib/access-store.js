import fs from "fs";
import path from "path";
import crypto from "crypto";
import { SITE_DIR } from "./legacy-config";

const DATA_DIR = path.join(SITE_DIR, "data");
const STORE_FILE = path.join(DATA_DIR, "access-requests.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(STORE_FILE, "[]\n", "utf8");
  }
}

function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(STORE_FILE, "utf8"));
}

function writeStore(data) {
  ensureStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function generateAccessCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

export function createAccessRequest(payload) {
  const items = readStore();
  const email = normalizeEmail(payload.email);
  const accessCode = payload.accessCode || generateAccessCode();
  const record = {
    id: crypto.randomUUID(),
    accessCode,
    email,
    createdAt: new Date().toISOString(),
    verifiedAt: null,
    ndaSignedAt: null,
    sessionSlug: "mareenoire",
    profile: {
      fullName: payload.fullName || "",
      mobile: payload.mobile || "",
      city: payload.city || "",
      consent: Boolean(payload.consent),
    },
    answers: payload.answers || {},
  };

  items.push(record);
  writeStore(items);
  return record;
}

export function getAccessRequestByCode(accessCode) {
  const normalized = String(accessCode || "").trim().toUpperCase();
  return readStore().find((item) => item.accessCode === normalized) || null;
}

export function markAccessVerified(accessCode) {
  const normalized = String(accessCode || "").trim().toUpperCase();
  const items = readStore();
  const index = items.findIndex((item) => item.accessCode === normalized);

  if (index === -1) {
    return null;
  }

  items[index] = {
    ...items[index],
    verifiedAt: items[index].verifiedAt || new Date().toISOString(),
  };

  writeStore(items);
  return items[index];
}

export function markNdaSigned(accessCode, identity) {
  const normalized = String(accessCode || "").trim().toUpperCase();
  const items = readStore();
  const index = items.findIndex((item) => item.accessCode === normalized);

  if (index === -1) {
    return null;
  }

  items[index] = {
    ...items[index],
    ndaSignedAt: new Date().toISOString(),
    ndaIdentity: {
      prenom: identity.prenom || "",
      nom: identity.nom || "",
    },
  };

  writeStore(items);
  return items[index];
}
