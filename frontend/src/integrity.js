// This module provides hashing and integrity checking for file transfer.
// Uses the SubtleCrypto API (SHA-256) for hashing chunks and the full file.

// Hash a Blob or ArrayBuffer (returns a hex string)
export async function hashBlob(blob) {
    // Read the blob as an ArrayBuffer
    const buffer = await blob.arrayBuffer();
    // Use SubtleCrypto to hash the buffer (SHA-256)
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    // Convert the hash to a hex string
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Hash an array of chunks in order to get a full file hash
export async function hashChunks(chunks) {
    // Concatenate all chunk ArrayBuffers
    const buffers = [];
    for (const chunk of chunks) {
        // If chunk.data is a Blob, convert to ArrayBuffer
        if (chunk.data instanceof Blob) {
            buffers.push(await chunk.data.arrayBuffer());
        } else if (chunk.data instanceof ArrayBuffer) {
            buffers.push(chunk.data);
        }
    }
    // Merge all buffers into one
    const totalLength = buffers.reduce((sum, buf) => sum + buf.byteLength, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
        merged.set(new Uint8Array(buf), offset);
        offset += buf.byteLength;
    }
    // Hash the merged buffer
    const hashBuffer = await crypto.subtle.digest('SHA-256', merged.buffer);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Validate a chunk's hash
export async function validateChunk(chunk, expectedHash) {
    const actualHash = await hashBlob(chunk.data);
    return actualHash === expectedHash;
}

// Example usage:
// const chunkHash = await hashBlob(chunk.data);
// const fileHash = await hashChunks(allChunks);
// const isValid = await validateChunk(chunk, chunk.hash);