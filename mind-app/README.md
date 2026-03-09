# 🧠 The Browser's Mind

> **A Psychotropic Zen Exploration of Browser Security Mechanics.**

[![Built with React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Built with Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

**The Browser's Mind** is an interactive, educational "Proof of Concept" lab designed to demonstrate common (and some advanced) anti-cheat and proctoring technologies used in web applications today. Inside this high-fidelity simulation, your goal is to trigger all **9 Hidden Awareness Checks**.

---

## 🎭 The Concept

Modern browsers are sandboxed, but they still expose numerous events and heuristics that can "feel" your presence. From window resizing to clipboard manipulation, this project visualizes the invisible strings platforms use to monitor user behavior.

### 🔬 The 9 awareness checks
The simulation tracks and reveals the following mechanics:

1.  **📋 Clipboard Manipulation**: Intercepts `copy` events to inject invisible forensic tags.
2.  **👁️ Focus & Visibility**: Uses `blur` and `visibilitychange` to detect tab switching.
3.  **🛠️ DevTools Detection**: Measures window deltas and `debugger` timing traps.
4.  **⏱️ Time-Limited Reveal**: Ephemeral content exposure to discourage manual recording.
5.  **👻 Canvas Fingerprinting**: Real-time session ID watermarking via the Canvas API.
6.  **📺 Dynamic Static Overlay**: High-frequency pixel noise to disrupt OCR programs.
7.  **📳 Layout Jitter**: Sub-pixel CSS transforms to break coordinate-based macro bots.
8.  **🧬 Zero-Width Steganography**: Embedding user IDs into text via invisible characters.
9.  **🔀 Seeded PRNG Shuffling**: Fisher-Yates element randomization to prevent answer sharing.

---

## 🧪 Research Lab

Once you successfully complete the simulation by discovering all checks, you unlock the **Classified Research Dossier**. This section provides:
- **Foundational Architecture**: A deep dive into the system's "CBT Anti-Cheat" design.
- **Defense Layer Distribution**: Visual breakdown of Deterrence vs. Detection.
- **Blueprint PDF**: A downloadable technical specification (available only after completion).

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/mind-app.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd mind-app
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Development
Run the development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🛠️ Tech Stack

- **React 19**: Modern UI framework.
- **Vite 7**: Ultra-fast build tool and dev server.
- **Tailwind CSS v4**: Utility-first CSS for the psychedelic aesthetic.
- **Framer Motion**: Smooth, high-performance animations.
- **Chart.js**: Visualizing the research data.
- **Lucide React**: Premium iconography.

---

## 📦 Deployment

### Building for Production
The project is optimized for static hosting:
```bash
npm run build
```
This will generate a `dist/` folder with:
- **Terser Minification**: Stripping all console logs and debugger statements.
- **Code Splitting**: Separate vendor chunks (React, Charts, Motion) for better caching.
- **Sanitized HTML**: Hardened meta tags and SEO optimizations.

You can deploy the contents of the `dist/` folder to **Vercel**, **Netlify**, or **GitHub Pages**.

---

## ⚖️ License & Disclaimer

This project is for **educational purposes only**. It demonstrates how browser events *can* be used for proctoring but does not guarantee absolute security. The techniques showcased are proof-of-concepts.

**Built with Zen & Zero-Width Characters.** 🧠✨
