import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback, lazy, Suspense } from 'react'
import { audio } from './utils/audio'
import { GameArea } from './components/GameArea'
import { FlaskConical, ArrowLeft } from 'lucide-react'

// Lazy-load heavy screens — only pulled when needed
const EndGame = lazy(() => import('./components/EndGame').then(m => ({ default: m.EndGame })))
const ResearchTab = lazy(() => import('./components/ResearchTab').then(m => ({ default: m.ResearchTab })))

// Hoisted to module-level so it's never remounted on App re-renders
const Background = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden" style={{ backgroundColor: '#020617' }}>
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 90, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full blur-[120px] mix-blend-screen"
      style={{ backgroundColor: '#EC4899' }}
    />
    <motion.div
      animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, -90, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute top-[20%] right-[0%] w-[60vw] h-[60vw] rounded-full blur-[120px] mix-blend-screen"
      style={{ backgroundColor: '#3B82F6' }}
    />
    <motion.div
      animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.6, 0.3], y: [0, -100, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[50vw] rounded-full blur-[120px] mix-blend-screen"
      style={{ backgroundColor: '#0D9488' }}
    />
  </div>
)

// ─── Shared Research Lab button ────────────────────────────────────────────────
function ResearchButton({ onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(56,189,248,0.4)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-2 px-6 py-3 rounded-full border font-medium text-sm tracking-wide transition-colors backdrop-blur-md cursor-pointer"
      style={{
        background: 'rgba(56,189,248,0.08)',
        borderColor: 'rgba(56,189,248,0.3)',
        color: '#38bdf8',
        boxShadow: '0 0 15px rgba(56,189,248,0.15)'
      }}
    >
      <FlaskConical className="w-4 h-4" />
      Research Lab
    </motion.button>
  )
}

export default function App() {
  // gameState: 'menu' | 'playing' | 'ended' | 'research'
  const [gameState, setGameState] = useState('menu')
  const [prevState, setPrevState] = useState('menu') // where to return from research
  const [endState, setEndState] = useState({ rules: new Set(), isEarlyExit: false })

  const handleEndGame = useCallback((rules, isEarlyExit) => {
    setEndState({ rules, isEarlyExit })
    setGameState('ended')
    audio.stopAmbient()
    if (!isEarlyExit) {
      audio.playVictoryChime()
      // Persist the unlock so Research Lab PDF stays accessible across sessions
      localStorage.setItem('tbm_unlocked', 'true')
    }
  }, [])

  const handleRestart = useCallback(() => {
    setEndState({ rules: new Set(), isEarlyExit: false })
    setGameState('menu')
  }, [])

  const openResearch = useCallback((from) => {
    setPrevState(from)
    setGameState('research')
  }, [])

  const closeResearch = useCallback(() => {
    setGameState(prevState)
  }, [prevState])

  return (
    <div className="min-h-screen text-white font-sans flex items-center justify-center p-4">
      <Background />

      <AnimatePresence mode="wait">

        {/* ── MENU ──────────────────────────────────────────────────────── */}
        {gameState === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel max-w-2xl w-full p-12 text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-7xl font-black mb-4 tracking-tight"
              style={{
                fontFamily: "'Orbitron', sans-serif",
                background: 'linear-gradient(90deg, #EC4899, #ffffff, #0D9488)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              The Browser's Mind
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xl text-white/60 mb-3 font-light"
            >
              A serene exploration of browser mechanics,
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-lg text-white/40 mb-10 font-light"
            >
              constraints, and observations.
            </motion.p>

            {/* Primary CTA */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(59,130,246,0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                audio.playClick()
                audio.startAmbient()
                setGameState('playing')
              }}
              className="px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-medium text-lg tracking-wide transition-colors backdrop-blur-md cursor-pointer mb-4"
              style={{ boxShadow: '0 0 30px rgba(236,72,153,0.3)' }}
            >
              Initiate Sequence
            </motion.button>

            {/* Research Lab button */}
            <div className="flex justify-center mt-4">
              <ResearchButton onClick={() => openResearch('menu')} />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.5 }}
              className="text-xs text-white/40 mt-8 font-mono tracking-widest"
            >
              [SID:ZEN-9402 | MONITORING ACTIVE]
            </motion.p>
          </motion.div>
        )}

        {/* ── PLAYING ───────────────────────────────────────────────────── */}
        {gameState === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="glass-panel w-full max-w-5xl flex flex-col p-6"
            style={{ height: '88vh' }}
          >
            <GameArea onEndGame={handleEndGame} />
          </motion.div>
        )}

        {/* ── ENDED ─────────────────────────────────────────────────────── */}
        {gameState === 'ended' && (
          <motion.div
            key="ended"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-6 w-full min-h-screen py-8"
          >
            <Suspense fallback={
              <div className="text-white/40 font-mono text-sm animate-pulse">Loading results...</div>
            }>
              <EndGame
                discoveredRules={endState.rules}
                isEarlyExit={endState.isEarlyExit}
                onRestart={handleRestart}
              />
            </Suspense>

            {/* Research Lab button below the scorecard */}
            <ResearchButton onClick={() => openResearch('ended')} />
          </motion.div>
        )}

        {/* ── RESEARCH LAB ─────────────────────────────────────────────── */}
        {gameState === 'research' && (
          <motion.div
            key="research"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass-panel w-full max-w-5xl flex flex-col overflow-hidden"
            style={{ height: '92vh' }}
          >
            {/* Header bar */}
            <div className="flex items-center gap-3 px-6 py-3 border-b shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
              <button
                onClick={closeResearch}
                className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <FlaskConical className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-semibold text-sky-400 tracking-wide">Research Lab</span>
              <span className="ml-auto text-xs font-mono text-white/20">Proof of Concept Lab</span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <span className="text-white/30 font-mono text-sm animate-pulse">
                    Loading Research Lab...
                  </span>
                </div>
              }>
                <ResearchTab />
              </Suspense>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
