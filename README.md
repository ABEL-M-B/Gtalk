# Gtalk

Gtalk is a polished, minimal web chat interface that showcases real‑time, peer‑to‑peer communication directly in your browser.

Live demo: https://gtalk-f3k6.onrender.com/ — try it to see the latest build in action.

Overview

Gtalk focuses on private, low‑latency conversations using modern browser APIs. The UI is built with plain HTML, CSS and JavaScript so it loads fast and is easy to extend.

Key features

- WebRTC-based media & data channels — real-time audio/video and messaging using the browser's native WebRTC implementation.
- Peer-to-peer architecture — peers connect directly for message and media exchange, reducing central data routing and latency.
- OAuth authentication support — integrates with OAuth providers for secure sign-in and easy onboarding (e.g., Google, GitHub).
- Signaling for session setup — a lightweight signaling step negotiates peers and sets up WebRTC sessions (signaling can be self-hosted or provided by a minimal server).
- STUN/TURN fallback support — works across NATs and networks (TURN relay can be configured for best connectivity in restrictive networks).
- Responsive, accessible UI — works on desktop and mobile with keyboard navigation and responsive layouts.

How it works (high level)

1. A user authenticates (OAuth) and starts or joins a room.
2. The client performs signaling (via a signaling endpoint) to exchange session descriptions and ICE candidates.
3. Peers establish a direct WebRTC connection — data and media channels are opened for messages, audio, and optional video.
4. Messages and media flow peer‑to‑peer; the app handles reconnection and ICE restarts as needed.

Tech stack

- Frontend: HTML, CSS, JavaScript (vanilla)
- Real-time: WebRTC (RTCPeerConnection, DataChannel)
- Auth: OAuth compatible providers
- Optional backend pieces: lightweight signaling server, optional STUN/TURN services for relay

Privacy & security notes

- Because the main messaging and media use WebRTC P2P channels, message routing can avoid central storage when peers are directly connected.
- Use TURN relays where necessary to guarantee connectivity, but be aware relayed media passes through the TURN server.
- OAuth is used for authentication; ensure tokens and callback URLs are stored and transmitted securely when you add or configure a backend.

Make the live demo shine

- The live site (https://gtalk-f3k6.onrender.com/) is the best place to demo the app — include screencaptures or a short GIF here in the README to highlight the UI and flow.
- Consider adding a short video or step‑by‑step screenshots that show: sign-in (OAuth), creating/joining a room, and a successful P2P message or call.

Contact / Improvements

If you'd like, I can help:
- Draft polished screenshots and an intro GIF for the README.
- Add a short architecture diagram and a small `docs/` folder describing the signaling and auth flow.


