// This module sets up a WebRTC DataChannel for peer-to-peer file transfer.
// It provides functions to create the connection, open a DataChannel, send data, and handle received data.

// Create a new RTCPeerConnection with optional ICE servers
export function createPeerConnection(iceServers = [{ urls: 'stun:stun.l.google.com:19302' }]) {
    // The RTCPeerConnection handles the WebRTC connection
    return new RTCPeerConnection({ iceServers });
}

// Create a DataChannel for sending data (called by the initiator)
export function createDataChannel(peerConnection, label = 'filetransfer', options = {}) {
    // The DataChannel is used to send/receive file chunks
    return peerConnection.createDataChannel(label, options);
}

// Set up a handler for receiving a DataChannel (called by the receiver)
export function onDataChannel(peerConnection, onChannel) {
    // When a remote peer creates a DataChannel, this event fires
    peerConnection.ondatachannel = (event) => {
        onChannel(event.channel);
    };
}

// Send a chunk of data over the DataChannel
export function sendChunk(dataChannel, chunk) {
    // Only send if the channel is open
    if (dataChannel.readyState === 'open') {
        dataChannel.send(chunk);
    }
}

// Listen for incoming messages (chunks) on the DataChannel
export function onChunk(dataChannel, callback) {
    // When a message arrives, call the callback with the data
    dataChannel.onmessage = (event) => {
        callback(event.data);
    };
}

// Optional: Listen for open/close/error events on the DataChannel
export function onChannelState(dataChannel, { onOpen, onClose, onError } = {}) {
    if (onOpen) dataChannel.onopen = onOpen;
    if (onClose) dataChannel.onclose = onClose;
    if (onError) dataChannel.onerror = onError;
}

// Example usage (initiator):
// const pc = createPeerConnection();
// const dc = createDataChannel(pc);
// onChannelState(dc, { onOpen: () => { /* ready to send */ } });
// sendChunk(dc, someChunk);

// Example usage (receiver):
// const pc = createPeerConnection();
// onDataChannel(pc, (dc) => {
//   onChunk(dc, (data) => { /* handle received chunk */ });
// });