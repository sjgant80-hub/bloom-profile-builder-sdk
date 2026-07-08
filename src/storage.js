// bloom-profile-builder-sdk / storage.js
// Extracted from bloom-profile-builder source · index.html IDB helpers.
// Browser-only · sovereign · nothing leaves the device.

export const DB_NAME    = 'bloom_profile_builder';
export const DB_VERSION = 1;
export const STORE      = 'profiles';

/**
 * Open (or create) the bloom-profile-builder IndexedDB.
 * @returns {Promise<IDBDatabase>}
 */
export function openDB() {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB unavailable · storage.js is browser-only'));
  }
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, DB_VERSION);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    r.onsuccess = () => res(r.result);
    r.onerror   = () => rej(r.error);
  });
}

/**
 * Persist a profile (upsert by id).
 * @param {object} profile
 */
export async function saveProfile(profile) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(profile);
    tx.oncomplete = () => res();
    tx.onerror    = () => rej(tx.error);
  });
}

/**
 * Get a single profile by id.
 * @param {string} id
 */
export async function getProfile(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx  = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });
}

/**
 * List all profiles (unordered).
 */
export async function allProfiles() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx  = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror   = () => rej(req.error);
  });
}

/**
 * Delete a profile by id.
 * @param {string} id
 */
export async function deleteProfile(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror    = () => rej(tx.error);
  });
}

/**
 * Wipe all profiles.
 */
export async function clearAll() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => res();
    tx.onerror    = () => rej(tx.error);
  });
}
