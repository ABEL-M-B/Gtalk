// resume.js
// Handles resuming interrupted file transfers using persistent state in IndexedDB

import { getMeta as getTransferState, storeMeta as setTransferState, getChunk, storeChunk } from './indexeddb.js';
import { hashBlob as hashChunk } from './integrity.js';

// Check if a transfer with the given id can be resumed.
// Returns true if the transfer exists and is not completed.
export async function canResumeTransfer(transferId) {
  const state = await getTransferState(transferId);
  return !!state && state.status !== 'completed';
}

// Get a list of missing chunk indices for a transfer.
// Returns an array of chunk indices that have not been received yet.
export async function getMissingChunks(transferId) {
  const state = await getTransferState(transferId);
  if (!state) return [];
  const { totalChunks, receivedChunks } = state;
  const missing = [];
  for (let i = 0; i < totalChunks; i++) {
    if (!receivedChunks.includes(i)) missing.push(i);
  }
  return missing;
}

// Mark a chunk as received and update transfer state.
// Validates the chunk's integrity before storing.
// Returns true if the chunk is valid and stored, false otherwise.
export async function markChunkReceived(transferId, chunkIndex, chunkData, expectedHash) {
  // Check chunk integrity
  const hash = await hashChunk(chunkData);
  if (hash !== expectedHash) return false;

  // Store chunk and update state
  await storeChunk(transferId, chunkIndex, chunkData);
  const state = await getTransferState(transferId);
  if (!state.receivedChunks.includes(chunkIndex)) {
    state.receivedChunks.push(chunkIndex);
    await setTransferState(transferId, state);
  }
  return true;
}

// Resume sending missing chunks to the peer.
// Calls sendChunkFn for each missing chunk.
// sendChunkFn should be a function that takes (chunkIndex, chunkData, metadata).
export async function resumeSending(transferId, sendChunkFn) {
  const state = await getTransferState(transferId);
  if (!state) throw new Error('No transfer state found');
  const { totalChunks, sentChunks } = state;
  for (let i = 0; i < totalChunks; i++) {
    if (!sentChunks.includes(i)) {
      const chunkData = await getChunk(transferId, i);
      if (chunkData) {
        // You may want to include metadata like hash, size, etc.
        await sendChunkFn(i, chunkData, { transferId });
        state.sentChunks.push(i);
        await setTransferState(transferId, state);
      }
    }
  }
}

// Update transfer state in IndexedDB.
// Use this to update the state after reconnecting or resuming.
export async function updateTransferState(transferId, newState) {
  await setTransferState(transferId, newState);
}

// Get the current transfer state object for a given transfer id.
export async function getCurrentState(transferId) {
  return getTransferState(transferId);
}

// Example usage (not part of the module):
// if (await canResumeTransfer(transferId)) {
//   const missing = await getMissingChunks(transferId);
//   // Request missing chunks from peer, or resume sending
// }