import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { WatermarkCanvas } from './WatermarkCanvas';
import { NoiseCanvas } from './NoiseCanvas';
import { ruleDatabase, TOTAL_RULES, HINTS, SOLUTIONS, RULE_IDS } from '../constants';
import { audio } from '../utils/audio';
import { Brain, Volume2, VolumeX, ShieldAlert, Award, X } from 'lucide-react';

const IDLE_DELAY_MS = 10_000; // 10 seconds

// Module-level — no need to be inside component (pure singleton call)
const playClick = () => audio.playClick();

export function GameArea({ onEndGame }) {
    const [discoveredRules, setDiscoveredRules] = useState(new Set());
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [showChecklist, setShowChecklist] = useState(false);

    // ─── Stacked learning card queue ───
    const [cardQueue, setCardQueue] = useState([]);

    // ─── Solution/Hint panel (replaces floating toast — solutions are multi-line) ───
    const [hintPanel, setHintPanel] = useState(null); // { text, isExplicit }
    const hintTimerRef = useRef(null);
    const discoveredRef = useRef(new Set()); // always-fresh mirror of discoveredRules

    // Game triggers
    const [isLayoutShifting, setIsLayoutShifting] = useState(false);
    const [revealActive, setRevealActive] = useState(false);
    const [options, setOptions] = useState(['Option 1', 'Option 2', 'Option 3', 'Option 4']);

    // ─── Idle timer ─── uses a ref so resetIdleTimer stays stable (no hintPanel dep) ───
    const idleTimerRef = useRef(null);
    const hintPanelRef = useRef(null); // mirrors hintPanel for sync read inside timer
    const resetIdleTimer = useCallback(() => {
        if (hintPanelRef.current) return; // don't stack hints
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            // Use the ref mirrors to read state synchronously without closure staleness
            const undiscovered = RULE_IDS.filter(r => !discoveredRef.current.has(r));
            if (undiscovered.length === 0) return;
            const ruleId = undiscovered[0];
            const panel = { text: SOLUTIONS[ruleId], isExplicit: true, ruleId };
            hintPanelRef.current = panel;
            setHintPanel(panel);
        }, IDLE_DELAY_MS);
    }, []); // ✅ Stable — no state in deps, reads via refs

    // Attach idle-reset listeners ONCE on mount
    useEffect(() => {
        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        const handler = () => resetIdleTimer();
        events.forEach(e => document.addEventListener(e, handler, { passive: true }));
        resetIdleTimer();

        return () => {
            events.forEach(e => document.removeEventListener(e, handler));
            clearTimeout(idleTimerRef.current);
            clearTimeout(hintTimerRef.current);
        };
    }, [resetIdleTimer]); // stable ref = runs only once

    // ─── Rule discovery: push onto queue, update ref mirrors ───
    const handleDiscoverRule = useCallback((ruleId) => {
        setDiscoveredRules(prev => {
            if (prev.has(ruleId)) return prev;
            const next = new Set(prev).add(ruleId);
            discoveredRef.current = next; // keep ref in sync
            audio.playCheckFound();
            setCardQueue(q => q.includes(ruleId) ? q : [...q, ruleId]);
            return next;
        });
    }, []);

    // Hook handles Clipboard, Focus, Devtools, Zerowidth
    useAntiCheat(handleDiscoverRule, true);

    // Layout Shift — visual jitter effect
    useEffect(() => {
        let interval;
        if (isLayoutShifting) {
            interval = setInterval(() => {
                const x = (Math.random() - 0.5) * 2.5;
                const y = (Math.random() - 0.5) * 2.5;
                const el = document.getElementById('shifty-text');
                if (el) el.style.transform = `translate(${x}px, ${y}px)`;
            }, 40); // faster and wider jitter — more noticeable
        } else {
            // Reset transform when not shifting
            const el = document.getElementById('shifty-text');
            if (el) el.style.transform = '';
        }
        return () => clearInterval(interval);
    }, [isLayoutShifting]);

    // ✅ Layout shift DISCOVERY — fired the first time the user hovers the paragraph
    const layoutShiftDiscoveredRef = useRef(false);
    const handleParagraphEnter = useCallback(() => {
        setIsLayoutShifting(true);
        if (!layoutShiftDiscoveredRef.current) {
            layoutShiftDiscoveredRef.current = true;
            // Small delay so the player sees the jitter before the card pops
            setTimeout(() => handleDiscoverRule('layout-shift'), 600);
        }
    }, [handleDiscoverRule]);

    // Win condition: two-phase approach
    // Phase 1 — all rules found → mark pendingWin, show persistent Finish Game button
    // Phase 2 — player deliberately clicks 'Finish Game' (banner or card button) → onEndGame
    const [pendingWin, setPendingWin] = useState(false);

    useEffect(() => {
        if (discoveredRules.size === TOTAL_RULES && !pendingWin) {
            setPendingWin(true);
        }
    }, [discoveredRules.size, pendingWin]);

    const handleFinishGame = useCallback(() => {
        onEndGame(discoveredRules, false);
    }, [onEndGame, discoveredRules]);

    const handleRevealClick = () => {
        playClick();
        setRevealActive(true);
        handleDiscoverRule('reveal');
        setTimeout(() => setRevealActive(false), 15000);
    };

    const handleShuffleOptions = () => {
        playClick();
        const shuffled = [...options].sort(() => Math.random() - 0.5);
        setOptions(shuffled);
        handleDiscoverRule('random');
    };

    // Close ONLY the topmost card in the queue
    const closeTopCard = () => {
        playClick();
        setCardQueue(q => q.slice(0, -1));
    };

    // ─── requestHint: RULE_IDS avoids Object.keys() in hot path ───
    const requestHint = useCallback((isExplicit = false) => {
        playClick();
        const undiscovered = RULE_IDS.filter(r => !discoveredRef.current.has(r));
        if (undiscovered.length === 0) return;
        const ruleId = undiscovered[0];
        const text = isExplicit ? SOLUTIONS[ruleId] : HINTS[ruleId];
        const panel = { text, isExplicit, ruleId };
        hintPanelRef.current = panel;
        setHintPanel(panel);
        if (!isExplicit) {
            clearTimeout(hintTimerRef.current);
            hintTimerRef.current = setTimeout(() => {
                hintPanelRef.current = null;
                setHintPanel(null);
            }, 8000);
        }
    }, []);

    const toggleMute = () => {
        const next = !isAudioEnabled;
        setIsAudioEnabled(next);
        audio.setVolume(next ? 0.5 : 0);
    };

    // The topmost card to show (last in queue)
    const topCard = cardQueue.length > 0 ? cardQueue[cardQueue.length - 1] : null;

    return (
        <div className="flex flex-col h-full relative">
            <WatermarkCanvas onDiscover={handleDiscoverRule} />
            <NoiseCanvas onDiscover={handleDiscoverRule} />

            {/* HUD */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 z-20 relative">
                <h2 className="font-display font-bold text-2xl tracking-wider text-zen-teal flex items-center gap-2">
                    <Brain className="w-6 h-6" /> HUD
                </h2>

                <div className="flex gap-6 font-mono text-sm text-white/70 items-center">
                    <button
                        onClick={() => { playClick(); setShowChecklist(v => !v); }}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/10 hover:border-zen-pink/40 transition-all cursor-pointer group"
                        title="Toggle awareness checklist"
                    >
                        <ShieldAlert className="w-4 h-4 text-zen-pink group-hover:scale-110 transition-transform" />
                        Awareness:
                        <span className={discoveredRules.size === TOTAL_RULES ? 'text-emerald-400' : 'text-zen-pink'}>
                            {discoveredRules.size} / {TOTAL_RULES}
                        </span>
                        <span className="text-white/30 text-xs">{showChecklist ? '▲' : '▼'}</span>
                    </button>

                    <button onClick={toggleMute} className="hover:text-white transition-colors cursor-pointer">
                        {isAudioEnabled ? <Volume2 className="w-5 h-5 text-zen-blue" /> : <VolumeX className="w-5 h-5 text-red-400" />}
                    </button>

                    <button
                        onClick={() => onEndGame(discoveredRules, discoveredRules.size < 2)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-red-500/30 text-red-400/70 hover:text-red-400 hover:border-red-500/60 hover:bg-red-500/10 transition-all cursor-pointer text-xs tracking-wide"
                        title="Exit to scorecard (penalty if fewer than 2 checks found)"
                    >
                        ⏹ Exit
                    </button>
                </div>
            </div>

            {/* ─── Awareness Checklist Panel ─────────────────────────────────────── */}
            <AnimatePresence>
                {showChecklist && (
                    <motion.div
                        key="checklist"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="overflow-hidden z-30 relative mb-2"
                    >
                        <div className="rounded-xl border border-white/10 bg-[#020617]/80 backdrop-blur-xl overflow-hidden">
                            {/* Panel header */}
                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                                <span className="text-xs font-mono font-bold tracking-widest uppercase text-zen-pink">
                                    🛡 Awareness Checklist — {discoveredRules.size} / {TOTAL_RULES} Found
                                </span>
                                <button
                                    onClick={() => setShowChecklist(false)}
                                    className="text-white/30 hover:text-white text-lg leading-none transition-colors cursor-pointer"
                                >✕</button>
                            </div>

                            {/* Column headers */}
                            <div className="grid text-xs font-mono font-bold uppercase tracking-widest text-white/30 px-4 py-2 border-b border-white/5"
                                style={{ gridTemplateColumns: '2rem 1fr 5rem 1fr' }}>
                                <span></span>
                                <span>Rule Name</span>
                                <span className="text-center">Category</span>
                                <span>How to Trigger</span>
                            </div>

                            {/* Rows */}
                            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto no-scrollbar">
                                {RULE_IDS.map((ruleId) => {
                                    const found = discoveredRules.has(ruleId);
                                    const rule = ruleDatabase[ruleId];
                                    const hint = HINTS[ruleId]?.replace(/^.+Hint \[.*?\]: /, '') ?? '';

                                    const categories = {
                                        clipboard: 'Internal',
                                        focus: 'Internal',
                                        devtools: 'Internal',
                                        reveal: 'Internal',
                                        watermark: 'Forensic',
                                        noise: 'Deterrence',
                                        'layout-shift': 'Deterrence',
                                        zerowidth: 'Forensic',
                                        random: 'Forensic',
                                    };
                                    const categoryColors = {
                                        Internal: 'text-sky-400 bg-sky-400/10',
                                        Forensic: 'text-emerald-400 bg-emerald-400/10',
                                        Deterrence: 'text-purple-400 bg-purple-400/10',
                                    };
                                    const cat = categories[ruleId] ?? 'Internal';

                                    return (
                                        <motion.div
                                            key={ruleId}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: RULE_IDS.indexOf(ruleId) * 0.04 }}
                                            className={`grid items-center px-4 py-2.5 gap-3 text-sm transition-colors ${found ? 'bg-emerald-400/5' : 'hover:bg-white/3'
                                                }`}
                                            style={{ gridTemplateColumns: '2rem 1fr 5rem 1fr' }}
                                        >
                                            {/* Status icon */}
                                            <span className="text-lg">
                                                {found ? '✅' : '🔲'}
                                            </span>

                                            {/* Rule title */}
                                            <span className={`font-medium ${found ? 'text-white' : 'text-white/50'
                                                }`}>
                                                {rule.title}
                                            </span>

                                            {/* Category badge */}
                                            <span className={`text-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${categoryColors[cat]}`}>
                                                {cat}
                                            </span>

                                            {/* Trigger hint */}
                                            <span className={`text-xs leading-snug ${found ? 'text-white/40 line-through' : 'text-white/60'
                                                }`}>
                                                {hint}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Footer progress bar */}
                            <div className="px-4 py-2 border-t border-white/5 bg-white/3">
                                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-gradient-to-r from-zen-pink via-zen-blue to-emerald-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(discoveredRules.size / TOTAL_RULES) * 100}%` }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* ─── Persistent Finish Game Banner (shown when all rules found) ─── */}
            <AnimatePresence>
                {pendingWin && (
                    <motion.div
                        key="finish-banner"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="relative z-30 mb-2 flex items-center justify-between px-4 py-3 rounded-xl border"
                        style={{
                            background: 'linear-gradient(90deg, rgba(245,158,11,0.12), rgba(251,191,36,0.12))',
                            borderColor: 'rgba(251,191,36,0.35)',
                            boxShadow: '0 0 24px rgba(251,191,36,0.2)'
                        }}
                    >
                        <div>
                            <p className="text-sm font-bold text-amber-400 tracking-wide">🏆 All checks found!
                            </p>
                            <p className="text-xs text-white/50 mt-0.5">Close any open cards and finish the game when ready.</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleFinishGame}
                            className="ml-4 px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide cursor-pointer shrink-0"
                            style={{
                                background: 'linear-gradient(90deg,#f59e0b,#fbbf24)',
                                color: '#000',
                                boxShadow: '0 0 20px rgba(251,191,36,0.5)'
                            }}
                        >
                            🏆 Finish Game
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* SIMULATION AREA */}
            <div
                className="flex-1 overflow-y-auto no-scrollbar relative z-20 flex flex-col gap-6"
            >
                <motion.div
                    id="shifty-text"
                    onMouseEnter={handleParagraphEnter}
                    onMouseLeave={() => setIsLayoutShifting(false)}
                    className="bg-white/5 border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-colors cursor-default"
                >
                    <h3 className="text-xl font-medium mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-zen-pink" /> Paragraph of Observation
                    </h3>
                    <p className="text-white/80 leading-relaxed font-light tracking-wide">
                        Analyze this architecture. When you duplicate this paragraph, an invisible forensic tag appends itself. As your mouse hovers, sub-pixel logic introduces jitter to throw off coordinate-based OCR scripts. Hidden inside the spaces between these very letters exists a binary watermark. Everything you do is catalogued.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div className="bg-white/5 border border-white/10 p-6 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-zen-teal/20 blur-[50px] rounded-full" />
                        <h3 className="text-xl font-medium mb-3">Memory Extraction</h3>
                        {revealActive ? (
                            <div className="p-4 bg-white/10 border-l-4 border-zen-teal rounded animate-pulse text-zen-teal font-mono tracking-widest text-center mt-6">
                                [DATA_FRAGMENT_001]
                            </div>
                        ) : (
                            <button
                                onClick={handleRevealClick}
                                className="w-full mt-4 py-3 bg-zen-teal/20 hover:bg-zen-teal/40 border border-zen-teal/50 rounded transition-colors cursor-pointer"
                            >
                                Examine Ephemeral Memory
                            </button>
                        )}
                    </motion.div>

                    <motion.div className="bg-white/5 border border-white/10 p-6 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-zen-blue/20 blur-[50px] rounded-full" />
                        <h3 className="text-xl font-medium mb-3">Spatial Rendering</h3>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <AnimatePresence>
                                {options.map(opt => (
                                    <motion.button
                                        layout
                                        key={opt}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="py-2 bg-white/10 border border-white/20 rounded hover:bg-white/20 transition-colors cursor-pointer"
                                    >
                                        {opt}
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                        <button
                            onClick={handleShuffleOptions}
                            className="w-full mt-4 py-2 text-sm text-zen-blue/80 hover:text-zen-blue border border-zen-blue/30 rounded transition-colors cursor-pointer"
                        >
                            Regenerate Layout Seed
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* ─── Hint / Solution Panel ─── */}
            <AnimatePresence>
                {hintPanel && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.97 }}
                        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
                    >
                        <div className={`glass-panel p-5 border ${hintPanel.isExplicit
                            ? 'border-zen-pink/40 shadow-[0_0_25px_rgba(236,72,153,0.3)]'
                            : 'border-zen-blue/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                            }`}>
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-xs font-mono font-bold tracking-widest uppercase ${hintPanel.isExplicit ? 'text-zen-pink' : 'text-zen-blue'
                                    }`}>
                                    {hintPanel.isExplicit ? '🔴 Step-by-Step Solution' : '💡 Guidance'}
                                </span>
                                <button
                                    onClick={() => {
                                        setHintPanel(null);
                                        hintPanelRef.current = null;
                                        resetIdleTimer();
                                    }}
                                    className="text-white/30 hover:text-white/80 transition-colors text-lg leading-none cursor-pointer ml-4 shrink-0"
                                >
                                    ✕
                                </button>
                            </div>
                            <p className="text-sm text-white/85 leading-relaxed whitespace-pre-line font-light">
                                {hintPanel.text}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Help Buttons */}
            <div className="absolute bottom-4 right-4 z-40 flex gap-2">
                <button
                    onClick={() => requestHint(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full border border-zen-blue/30 backdrop-blur-md shadow-lg transition-colors text-sm font-medium cursor-pointer text-zen-blue/80"
                >
                    💡 Hint
                </button>
                <button
                    onClick={() => requestHint(true)}
                    className="px-4 py-2 bg-zen-pink/10 hover:bg-zen-pink/20 rounded-full border border-zen-pink/30 backdrop-blur-md shadow-lg transition-colors text-sm font-medium cursor-pointer text-zen-pink/80"
                >
                    🔴 Solution
                </button>
            </div>

            {/* ─── STACKED LEARNING CARD MODALS ─── */}
            {/* Render backdrop + ALL cards in the queue. Each card is offset slightly
                so users can see the stack behind the top card. Only the top card is interactive. */}
            <AnimatePresence>
                {topCard && (
                    <motion.div
                        key="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-[#020617]/80 backdrop-blur-xl flex items-center justify-center p-4"
                    >
                        {/* Render all cards in queue, bottom ones peeking behind */}
                        {cardQueue.map((ruleId, index) => {
                            const isTop = index === cardQueue.length - 1;
                            const offset = (cardQueue.length - 1 - index) * 12; // px offset per depth level
                            return (
                                <motion.div
                                    key={ruleId}
                                    initial={{ scale: 0.9, y: 40, opacity: 0 }}
                                    animate={{
                                        scale: isTop ? 1 : 0.96 - (cardQueue.length - 1 - index) * 0.02,
                                        y: isTop ? 0 : offset,
                                        opacity: isTop ? 1 : 0.6,
                                    }}
                                    exit={{ scale: 0.9, y: -20, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                                    style={{ position: 'absolute', top: `calc(50% + ${offset}px)`, transform: 'translateY(-50%)' }}
                                    className="glass-panel w-full max-w-2xl p-8 md:p-10 max-h-[85vh] overflow-y-auto pointer-events-none"
                                    // Only the top card responds to pointer events
                                    {...(isTop ? { style: { position: 'relative' }, className: 'glass-panel w-full max-w-2xl p-8 md:p-10 max-h-[85vh] overflow-y-auto' } : {})}
                                >
                                    {/* Stack counter badge */}
                                    {cardQueue.length > 1 && isTop && (
                                        <div className="absolute top-4 left-4 bg-zen-pink/80 text-white text-xs font-mono px-2 py-1 rounded-full">
                                            {index + 1} / {cardQueue.length}
                                        </div>
                                    )}

                                    {/* Close top card */}
                                    {isTop && (
                                        <button
                                            onClick={closeTopCard}
                                            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}

                                    <h2 className="text-3xl font-display font-bold text-zen-pink mb-6 border-b border-white/10 pb-4 pr-8">
                                        {ruleDatabase[ruleId].title}
                                    </h2>
                                    <div
                                        className="text-lg leading-relaxed font-light whitespace-pre-wrap text-white/90"
                                        dangerouslySetInnerHTML={{
                                            // ruleDatabase is author-controlled static data (no user input).
                                            // We strip anything that isn't in the explicit safe-tag whitelist.
                                            __html: ruleDatabase[ruleId].text
                                                .replace(/<(?!\/?(?:span|code|b|em|br)\b)[^>]*>/gi, '')
                                        }}
                                    />
                                    {isTop && (
                                        <div className="mt-10 flex justify-between items-center pt-6 border-t border-white/10">
                                            {cardQueue.length > 1 && (
                                                <p className="text-sm text-white/40 font-mono">
                                                    {cardQueue.length - 1} more card{cardQueue.length > 2 ? 's' : ''} behind
                                                </p>
                                            )}
                                            {/* Last card + all rules found → show Finish Game instead */}
                                            {pendingWin && cardQueue.length === 1 ? (
                                                <button
                                                    onClick={closeTopCard}
                                                    className="ml-auto px-6 py-3 rounded font-bold tracking-wide shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all cursor-pointer animate-pulse"
                                                    style={{ background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', color: '#000' }}
                                                >
                                                    🏆 Finish Game
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={closeTopCard}
                                                    className="ml-auto px-6 py-3 bg-zen-blue hover:bg-blue-500 rounded font-medium shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-colors cursor-pointer"
                                                >
                                                    Confirm Understanding
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
