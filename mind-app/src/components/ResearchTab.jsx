import { useState, useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
    BarElement, RadialLinearScale, PointElement, LineElement, Filler
} from 'chart.js';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
    ArcElement, Tooltip, Legend, CategoryScale, LinearScale,
    BarElement, RadialLinearScale, PointElement, LineElement, Filler
);

// ─── Shared helpers ────────────────────────────────────────────────────────────

const wrapLabel = (label) => {
    if (label.length <= 16) return label;
    const words = label.split(' ');
    const lines = [];
    let current = '';
    words.forEach(w => {
        if ((current + w).length > 16) {
            if (current.trim()) lines.push(current.trim());
            current = w + ' ';
        } else {
            current += w + ' ';
        }
    });
    if (current.trim()) lines.push(current.trim());
    return lines;
};

const tooltipTitle = (items) => {
    const item = items[0];
    const label = item.chart.data.labels[item.dataIndex];
    return Array.isArray(label) ? label.join(' ') : label;
};

const chartDefaults = {
    responsive: true,
    maintainAspectRatio: false,
};

// ─── Section heading component ─────────────────────────────────────────────────

function SectionHead({ color, children }) {
    const colors = {
        sky: 'text-sky-400',
        purple: 'text-purple-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        rose: 'text-rose-400',
    };
    return (
        <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${colors[color] ?? 'text-white'}`}>
            <span className="text-slate-100">◼</span> {children}
        </h2>
    );
}

// ─── Glass card ────────────────────────────────────────────────────────────────

function GCard({ children, className = '' }) {
    return (
        <div className={`rounded-xl p-6 border transition-transform ${className}`}
            style={{
                background: 'rgba(30,41,59,0.7)',
                backdropFilter: 'blur(10px)',
                borderColor: '#334155'
            }}
        >
            {children}
        </div>
    );
}

// ─── Icon box ──────────────────────────────────────────────────────────────────

function IconBox({ icon }) {
    return (
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4"
            style={{ background: '#1e293b', border: '1px solid #334155', fontSize: '1.25rem' }}>
            {icon}
        </div>
    );
}

// ─── Architecture Chart (Doughnut) ─────────────────────────────────────────────

function ArchChart() {
    const labels = [
        'Internal Controls (Sandbox)',
        'External Deterrence (Visual)',
        'Forensic Traceability (Data)'
    ];
    const data = {
        labels: labels.map(wrapLabel),
        datasets: [{
            data: [4, 3, 3],
            backgroundColor: ['#38bdf8', '#c084fc', '#34d399'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };
    const options = {
        ...chartDefaults,
        cutout: '70%',
        plugins: {
            legend: { position: 'right', labels: { color: '#cbd5e1', font: { size: 11 } } },
            tooltip: { callbacks: { title: tooltipTitle } }
        }
    };
    return <div style={{ height: 220 }}><Doughnut data={data} options={options} /></div>;
}

// ─── Risk Weight Chart (Horizontal Bar) ────────────────────────────────────────

function RiskChart() {
    const labels = ['Copy/Paste Event', 'Tab Switch/Blur', 'DevTools Inspection'];
    const data = {
        labels: labels.map(wrapLabel),
        datasets: [{
            label: 'Score Multiplier',
            data: [2, 3, 5],
            backgroundColor: ['#60a5fa', '#a78bfa', '#f43f5e'],
            borderRadius: 4
        }]
    };
    const options = {
        ...chartDefaults,
        indexAxis: 'y',
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { title: tooltipTitle } }
        },
        scales: {
            x: { grid: { color: '#334155' }, max: 6 },
            y: { grid: { display: false } }
        }
    };
    return <div style={{ height: 160 }}><Bar data={data} options={options} /></div>;
}

// ─── Threat Radar Chart ────────────────────────────────────────────────────────

function ThreatRadar() {
    const labels = [
        'Digital Copying', 'Secondary Device', 'Screen Recording',
        'Automated Scraping', 'DOM Tampering', 'Source Leaking'
    ];
    const data = {
        labels: labels.map(wrapLabel),
        datasets: [
            {
                label: 'Without Lab Setup',
                data: [1, 1, 1, 1, 1, 1],
                backgroundColor: 'rgba(244,63,94,0.2)',
                borderColor: '#f43f5e',
                pointBackgroundColor: '#f43f5e'
            },
            {
                label: 'With Lab Defenses',
                data: [5, 2, 3, 4, 4, 5],
                backgroundColor: 'rgba(56,189,248,0.3)',
                borderColor: '#38bdf8',
                pointBackgroundColor: '#38bdf8'
            }
        ]
    };
    const options = {
        ...chartDefaults,
        plugins: {
            legend: { position: 'top', labels: { color: '#cbd5e1' } },
            tooltip: { callbacks: { title: tooltipTitle } }
        },
        scales: {
            r: {
                angleLines: { color: '#334155' },
                grid: { color: '#334155' },
                pointLabels: { color: '#e2e8f0', font: { size: 11 } },
                ticks: { display: false, suggestedMax: 5, suggestedMin: 0 }
            }
        }
    };
    return <div style={{ height: 360 }}><Radar data={data} options={options} /></div>;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ResearchTab() {
    const [isUnlocked, setIsUnlocked] = useState(
        () => localStorage.getItem('tbm_unlocked') === 'true'
    );

    // Listen for unlock changes (e.g. player finishes game in another tab or
    // the localStorage key is set while Research Lab is already open)
    useEffect(() => {
        const check = () => setIsUnlocked(localStorage.getItem('tbm_unlocked') === 'true');
        window.addEventListener('storage', check);
        // Also poll briefly in case the same tab sets the key
        const t = setInterval(check, 2000);
        return () => { window.removeEventListener('storage', check); clearInterval(t); };
    }, []);

    return (
        <div className="h-full overflow-y-auto no-scrollbar text-slate-100"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >

            {/* ── Page 1: Header + Architecture ────────────────────────────────── */}
            <div className="mb-16">
                <header className="mb-12 text-center">
                    <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest uppercase rounded-full border"
                        style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}>
                        Proof of Concept Lab
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                        The Browser's{' '}
                        <span style={{
                            background: 'linear-gradient(to right, #38bdf8, #818cf8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>Mind</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        A layered architectural blueprint for Computer-Based Testing (CBT) anti-cheat systems.
                        Operating strictly within browser sandbox constraints to deliver robust monitoring without
                        compromising host system integrity.
                    </p>
                </header>

                {/* Architecture section */}
                <section className="mb-16">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="text-sky-400">◼</span> Foundational Architecture
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <p className="text-slate-300 mb-6 leading-relaxed text-sm">
                                The platform is designed as an interactive research lab. Rather than utilizing invasive OS-level
                                rootkits, it leverages standard Web APIs to establish a "defense-in-depth" model. This approach
                                demonstrates that significant behavioral insight and deterrence can be achieved purely through
                                client-side scripting.
                            </p>

                            {/* Layered ring diagram */}
                            <div className="relative" style={{ border: '2px dashed rgba(56,189,248,0.3)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                                <span className="absolute -top-3 left-4 px-2 text-xs font-bold uppercase tracking-wider text-sky-300"
                                    style={{ background: '#0f172a' }}>Layer 1: Internal Controls</span>
                                <div className="relative" style={{ border: '2px dashed rgba(192,132,252,0.3)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                                    <span className="absolute -top-3 left-4 px-2 text-xs font-bold uppercase tracking-wider text-purple-300"
                                        style={{ background: '#0f172a' }}>Layer 2: External Deterrence</span>
                                    <div className="relative" style={{ border: '2px dashed rgba(52,211,153,0.3)', borderRadius: '0.75rem', padding: '1.25rem' }}>
                                        <span className="absolute -top-3 left-4 px-2 text-xs font-bold uppercase tracking-wider text-emerald-300"
                                            style={{ background: '#0f172a' }}>Layer 3: Forensic Traceability</span>
                                        <div className="text-center py-2 text-xs font-mono rounded"
                                            style={{ background: 'rgba(30,41,59,0.5)' }}>Candidate Session</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <GCard>
                            <h3 className="text-sm font-semibold text-slate-400 mb-4 text-center uppercase tracking-wider">
                                Defense Layer Distribution
                            </h3>
                            <ArchChart />
                        </GCard>
                    </div>
                </section>

                {/* Internal Browser Controls */}
                <section className="mb-16">
                    <SectionHead color="sky">Phase 2: Internal Browser Controls</SectionHead>
                    <p className="text-slate-400 text-sm mb-6">
                        These mechanisms operate entirely within the browser's sandbox constraints, monitoring standard
                        DOM and Window events to detect anomalous behavior.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { icon: '📋', label: 'Clipboard Manipulation', color: '#38bdf8', desc: 'Intercepts oncopy events. Overrides clipboardData to inject zero-width trace payloads and embed session IDs.', useCase: 'Use Case: Watermark copied text', bypass: 'Bypass: Screenshots' },
                            { icon: '👁️', label: 'Focus & Visibility', color: '#38bdf8', desc: 'Tracks window.onblur and document.visibilitychange to detect tab switching and multi-tasking attempts.', useCase: 'Use Case: Detect search engines', bypass: 'Bypass: 2nd Device' },
                            { icon: '🛠️', label: 'DevTools Detection', color: '#38bdf8', desc: 'Monitors outerWidth vs innerWidth deltas and utilizes debugger timing traps to detect DOM inspection.', useCase: 'Use Case: Discourage tampering', bypass: 'Bypass: Undocked Tools' },
                            { icon: '⏱️', label: 'Time-Limited Reveal', color: '#38bdf8', desc: 'Controls the exposure window of sensitive questions using dynamic setTimeout hide/reveal logic.', useCase: 'Use Case: Reduce screenshot time', bypass: 'Bypass: Fast Capture' }
                        ].map(c => (
                            <div key={c.label} className="rounded-xl p-6 border flex flex-col"
                                style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(10px)', borderColor: '#334155', borderLeft: `4px solid ${c.color}` }}>
                                <IconBox icon={c.icon} />
                                <h3 className="text-lg font-bold mb-2">{c.label}</h3>
                                <p className="text-sm text-slate-300 mb-4 flex-1">{c.desc}</p>
                                <div className="flex justify-between items-center text-xs border-t pt-3" style={{ borderColor: '#334155' }}>
                                    <span className="text-slate-400">{c.useCase}</span>
                                    <span className="font-mono px-2 py-1 rounded" style={{ color: '#fbbf24', background: 'rgba(251,191,36,0.1)' }}>{c.bypass}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ── Page 2: External Deterrence + Forensic + Risk ───────────────────── */}
            <div className="mb-16">
                <section className="mb-12">
                    <SectionHead color="purple">Phase 3: External Deterrence Layer</SectionHead>
                    <p className="text-slate-400 text-sm mb-6">
                        Designed to increase the friction of capturing and distributing test content via external cameras
                        or screen recording software.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { icon: '💧', label: 'Dynamic Watermark', desc: 'Absolute positioned overlay with varying opacity and CSS transform: rotate. Renders Candidate ID and timestamps persistently.' },
                            { icon: '📺', label: 'Animated Noise Layer', desc: 'Canvas createImageData generating an animated Uint32Array buffer. Disrupts automated OCR scraping tools with minimal human impact.' },
                            { icon: '🔀', label: 'Micro Layout Shift', desc: 'Subtle CSS translation animation loops causing pixel jitter. Designed to break static frame extraction scripts.' }
                        ].map(c => (
                            <div key={c.label} className="rounded-xl p-6 border"
                                style={{ background: 'rgba(30,41,59,0.7)', backdropFilter: 'blur(10px)', borderColor: '#334155', borderTop: '4px solid #c084fc' }}>
                                <IconBox icon={c.icon} />
                                <h3 className="font-bold mb-2">{c.label}</h3>
                                <p className="text-xs text-slate-300">{c.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <SectionHead color="emerald">Phase 4: Forensic Traceability</SectionHead>
                    <p className="text-slate-400 text-sm mb-6">
                        The most robust layer for research, focusing on identifying the source of leaks <em>after</em> they occur.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <GCard>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">👻</span>
                                <h3 className="text-lg font-bold">Zero-Width Watermarking</h3>
                            </div>
                            <p className="text-sm text-slate-300 mb-3">
                                Injects invisible Unicode signatures (<code className="text-emerald-300">\u200B</code>) into readable
                                text. Creates a unique hash mapped to the session ID.
                            </p>
                            <div className="text-xs font-mono rounded p-2 overflow-hidden whitespace-nowrap"
                                style={{ background: '#0f172a', color: '#6ee7b7' }}>
                                &gt; The quick&#8203; brown&#8204; fox...
                            </div>
                        </GCard>

                        <GCard>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-2xl">🎲</span>
                                <h3 className="text-lg font-bold">Question Randomization</h3>
                            </div>
                            <p className="text-sm text-slate-300 mb-3">
                                Utilizes the Fisher-Yates shuffle algorithm with a session-based random seed to generate
                                unique question variants per candidate.
                            </p>
                            <div className="flex gap-2">
                                <span className="text-xs rounded px-2 py-1" style={{ background: '#1e293b', color: '#94a3b8' }}>Seed: 9f8a2</span>
                                <span className="text-xs rounded px-2 py-1" style={{ background: '#1e293b', color: '#94a3b8' }}>Variant A-7</span>
                            </div>
                        </GCard>
                    </div>
                </section>

                {/* Behavioral Risk Scoring */}
                <section>
                    <div className="rounded-xl border p-6" style={{ background: 'rgba(30,41,59,0.4)', borderColor: '#334155' }}>
                        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <span className="text-rose-400">◼</span> Behavioral Risk Scoring
                        </h2>
                        <p className="text-sm text-slate-300 mb-6">
                            Aggregates suspicious events to generate a real-time heuristic risk profile. Triggers visual
                            alerts upon threshold breach.
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    Live Session Simulation
                                </h4>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Current Risk Profile</span>
                                    <span className="font-bold" style={{ color: '#fbbf24' }}>Elevated (42)</span>
                                </div>
                                {/* Risk meter bar */}
                                <div className="h-2 w-full rounded overflow-hidden mb-6" style={{ background: '#334155' }}>
                                    <div className="h-full rounded transition-all" style={{
                                        width: '65%',
                                        background: 'linear-gradient(90deg, #34d399, #fbbf24, #ef4444)'
                                    }} />
                                </div>

                                {/* Code snippet */}
                                <div className="rounded-lg p-4 text-xs font-mono" style={{ background: '#0f172a', color: '#94a3b8' }}>
                                    <span className="text-slate-500">// Scoring Formula</span><br />
                                    <span className="text-sky-300">const</span>{' '}
                                    <span className="text-emerald-300">riskScore</span> =<br />
                                    &nbsp;&nbsp;(<span className="text-rose-300">2</span> * copyCount) +<br />
                                    &nbsp;&nbsp;(<span className="text-rose-300">3</span> * tabSwitches) +<br />
                                    &nbsp;&nbsp;(<span className="text-rose-300">5</span> * devToolsTriggers);
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">
                                    Heuristic Weight Distribution
                                </h4>
                                <RiskChart />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* ── Page 3: Radar + Limitations + References ────────────────────────── */}
            <div className="mb-12">
                <section className="mb-12">
                    <SectionHead color="amber">Threat Vector Mitigation Matrix</SectionHead>
                    <p className="text-slate-400 text-sm mb-6">
                        Evaluating the theoretical effectiveness of browser-based layers against common CBT cheating vectors.
                    </p>
                    <GCard>
                        <ThreatRadar />
                    </GCard>
                </section>

                {/* Limitations */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold mb-6 border-b pb-2" style={{ borderColor: '#334155' }}>
                        Phase 5: Browser-Only Limitations
                    </h2>
                    <div className="rounded-lg p-6 border" style={{ background: 'rgba(136,19,55,0.15)', borderColor: 'rgba(190,18,60,0.4)' }}>
                        <p className="text-sm mb-4 font-semibold leading-relaxed" style={{ color: '#fecdd3' }}>
                            Client-side enforcement is fundamentally limited. The golden rule of the web is that the client
                            is in the hands of the enemy. Layered mitigation increases friction; it does not guarantee absolute
                            prevention.
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
                            {[
                                'Cannot block hardware cameras or external recording devices.',
                                'Cannot block OS-level screenshot shortcuts globally.',
                                'Cannot prevent the use of a secondary device (smartphone).',
                                'Cannot halt background screen recording software.',
                                'Forensic watermarks are destroyed by raw text sanitization.',
                                'Heuristic risk scoring is predictive, not definitive proof.'
                            ].map(item => (
                                <li key={item} className="flex items-start gap-2">
                                    <span className="mt-0.5" style={{ color: '#f43f5e' }}>✕</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* External References */}
                <section>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#64748b' }}>
                        External References &amp; Documentation
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { href: 'https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API', label: 'MDN: Clipboard API', color: '#38bdf8' },
                            { href: 'https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API', label: 'MDN: Page Visibility', color: '#38bdf8' },
                            { href: 'https://en.wikipedia.org/wiki/Zero-width_space', label: 'Zero-Width Steganography', color: '#34d399' }
                        ].map(link => (
                            <a key={link.href} href={link.href} target="_blank" rel="noreferrer"
                                className="px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors hover:opacity-80"
                                style={{ background: '#1e293b', color: link.color }}>
                                {link.label} <span>↗</span>
                            </a>
                        ))}
                    </div>
                </section>

                {/* ── PDF Unlock Section ──────────────────────────────────────── */}
                <section className="mb-12">
                    {isUnlocked ? (
                        /* ── UNLOCKED: Download Card ─ */
                        <div className="rounded-2xl border overflow-hidden"
                            style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.10),rgba(251,191,36,0.06))', borderColor: 'rgba(251,191,36,0.4)', boxShadow: '0 0 40px rgba(251,191,36,0.12)' }}>
                            <div className="px-6 pt-6 pb-2 flex items-center gap-3">
                                <span className="text-3xl">🏆</span>
                                <div>
                                    <h2 className="text-lg font-black text-amber-400 tracking-wide">Classified Research Dossier — Unlocked</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">You completed the simulation. This material is now yours.</p>
                                </div>
                            </div>
                            <div className="px-6 pb-6 pt-4">
                                <p className="text-sm text-slate-300 mb-5 leading-relaxed">
                                    The full architectural research paper behind <em>The Browser's Mind</em> — covering
                                    the CBT anti-cheat system design, threat modelling, implementation notes, and future
                                    roadmap. Reserved for those who explored every boundary.
                                </p>
                                <a
                                    href="/blueprint.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download="TheBrowsersMindBlueprint.pdf"
                                    className="inline-flex items-center gap-3 px-7 py-3 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer"
                                    style={{
                                        background: 'linear-gradient(90deg,#f59e0b,#fbbf24)',
                                        color: '#000',
                                        boxShadow: '0 0 28px rgba(251,191,36,0.5)'
                                    }}
                                >
                                    <span className="text-lg">📄</span>
                                    Download Research Dossier
                                    <span className="text-xs opacity-70">PDF</span>
                                </a>
                            </div>
                        </div>
                    ) : (
                        /* ── LOCKED: Teaser Card ─ */
                        <div className="rounded-2xl border relative overflow-hidden"
                            style={{ background: 'rgba(15,23,42,0.8)', borderColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}>
                            {/* shimmer sweep */}
                            <div className="absolute inset-0 pointer-events-none"
                                style={{ background: 'linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.04) 50%,transparent 60%)', animation: 'shimmer 3s infinite' }}
                            />
                            <div className="px-6 py-8 text-center">
                                <div className="text-5xl mb-4">🔒</div>
                                <h2 className="text-xl font-black text-white/70 tracking-wide mb-2">
                                    A Hidden Treasure Awaits
                                </h2>
                                <p className="text-sm text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
                                    Somewhere within this game lies a <span className="text-amber-400 font-semibold">Classified Research Dossier</span>.
                                    Those who explore every boundary and complete the simulation will unlock it.
                                </p>
                                <p className="text-xs font-mono text-slate-600 tracking-widest uppercase">
                                    [ Complete the game to access this material ]
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                <footer className="mt-12 pt-6 border-t text-center text-xs" style={{ borderColor: '#1e293b', color: '#475569' }}>
                    CBT Anti-Cheat Proof of Concept Lab © The Browser's Mind Architecture
                </footer>
            </div>
        </div>
    );
}
