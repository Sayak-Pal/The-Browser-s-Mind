/**
 * core.js - "The Browser's Mind" Game Engine
 * Manages game state, score, discovering rules, and showing learning cards.
 */

window.GameEngine = (function () {
    let score = 0;
    let discoveredRules = new Set();
    const TOTAL_RULES = 9;

    // Idle Tracker variables
    let idleTimer = null;
    const IDLE_LIMIT_MS = 30000; // 30 seconds of idle time
    let isGameActive = false;

    // Rule definitions for learning cards
    const ruleDatabase = {
        'clipboard': {
            title: "The Observer's Ink",
            text: "I noticed you tried to take my words.\n\nWhen you copied the text, I intercepted the `copy` event using JavaScript. Instead of just giving you the text you highlighted, I appended a hidden, invisible forensic tag before handing it over to your OS clipboard.\n\n<span class='text-muted'><b>Real-World Example:</b></span>\n<code>ClipboardData.setData('text/plain', highlightedText + '\\n[SID:102030|CONFIDENTIAL]')</code>\n\n<span class='text-muted'><b>Deep Dive:</b></span> This technique is used by exams and data-rooms to trace exactly who leaked a screenshot or document online."
        },
        'focus': {
            title: "Wandering Eyes",
            text: "You looked away. I felt it.\n\nYour browser fires `blur` and `visibilitychange` events the moment you switch to another tab or minimize the window.\n\n<span class='text-muted'><b>Real-World Example:</b></span>\n<code>document.addEventListener('visibilitychange', () => { if(document.hidden) logViolation(); });</code>\n\n<span class='text-muted'><b>Deep Dive:</b></span> Basic proctoring systems use this. While they cannot see *what* tab you opened, they know exactly *when* and *how long* you were gone."
        },
        'devtools': {
            title: "Piercing the Veil",
            text: "You are trying to look at my inner workings.\n\nI detected a sudden difference in the width of the outer window versus the inner rendered page, a classic sign that Developer Tools just opened. I also laid a trap using a `debugger` statement, measuring how long it took to execute.\n\n<span class='text-muted'><b>Real-World Example:</b></span>\n<code>if(window.outerWidth - window.innerWidth > 160) flagDevTools();</code>\n\n<span class='text-muted'><b>Deep Dive:</b></span> Modern sites use these heuristics to stop users from inspecting the network tab and downloading private video streams or intercepting API keys."
        },
        'reveal': {
            title: "Fleeting Memory",
            text: "You asked for the answer, and I gave it—but only for a moment.\n\nBy tying the visibility of high-value content to a strict `setTimeout` window, I reduce the time you have to capture or share the screen.\n\n<span class='text-muted'><b>Real-World Example:</b></span>\n<code>setTimeout(() => { hideAnswers(); }, 15000);</code>\n\n<span class='text-muted'><b>Deep Dive:</b></span> Information is safe from persistent memory scraping when it is ephemeral."
        },
        'watermark': {
            title: "The Ghost in the Machine",
            text: "You caused my canvas to rescale, revealing the ghost.\n\nI am constantly drawing your unique Session ID and the current timestamp onto a translucent `<canvas>` overlay using the Canvas 2D API.\n\n<span class='text-muted'><b>Real-World Example:</b></span>\n<code>ctx.fillText('User: 4202 | Time: 12:00', x, y);</code>\n\n<span class='text-muted'><b>Deep Dive:</b></span> If you take a physical photo of the screen with your phone, OCR programs can recover this watermark to ban your account."
        },
        'noise': {
            title: "Static Interference",
            text: "You triggered the static.\n\nBy rapidly writing random RGB values directly into a `Uint32Array` pixel buffer and rendering it over the screen 60 times a second, I create high-frequency noise.\n\n<span class='text-muted'><b>Real-World Example:</b></span>\n<code>buffer[i] = (255 << 24) | (R << 16) | (G << 8) | Math.random()*255;</code>\n\n<span class='text-muted'><b>Deep Dive:</b></span> To a human, it's just a faint static. To an OCR bot trying to read the text automatically, it destroys the bounding-box logic."
        },
        'layout-shift': {
            title: "Restless Foundations",
            text: "You made the world shake.\n\nEvery few seconds, I apply microscopic sub-pixel CSS `transform: translate()` jitter to the main content container.\n\n<span class='text-muted'><b>Real-World Example:</b></span>\n<code>el.style.transform = 'translate(-0.5px, 0.5px)';</code>\n\n<span class='text-muted'><b>Deep Dive:</b></span> It is subtle, but it completely breaks basic macro-recording tools that rely on clicking exact X/Y screen coordinates."
        },
        'zerowidth': {
            title: "The Invisible Thread",
            text: "You triggered the invisible injection.\n\nI have encoded your Session ID into binary, and then translated that binary into Zero-Width Joiner characters (`\\u200B` and `\\u200C`).\n\n<span class='text-muted'><b>Real-World Example:</b></span>\n<code>const invisibleId = '\\u200B\\u200C\\u200B\\u200B';</code>\n\n<span class='text-muted'><b>Deep Dive:</b></span> These characters have zero width, meaning they are completely invisible to the human eye, but they copy perfectly. If you post the leak online, I just parse the invisible characters to find you."
        },
        'random': {
            title: "The Shuffled Deck",
            text: "You asked for a new perspective.\n\nI used a seeded pseudo-random number generator (PRNG) tied specifically to your session ID, applying a Fisher-Yates shuffle to the DOM elements.\n\n<span class='text-muted'><b>Real-World Example:</b></span>\n<code>options.sort(() => prng() - 0.5);</code>\n\n<span class='text-muted'><b>Deep Dive:</b></span> Your Option A is not the same as someone else's Option A. If you share answers (e.g., 'The answer is A'), they will be wrong."
        }
    };

    function init() {
        bindUI();
    }

    function bindUI() {
        document.getElementById('startBtn').addEventListener('click', startGame);
        document.getElementById('resumeBtn').addEventListener('click', resumeGame);

        // Restart now checks for early exit
        document.getElementById('restartBtn').addEventListener('click', () => {
            triggerEndGame(true);
        });

        document.getElementById('menuBtn').addEventListener('click', pauseGame);
        document.getElementById('closeModalBtn').addEventListener('click', closeModal);
        document.getElementById('hintBtn').addEventListener('click', showHint);

        // Idle Listeners
        document.getElementById('acceptHelpBtn').addEventListener('click', acceptIdleHelp);
        document.getElementById('declineHelpBtn').addEventListener('click', declineIdleHelp);

        // Track global activity to reset idle timer
        ['mousemove', 'keydown', 'scroll', 'click'].forEach(evt => {
            document.addEventListener(evt, resetIdleTimer, true);
        });

        // Volume Controls
        const startVol = document.getElementById('startVolume');
        const pauseVol = document.getElementById('pauseVolume');

        startVol.addEventListener('input', (e) => {
            window.GameAudio.setVolume(e.target.value);
            pauseVol.value = e.target.value; // keep synced
        });

        pauseVol.addEventListener('input', (e) => {
            window.GameAudio.setVolume(e.target.value);
            startVol.value = e.target.value; // keep synced
        });
    }

    function startGame() {
        window.GameAudio.playClick();
        window.GameAudio.startAmbient();
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameUI').classList.remove('hidden');

        // Initialize all detection modules
        Object.keys(ruleDatabase).forEach(module => {
            if (window.AnticheatEngine && window.AnticheatEngine.modules[module]) {
                window.AnticheatEngine.modules[module].init();
            }
        });

        isGameActive = true;
        resetIdleTimer();
        updateHUD();
        log("Welcome. I am the evaluation environment. I have rules. Try to break them.");
    }

    function pauseGame() {
        window.GameAudio.playClick();
        document.getElementById('pauseMenu').classList.remove('hidden');
    }

    function resumeGame() {
        window.GameAudio.playClick();
        document.getElementById('pauseMenu').classList.add('hidden');
        // If it was the end screen, just hide it to let them look around
        document.getElementById('endScreen').classList.add('hidden');
    }

    // Called by the individual modules instead of incrementRisk
    function discoverRule(ruleId) {
        if (discoveredRules.has(ruleId)) return; // Already found

        discoveredRules.add(ruleId);
        score += 100;

        window.GameAudio.playDiscoveryChime();
        showLearningCard(ruleId);
        updateHUD();
        log(`Discovery: ${ruleDatabase[ruleId].title}`);

        if (discoveredRules.size === TOTAL_RULES) {
            triggerEndGame();
        }
    }

    function showLearningCard(ruleId) {
        const data = ruleDatabase[ruleId];
        if (!data) return;

        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalText').innerText = data.text;
        document.getElementById('learningModal').classList.remove('hidden');
        document.getElementById('modalBg').classList.remove('hidden');
    }

    function closeModal() {
        window.GameAudio.playClick();
        document.getElementById('learningModal').classList.add('hidden');
        document.getElementById('modalBg').classList.add('hidden');
    }

    function showHint(isExplicit = false) {
        window.GameAudio.playClick();
        const undiscovered = Object.keys(ruleDatabase).filter(r => !discoveredRules.has(r));
        if (undiscovered.length === 0) return;

        // Clearer vague hints
        const hints = {
            'clipboard': "Hint: Try copying part of the paragraph.",
            'focus': "Hint: I notice when you look away. Try switching tabs.",
            'devtools': "Hint: Engineers like to look under the hood. Press F12.",
            'reveal': "Hint: Click 'Examine Memory' and let the timer run out.",
            'watermark': "Hint: Resizing the browser window leaves shadows.",
            'noise': "Hint: There is static watching. Click the empty background.",
            'layout-shift': "Hint: Hover your mouse over the main paragraph text.",
            'zerowidth': "Hint: Highlight and select the main paragraph text.",
            'random': "Hint: Refresh the page to see what changes."
        };

        // Direct instructions when user accepts help
        const solutions = {
            'clipboard': "SOLUTION: Highlight the paragraph text and press Ctrl+C or Cmd+C to copy it.",
            'focus': "SOLUTION: Click on another application or open a new browser tab.",
            'devtools': "SOLUTION: Press F12 or Right-Click anywhere and select 'Inspect'.",
            'reveal': "SOLUTION: Click the 'Examine Memory' button and wait for the countdown to finish.",
            'watermark': "SOLUTION: Resize your browser window (make it smaller or larger).",
            'noise': "SOLUTION: Click exactly on the empty background space outside the center card.",
            'layout-shift': "SOLUTION: Move your mouse cursor to hover directly over the paragraph text.",
            'zerowidth': "SOLUTION: Drag your mouse to highlight the letters in the paragraph.",
            'random': "SOLUTION: Press F5 or the browser Reload button to refresh the page."
        };

        const ruleId = undiscovered[0];
        const hintText = isExplicit === true ? solutions[ruleId] : hints[ruleId];

        const hintEl = document.getElementById('hintText');
        hintEl.textContent = hintText;
        hintEl.classList.remove('hidden');

        // Hide hint after 8 seconds
        setTimeout(() => hintEl.classList.add('hidden'), 8000);
    }

    function triggerEndGame(isEarlyExit = false) {
        if (isEarlyExit && discoveredRules.size < 2) {
            // Unworthy exit
            window.GameAudio.stopAmbient();
            document.getElementById('earlyExitModal').classList.remove('hidden');
            document.getElementById('modalBg').classList.remove('hidden');
            return;
        }

        setTimeout(() => {
            buildScorecard();
            document.getElementById('endScreen').classList.remove('hidden');
            window.GameAudio.stopAmbient();
            // Play the big victory chord
            window.GameAudio.playVictoryChime();
        }, 1500); // Shorter for snappy AAA UX
    }

    function buildScorecard() {
        const board = document.getElementById('scorecardTable');
        board.innerHTML = '';

        let foundCount = discoveredRules.size;

        // Update Title if partial or full
        if (foundCount === TOTAL_RULES) {
            document.getElementById('endTitle').textContent = "Full Harmony Achieved";
            document.getElementById('endTitle').classList.add('glow');
        } else {
            document.getElementById('endTitle').textContent = `Simulation Ended (${foundCount}/${TOTAL_RULES})`;
            document.getElementById('endTitle').classList.remove('glow');
        }

        Object.keys(ruleDatabase).forEach(r => {
            const row = document.createElement('div');
            row.className = 'score-row';

            const title = ruleDatabase[r].title;

            if (discoveredRules.has(r)) {
                row.innerHTML = `<span style="color: #10B981;">✓ ${title}</span><span style="color: #10B981;">Found</span>`;
            } else {
                row.innerHTML = `<span style="color: #64748B;">✗ Unknown Boundary</span><span style="color: #64748B;">Missed</span>`;
                row.style.opacity = "0.7";
            }
            board.appendChild(row);
        });
    }

    function updateHUD() {
        document.getElementById('scoreVal').textContent = score;
        document.getElementById('foundVal').textContent = `${discoveredRules.size}/${TOTAL_RULES}`;
    }

    function log(msg) {
        const narrativeBox = document.getElementById('narrativeBox');
        narrativeBox.innerText = `"${msg}"`;
        // Subtle animate
        narrativeBox.style.opacity = '0';
        setTimeout(() => narrativeBox.style.opacity = '1', 50);
    }

    // --- IDLE LOGIC ---
    function resetIdleTimer() {
        if (!isGameActive) return;

        if (idleTimer) clearTimeout(idleTimer);

        // Don't trigger if they've found everything
        if (discoveredRules.size >= TOTAL_RULES) return;

        // Don't trigger if a modal is already open
        if (!document.getElementById('modalBg').classList.contains('hidden')) return;

        idleTimer = setTimeout(showIdleHelp, IDLE_LIMIT_MS);
    }

    function showIdleHelp() {
        if (!isGameActive || discoveredRules.size >= TOTAL_RULES) return;

        const remaining = TOTAL_RULES - discoveredRules.size;
        document.getElementById('idleCount').textContent = remaining;

        document.getElementById('modalBg').classList.remove('hidden');
        document.getElementById('idleHelpModal').classList.remove('hidden');
        window.GameAudio.playDiscoveryChime(); // Use chime to grab attention gently
    }

    function declineIdleHelp() {
        window.GameAudio.playClick();
        document.getElementById('idleHelpModal').classList.add('hidden');
        document.getElementById('modalBg').classList.add('hidden');
        resetIdleTimer(); // Start tracking again
    }

    function acceptIdleHelp() {
        window.GameAudio.playClick();
        document.getElementById('idleHelpModal').classList.add('hidden');
        document.getElementById('modalBg').classList.add('hidden');

        // Force the hint function instead of a single modal to make it interactive
        showHint(true);
        log("I'll tell you exactly what to do.");
        resetIdleTimer();
    }

    // Adapt the previous architecture to feed into the new engine
    // Since modules were registering to window.AnticheatEngine
    window.AnticheatEngine = {
        modules: {},
        registerModule: function (name, initFn, destroyFn) {
            this.modules[name] = { init: initFn, destroy: destroyFn };
        },
        discoverRule: discoverRule,
        getSessionId: () => 'ZEN-9402',
        log: function () { }, // Suppress old logs
        incrementRisk: function () { }, // Suppress old violations
        triggerViolationHandler: function () { } // Suppress old overlays
    };

    return {
        init,
        discoverRule
    };
})();
