# Nexus ⚡

> Next-generation real-time messaging, fluid mobile gesture system, and embedded micro-apps ecosystem inspired by Apple HIG, WeChat, and Oppo ColorOS.

---

## 🌟 Overview

**Nexus** is a full-stack, real-time communication platform engineered for locked 60/120 FPS performance, peer collaboration, and native mobile gestures. Beyond standard messaging, Nexus embeds interactive micro-apps directly into message streams—enabling teams to vote on polls, split bills, track shared checklists, and send encrypted notes without ever switching tabs or opening external browsers.

---

## ✨ Key Features

### 1. 📱 Fluid Container Transform (ColorOS Inspired)
- **Bidirectional Expansion & Morphing**: Seamlessly expands from the clicked chat card in the list to full-screen chat, and smoothly collapses back into the exact card position on dismiss.
- **Hardware Accelerated**: GPU-driven transitions using `will-change` and synchronized cubic-bezier easing curves (`cubic-bezier(0.2, 0.9, 0.2, 1)`), eliminating dropped frames and layout reflow.
- **Seamless Text Morph**: Presence status ("Online" / "Last seen") cross-fades into the last message and timestamp upon collapse with pixel-perfect alignment.

### 2. 👆 Native Mobile Gestures
- **Swipe-Right-to-Dismiss**: Edge-drag or swipe anywhere on open chat with rubber-band physics and a floating arrow indicator to dismiss back to the chat list.
- **Swipe-to-Reply**: Drag message bubbles rightward to reveal an animated reply arrow and haptic trigger, populating a quoted reply banner above the message composer.

### 3. 📎 Multi-Media & Document Sharing
- **Gallery**: Pick and stream photos & videos with inline media players.
- **Document Hub**: Send PDFs, docs, spreadsheets, and archives with file size badges and one-tap download.
- **Camera Access**: Quick capture and send support.

### 4. 🧩 In-Chat Embedded Applets (Mini-Apps)
- **Interactive Polls**: Real-time multi-choice voting with live percentage distribution.
- **Expense Splitter**: Shared group expense calculator with per-person splits and settlement status.
- **Shared Checklists**: Collaborative task lists with instant live checkoff sync.
- **Encrypted Self-Destruct Notes**: Confidential notes with countdown timers.

### 5. ⚡ Real-Time Engine & AI Copilot
- **Socket.io Sub-20ms Sync**: Instant bi-directional messaging, optimistic UI updates, and reaction toggles.
- **Typing Indicator Waves**: Floating 3-dot bouncy wave in the chat stream and header subtitle.
- **On-Device Copilot**: Built-in "Nexus AI Copilot" capable of instant answers, drafts, and automated smart responses.

### 6. 📞 Audio & Video Calling
- Built-in WebRTC-styled video/audio modal with camera toggle, microphone mute, screen-share, and audio visualizer.

### 7. 🌗 Dual-Theme Token System
- Full semantic token variables supporting Apple Light (`#F2F2F7`) and OLED Dark Mode (`#131313`).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express, Socket.io, TypeScript (`tsx`)
- **State & Theme**: React Context API, CSS Custom Properties Design Tokens

---

## 📂 Project Structure

```
OS/
├── server.ts                 # Express + Socket.io real-time server
├── src/
│   ├── App.tsx               # Root container, overlay navigation & gesture router
│   ├── ThemeContext.tsx      # Dual-theme provider (light/dark)
│   ├── types.ts              # Core TypeScript interfaces (Message, Chat, MiniApp)
│   ├── index.css             # Semantic design tokens & keyframe animations
│   ├── components/
│   │   ├── ChatArea.tsx       # Chat stream, attachment sheet, gestures & reply
│   │   ├── Sidebar.tsx        # Conversation list, search, filters & card layout
│   │   ├── Navbar.tsx         # Responsive header, user profile switcher & tabs
│   │   ├── MiniAppCards.tsx   # Interactive poll, bill split, and checklist cards
│   │   ├── MiniAppModal.tsx   # Applet creator bottom-sheet
│   │   ├── MomentsFeed.tsx    # Social updates & peer activity feed
│   │   ├── MiniAppsHub.tsx    # Applet store & productivity widgets
│   │   └── VideoCallModal.tsx # Audio/video call interface
├── package.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/giris007/Nexus.git
   cd Nexus
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   npx tsx server.ts
   ```
   *Server will run at [http://localhost:3001](http://localhost:3001)*

4. **Start the frontend Vite dev server:**
   ```bash
   npm run dev
   ```
   *Frontend will run at [http://localhost:5173](http://localhost:5173)*

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📄 License
MIT License. Feel free to use and customize for your own projects!
