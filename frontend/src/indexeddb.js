// This module provides IndexedDB helpers for storing file chunks and transfer state (id, totalChunks, receivedChunks, etc.)

const DB_PREFIX = 'filetransfer_';

// Open (or create) an IndexedDB database for a given transferId (e.g., file hash or unique ID)
export function openTransferDB(transferId) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_PREFIX + transferId, 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('chunks')) {
                db.createObjectStore('chunks', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('meta')) {
                db.createObjectStore('meta', { keyPath: 'key' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Store a chunk in the database
export async function storeChunk(db, chunk) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('chunks', 'readwrite');
        tx.objectStore('chunks').put(chunk);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

// Retrieve a chunk by id
export async function getChunk(db, chunkId) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('chunks', 'readonly');
        const req = tx.objectStore('chunks').get(chunkId);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// Get all chunk IDs (to track received/missing chunks)
export async function getAllChunkIds(db) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('chunks', 'readonly');
        const req = tx.objectStore('chunks').getAllKeys();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

// Store transfer metadata (id, totalChunks, receivedChunks, fileName, fileSize, etc.)
export async function storeMeta(db, meta) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('meta', 'readwrite');
        for (const [key, value] of Object.entries(meta)) {
            tx.objectStore('meta').put({ key, value });
        }
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

// Retrieve transfer metadata by key (e.g., 'id', 'totalChunks', 'receivedChunks')
export async function getMeta(db, key) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('meta', 'readonly');
        const req = tx.objectStore('meta').get(key);
        req.onsuccess = () => resolve(req.result ? req.result.value : undefined);
        req.onerror = () => reject(req.error);
    });
}

// Retrieve all metadata as an object
export async function getAllMeta(db) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('meta', 'readonly');
        const req = tx.objectStore('meta').getAll();
        req.onsuccess = () => {
            const meta = {};
            req.result.forEach(entry => { meta[entry.key] = entry.value; });
            resolve(meta);
        };
        req.onerror = () => reject(req.error);
    });
}

// Example usage:
// const db = await openTransferDB('some-file-id');
// await storeMeta(db, { id: 'some-file-id', totalChunks: 100, receivedChunks: [0,1,2], fileName: 'bigfile.zip', fileSize: 123456789 });
// const totalChunks = await getMeta(db, 'totalChunks');
// const receivedChunks = await getMeta(db, 'receivedChunks');
// const allMeta = await getAllMeta(db);