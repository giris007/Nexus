# Nexus

Real-time messaging platform with embedded collaborative applets, fluid gesture navigation, and low-latency synchronization.

---

## Overview

Nexus is a full-stack communication platform designed for high-performance messaging, on-device collaboration, and fluid touch interactions. The system integrates real-time chat with embedded interactive applets—allowing users to participate in polls, split expenses, track shared checklists, and transmit encrypted notes directly within conversation streams.

---

## Core Capabilities

### Container Transform Engine
- Bidirectional container morphing between chat list cards and full conversation view.
- GPU-composited transitions using synchronized cubic-bezier curves for locked 60/120 FPS performance with zero layout reflow.
- Synchronized cross-fade between presence status and conversation previews upon dismissal.

### Touch and Gesture Navigation
- Edge swipe-to-dismiss gesture with interactive drag tracking and elastic feedback.
- Directional swipe on message bubbles for quick quoted replies with haptic response.

### File and Media Sharing
- Support for images, videos, documents (PDF, DOCX, archives), and direct camera capture.
- Inline media rendering, download handling, and file metadata presentation.

### Embedded In-Chat Applets
- Multi-option voting polls with live percentage distribution.
- Shared expense calculator with per-participant share calculation and payment tracking.
- Collaborative task checklists with real-time state synchronization.
- Self-destructing encrypted notes with automatic expiration.

### Real-Time Architecture
- Bidirectional event messaging powered by Socket.io with sub-20ms latency.
- Optimistic UI updates for zero-delay message rendering.
- Live typing indicator waves in conversation stream and header.
- Automated AI assistant for message assistance and instant responses.

### Audio and Video Calling
- Dedicated interface for peer-to-peer audio and video communication with hardware controls.

### Design System and Theming
- Tokenized design architecture supporting both Light and Dark themes via CSS custom properties.

---

## Technical Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- Backend: Node.js, Express, Socket.io, TypeScript runtime
- State Management: React Context API, CSS Token System

---

## Directory Layout

```
OS/
├── server.ts                 # Express and Socket.io server
├── src/
│   ├── App.tsx               # Root application router and gesture controller
│   ├── ThemeContext.tsx      # Theme state management
│   ├── types.ts              # Data models and interface definitions
│   ├── index.css             # Theme tokens and animation keyframes
│   ├── components/
│   │   ├── ChatArea.tsx       # Message thread, media sharing, and reply system
│   │   ├── Sidebar.tsx        # Conversation directory, filtering, and search
│   │   ├── Navbar.tsx         # Top navigation and user identity switcher
│   │   ├── MiniAppCards.tsx   # Interactive embedded applet components
│   │   ├── MiniAppModal.tsx   # Applet creation interface
│   │   ├── MomentsFeed.tsx    # Activity and update feed
│   │   ├── MiniAppsHub.tsx    # Applet catalog and utility directory
│   │   └── VideoCallModal.tsx # Audio and video call module
├── package.json
└── vite.config.ts
```

---

## Setup and Execution

### Requirements
- Node.js 18 or newer
- npm or equivalent package manager

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/giris007/Nexus.git
   cd Nexus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start backend service:
   ```bash
   npx tsx server.ts
   ```
   *Runs on port 3001*

4. Start frontend service:
   ```bash
   npm run dev
   ```
   *Runs on port 5173*

5. Production build:
   ```bash
   npm run build
   ```

---

## License
MIT
