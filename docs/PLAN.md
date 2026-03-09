# Orchestration Plan: Next-Gen React Engine & Psychedelic Zen UI

## Goal
Migrate the existing vanilla JS/HTML "Browser's Mind" game to a professional **React + Node (Vite)** architecture, simultaneously implementing a "Psychedelic Zen" UI (Pink, Blue, Teal gradients) and next-level Framer Motion animations to satisfy the AAA requirement.

## Phase 1: Architecture Migration
- **Stack**: React 18, Vite, Tailwind CSS, Framer Motion.
- **Why**: The user noted increasing load times. React's virtual DOM + Vite's optimized bundling resolves the performance ceiling of raw JS manipulation while enabling deep componentization of the complex 9 rules.
- **Actions**:
  1. Scaffold a fresh Vite React project in `d:/Vibe`.
  2. Port `core.js` and all anticheat modules (`clipboard.js`, `focus.js`, etc.) into React hooks (`useClipboardDetection`, `useFocusWatch`, etc.) or Context providers.
  3. Re-implement the Generative Audio Engine within a global context to manage state without re-rendering the sounds.

## Phase 2: Psychedelic Zen Design System
- **Palette**: Deep Teal (`#0D9488`), Hot Pink (`#EC4899`), Electric Blue (`#3B82F6`), with shifting gradient backgrounds to simulate "zen" energy.
- **Typography**: Switch to an eye-catching, modern display font (e.g., `Orbitron` for HUD + `Inter` for legibility).
- **Animations**: Introduce `framer-motion` for liquid, next-level page transitions, floating glass panels, and particle effects for the background.

## Phase 3: Deliverables & Verification
- New File Structure (e.g., `src/components/`, `src/hooks/`).
- Verified zero console errors.
- Verified audio engine synchronization with React state.

***

**Do you approve this massive restructuring plan? (Y/N)**
- **Y**: I'll orchestrate `frontend-specialist`, `backend-specialist`, and `game-developer` in parallel to rebuild the game.
- **N**: I'll revise the plan or stick to the current HTML/JS stack.
