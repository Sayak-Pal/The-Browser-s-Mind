import { motion } from 'framer-motion';
import { ruleDatabase, TOTAL_RULES } from '../constants';
import { audio } from '../utils/audio';

export function EndGame({ discoveredRules, isEarlyExit, onRestart }) {
    const handleRestart = () => {
        audio.playClick();
        onRestart();
    };

    // ── Early-exit penalty screen (< 2 checks found) ─────────────────────────
    if (isEarlyExit) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel w-full max-w-2xl text-center p-12"
            >
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-[5rem] mb-4"
                >😞</motion.div>

                <h3 className="text-3xl font-display font-bold text-zen-pink mb-3">
                    You Left Too Early
                </h3>
                <p className="text-base text-white/60 font-light mb-2 max-w-md mx-auto">
                    You exited with fewer than <span className="text-white font-semibold">2 checks</span> discovered.
                </p>
                <p className="text-sm text-white/40 font-light mb-10 max-w-sm mx-auto">
                    The browser environment is complex. You must persevere if you wish to understand it.
                    Reload the page or click below to try again.
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={handleRestart}
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-medium transition-colors backdrop-blur-md cursor-pointer"
                    >
                        ← Back to Menu
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-zen-pink/20 hover:bg-zen-pink/30 border border-zen-pink/40 rounded-full font-medium transition-colors backdrop-blur-md cursor-pointer text-zen-pink"
                    >
                        🔄 Restart Simulation
                    </button>
                </div>
            </motion.div>
        );
    }

    // ── Full Scorecard ────────────────────────────────────────────────────────
    const isFull = discoveredRules.size === TOTAL_RULES;
    const score = discoveredRules.size;

    const categoryLabel = {
        clipboard: { cat: 'Internal', color: 'text-sky-400', bg: 'bg-sky-400/10' },
        focus: { cat: 'Internal', color: 'text-sky-400', bg: 'bg-sky-400/10' },
        devtools: { cat: 'Internal', color: 'text-sky-400', bg: 'bg-sky-400/10' },
        reveal: { cat: 'Internal', color: 'text-sky-400', bg: 'bg-sky-400/10' },
        watermark: { cat: 'Forensic', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        noise: { cat: 'Deterrence', color: 'text-purple-400', bg: 'bg-purple-400/10' },
        'layout-shift': { cat: 'Deterrence', color: 'text-purple-400', bg: 'bg-purple-400/10' },
        zerowidth: { cat: 'Forensic', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        random: { cat: 'Forensic', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel w-full max-w-3xl p-8 md:p-10 flex flex-col"
            style={{ maxHeight: '90vh' }}
        >
            {/* Header */}
            <div className="text-center mb-6 shrink-0">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-5xl mb-3"
                >
                    {isFull ? '🏆' : score >= 6 ? '🥈' : '🥉'}
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-zen-pink via-white to-zen-teal bg-clip-text text-transparent mb-2">
                    {isFull ? 'Full Harmony Achieved' : `Simulation Ended`}
                </h2>
                <p className="text-white/50 font-light text-sm">
                    {isFull
                        ? 'You have found all boundaries. You understand how systems observe and restrict behavior.'
                        : 'Grey rows are undiscovered checks — use their titles as hints for your next run.'}
                </p>
            </div>

            {/* Score bar */}
            <div className="shrink-0 mb-4 px-2">
                <div className="flex justify-between text-xs font-mono text-white/40 mb-1.5">
                    <span>Score</span>
                    <span className={isFull ? 'text-amber-400 font-bold' : 'text-white/60'}>
                        {score} / {TOTAL_RULES} checks
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-zen-pink via-zen-blue to-emerald-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / TOTAL_RULES) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Scorecard table */}
            <div className="flex-1 overflow-y-auto no-scrollbar rounded-xl border border-white/10 overflow-hidden">
                {/* Column headers */}
                <div className="grid text-[10px] font-mono font-bold uppercase tracking-widest text-white/30 px-4 py-2 bg-white/5 border-b border-white/10 sticky top-0"
                    style={{ gridTemplateColumns: '2.5rem 1fr 5.5rem 4.5rem' }}>
                    <span></span>
                    <span>Check Name</span>
                    <span className="text-center">Category</span>
                    <span className="text-right">Status</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/5">
                    {Object.keys(ruleDatabase).map((ruleId, i) => {
                        const isFound = discoveredRules.has(ruleId);
                        const meta = categoryLabel[ruleId];
                        return (
                            <motion.div
                                key={ruleId}
                                initial={{ x: -16, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.05 * i + 0.3 }}
                                className={`grid items-center px-4 py-3 gap-3 text-sm ${isFound ? 'bg-emerald-400/5' : 'opacity-50'
                                    }`}
                                style={{ gridTemplateColumns: '2.5rem 1fr 5.5rem 4.5rem' }}
                            >
                                {/* Icon */}
                                <span className="text-xl">{isFound ? '✅' : '🔲'}</span>

                                {/* Name */}
                                <span className={`font-medium tracking-wide ${isFound ? 'text-white' : 'text-white/50'}`}>
                                    {ruleDatabase[ruleId].title}
                                </span>

                                {/* Category */}
                                {meta ? (
                                    <span className={`text-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.color} ${meta.bg}`}>
                                        {meta.cat}
                                    </span>
                                ) : <span />}

                                {/* Status pill */}
                                <span className={`text-right text-[10px] font-mono font-bold uppercase tracking-wider ${isFound ? 'text-emerald-400' : 'text-white/30'
                                    }`}>
                                    {isFound ? 'FOUND' : 'MISSED'}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Footer actions */}
            <div className="mt-6 pt-5 border-t border-white/10 flex gap-3 justify-center shrink-0">
                <button
                    onClick={handleRestart}
                    className="px-7 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full font-medium transition-colors backdrop-blur-md cursor-pointer text-sm"
                >
                    ← Menu
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-7 py-3 bg-zen-blue hover:bg-blue-500 rounded-full font-medium shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-colors text-white tracking-wide cursor-pointer text-sm"
                >
                    🔄 Begin Anew
                </button>
            </div>
        </motion.div>
    );
}
