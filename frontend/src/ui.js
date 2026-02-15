// filepath: frontend/src/ui.js
// ui.js
// Handles the visual representation of file transfer progress, speed, and peer status in the chat UI

// Usage: Import and call these functions from your main chat logic or file transfer modules.

// Create a progress bar for a file transfer
export function createTransferUI(transferId, filename, totalSize, peerName) {
  // Create container
  const container = document.createElement('div');
  container.className = 'file-transfer-container';
  container.id = `transfer-${transferId}`;

  // File info
  const info = document.createElement('div');
  info.className = 'file-info';
  info.textContent = `${filename} (${formatBytes(totalSize)}) with ${peerName}`;

  // Progress bar
  const progressBar = document.createElement('progress');
  progressBar.max = 100;
  progressBar.value = 0;
  progressBar.className = 'file-progress';

  // Speed display
  const speed = document.createElement('span');
  speed.className = 'file-speed';
  speed.textContent = 'Speed: 0 KB/s';

  // Status display
  const status = document.createElement('span');
  status.className = 'file-status';
  status.textContent = 'Waiting...';

  // Append elements
  container.appendChild(info);
  container.appendChild(progressBar);
  container.appendChild(speed);
  container.appendChild(status);

  // Add to UI (customize selector as needed)
  document.getElementById('transfers')?.appendChild(container);
}

// Update progress bar and speed for a transfer
export function updateTransferUI(transferId, receivedBytes, totalBytes, speedBps, statusText) {
  const container = document.getElementById(`transfer-${transferId}`);
  if (!container) return;
  const progressBar = container.querySelector('.file-progress');
  const speed = container.querySelector('.file-speed');
  const status = container.querySelector('.file-status');
  if (progressBar) progressBar.value = Math.floor((receivedBytes / totalBytes) * 100);
  if (speed) speed.textContent = `Speed: ${formatBytes(speedBps)}/s`;
  if (status && statusText) status.textContent = statusText;
}

// Remove transfer UI when done or cancelled
export function removeTransferUI(transferId) {
  const container = document.getElementById(`transfer-${transferId}`);
  if (container) container.remove();
}

// Utility to format bytes as human-readable string
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Example: In your HTML, add a <div id="transfers"></div> where transfer UIs will appear.
// Call createTransferUI() when a transfer starts, updateTransferUI() as progress changes, and removeTransferUI() when done.
