export const TOTAL_RULES = 9;
// Pre-computed once at module load — avoids Object.keys() calls in hot paths
export const RULE_IDS = Object.keys({
    clipboard: 1, focus: 1, devtools: 1, reveal: 1,
    watermark: 1, noise: 1, 'layout-shift': 1, zerowidth: 1, random: 1
});

export const ruleDatabase = {
    'clipboard': {
        title: "The Observer's Ink",
        text: "I noticed you tried to take my words.\n\nWhen you copied the text, I intercepted the `copy` event using JavaScript. Instead of just giving you the text you highlighted, I appended a hidden, invisible forensic tag before handing it over to your OS clipboard.\n\n<span class='text-white/50'><b>Real-World Example:</b></span>\n<code>ClipboardData.setData('text/plain', highlightedText + '\\n[SID:102030|CONFIDENTIAL]')</code>\n\n<span class='text-white/50'><b>Deep Dive:</b></span> This technique is used by exams and data-rooms to trace exactly who leaked a screenshot or document online."
    },
    'focus': {
        title: "Wandering Eyes",
        text: "You looked away. I felt it.\n\nYour browser fires `blur` and `visibilitychange` events the moment you switch to another tab or minimize the window.\n\n<span class='text-white/50'><b>Real-World Example:</b></span>\n<code>document.addEventListener('visibilitychange', () => { if(document.hidden) logViolation(); });</code>\n\n<span class='text-white/50'><b>Deep Dive:</b></span> Basic proctoring systems use this. While they cannot see *what* tab you opened, they know exactly *when* and *how long* you were gone."
    },
    'devtools': {
        title: "Piercing the Veil",
        text: "You are trying to look at my inner workings.\n\nI detected a sudden difference in the width of the outer window versus the inner rendered page, a classic sign that Developer Tools just opened. I also laid a trap using a `debugger` statement, measuring how long it took to execute.\n\n<span class='text-white/50'><b>Real-World Example:</b></span>\n<code>if(window.outerWidth - window.innerWidth > 160) flagDevTools();</code>\n\n<span class='text-white/50'><b>Deep Dive:</b></span> Modern sites use these heuristics to stop users from inspecting the network tab and downloading private video streams or intercepting API keys."
    },
    'reveal': {
        title: "Fleeting Memory",
        text: "You asked for the answer, and I gave it—but only for a moment.\n\nBy tying the visibility of high-value content to a strict `setTimeout` window, I reduce the time you have to capture or share the screen.\n\n<span class='text-white/50'><b>Real-World Example:</b></span>\n<code>setTimeout(() => { hideAnswers(); }, 15000);</code>\n\n<span class='text-white/50'><b>Deep Dive:</b></span> Information is safe from persistent memory scraping when it is ephemeral."
    },
    'watermark': {
        title: "The Ghost in the Machine",
        text: "You caused my canvas to rescale, revealing the ghost.\n\nI am constantly drawing your unique Session ID and the current timestamp onto a translucent <code>&lt;canvas&gt;</code> overlay using the Canvas 2D API.\n\n<span class='text-white/50'><b>Real-World Example:</b></span>\n<code>ctx.fillText('User: 4202 | Time: 12:00', x, y);</code>\n\n<span class='text-white/50'><b>Deep Dive:</b></span> If you take a physical photo of the screen with your phone, OCR programs can recover this watermark to ban your account — even from a low-resolution image taken on your phone camera."
    },
    'noise': {
        title: "Static Interference",
        text: "You triggered the static.\n\nBy rapidly writing random RGB values directly into a `Uint32Array` pixel buffer and rendering it over the screen 60 times a second, I create high-frequency noise.\n\n<span class='text-white/50'><b>Real-World Example:</b></span>\n<code>buffer[i] = (255 << 24) | (R << 16) | (G << 8) | Math.random()*255;</code>\n\n<span class='text-white/50'><b>Deep Dive:</b></span> To a human, it's just a faint static. To an OCR bot trying to read the text automatically, it destroys the bounding-box logic."
    },
    'layout-shift': {
        title: "Restless Foundations",
        text: "You made the world shake.\n\nEvery few seconds, I apply microscopic sub-pixel CSS `transform: translate()` jitter to the main content container.\n\n<span class='text-white/50'><b>Real-World Example:</b></span>\n<code>el.style.transform = 'translate(-0.5px, 0.5px)';</code>\n\n<span class='text-white/50'><b>Deep Dive:</b></span> It is subtle, but it completely breaks basic macro-recording tools that rely on clicking exact X/Y screen coordinates."
    },
    'zerowidth': {
        title: "The Invisible Thread",
        text: "You triggered the invisible injection.\n\nI have encoded your Session ID into binary, and then translated that binary into Zero-Width Joiner characters (`\\u200B` and `\\u200C`).\n\n<span class='text-white/50'><b>Real-World Example:</b></span>\n<code>const invisibleId = '\\u200B\\u200C\\u200B\\u200B';</code>\n\n<span class='text-white/50'><b>Deep Dive:</b></span> These characters have zero width, meaning they are completely invisible to the human eye, but they copy perfectly. If you post the leak online, I just parse the invisible characters to find you."
    },
    'random': {
        title: "The Shuffled Deck",
        text: "You asked for a new perspective.\n\nI used a seeded pseudo-random number generator (PRNG) tied specifically to your session ID, applying a Fisher-Yates shuffle to the DOM elements.\n\n<span class='text-white/50'><b>Real-World Example:</b></span>\n<code>options.sort(() => prng() - 0.5);</code>\n\n<span class='text-white/50'><b>Deep Dive:</b></span> Your Option A is not the same as someone else's Option A. If you share answers (e.g., 'The answer is A'), they will be wrong."
    }
};

// ─── Contextual Hints (mild nudge) ───────────────────────────────────────────
export const HINTS = {
    'clipboard': "📋 Hint [clipboard]: Look at the 'Paragraph of Observation' card. Try selecting some words and copying them.",
    'focus': "👁 Hint [focus]: I watch when you leave. Try clicking another browser tab or pressing Alt+Tab.",
    'devtools': "🔧 Hint [devtools]: Try opening Developer Tools. Press F12 or right-click the page and choose 'Inspect'.",
    'reveal': "⏳ Hint [memory]: Scroll down to the 'Memory Extraction' card and click the teal 'Examine Ephemeral Memory' button.",
    'watermark': "🖼 Hint [watermark]: A ghost is painted over the screen. Drag the corner of your browser window to resize it.",
    'noise': "📺 Hint [noise]: The page has a faint flickering layer. Click directly on the dark empty spacenot on any card.",
    'layout-shift': "🌀 Hint [shift]: Move your mouse cursor slowly over the text inside the 'Paragraph of Observation' card and watch closely.",
    'zerowidth': "🧵 Hint [zero-width]: Click at the start of the 'Paragraph of Observation' text and drag to select all the words in it.",
    'random': "🃏 Hint [shuffle]: Look at the 'Spatial Rendering' card at the bottom-right. Click the 'Regenerate Layout Seed' button.",
};

// ─── Explicit Solutions (exact UI steps) ─────────────────────────────────────
export const SOLUTIONS = {
    'clipboard':
        "🔴 SOLUTION [clipboard]:\n" +
        "1. Find the card titled '📌 Paragraph of Observation' on the game screen.\n" +
        "2. Click at the beginning of the paragraph text.\n" +
        "3. Hold Shift and click at the end to select all text — OR press Ctrl+A inside the card.\n" +
        "4. Press Ctrl+C (Windows) or Cmd+C (Mac) to copy.\n" +
        "   → I intercept the clipboard and inject a hidden forensic tag.",

    'focus':
        "🔴 SOLUTION [focus]:\n" +
        "1. While on this game screen, press Alt+Tab (Windows) or Cmd+Tab (Mac) to switch to another app.\n" +
        "   OR click the address bar and open a new tab (Ctrl+T).\n" +
        "2. Wait 1 second, then switch back to this tab.\n" +
        "   → I detect the 'visibilitychange' event the moment focus leaves.",

    'devtools':
        "🔴 SOLUTION [devtools]:\n" +
        "1. Press F12 on your keyboard — Developer Tools will open on the right side.\n" +
        "   OR right-click anywhere on this page → select 'Inspect' from the menu.\n" +
        "2. The tools panel will open. That's the trigger.\n" +
        "   → I measure window.outerWidth minus window.innerWidth to detect the panel.",

    'reveal':
        "🔴 SOLUTION [memory]:\n" +
        "1. Scroll down on the game screen to the card titled 'Memory Extraction'.\n" +
        "2. Click the teal button labeled 'Examine Ephemeral Memory'.\n" +
        "3. A glowing [DATA_FRAGMENT_001] will appear — just wait. The auto-hide timer runs for 15 seconds.\n" +
        "   → I set a setTimeout to erase the content before you can copy it.",

    'watermark':
        "🔴 SOLUTION [watermark]:\n" +
        "1. Grab the bottom-right corner of your browser window.\n" +
        "2. Drag it to make the window smaller or taller.\n" +
        "   OR press Win + Left/Right arrow to snap the window.\n" +
        "3. As the canvas redraws, it reveals your session watermark '[ID:ZEN-9402]'.\n" +
        "   → I listen to the 'resize' DOM event to trigger canvas re-rendering.",

    'noise':
        "🔴 SOLUTION [noise]:\n" +
        "1. Look at the page background — the faint flickering static covering the whole screen.\n" +
        "2. Click directly on the dark background area, NOT on any white card or button.\n" +
        "   Try clicking near the top-left or bottom corner of the screen.\n" +
        "   → The <canvas> element covering the whole page is click-sensitive.",

    'layout-shift':
        "🔴 SOLUTION [layout-shift]:\n" +
        "1. Find the card labeled '📌 Paragraph of Observation'.\n" +
        "2. Slowly hover your mouse cursor OVER the paragraph text inside it.\n" +
        "3. Stare closely — the text block subtly jitters every 50ms.\n" +
        "   → I apply CSS transform: translate(Xpx, Ypx) micro-jitter on mouseover.",

    'zerowidth':
        "🔴 SOLUTION [zero-width]:\n" +
        "1. Find the 'Paragraph of Observation' card on the game screen.\n" +
        "2. Click right before the first word of the paragraph.\n" +
        "3. Hold Shift and press End, or drag your mouse to highlight 50+ characters.\n" +
        "   → Selecting triggers the 'selectionchange' event which I monitor for hidden \\u200B chars.",

    'random':
        "🔴 SOLUTION [shuffle]:\n" +
        "1. Find the card labeled 'Spatial Rendering' (bottom-right of the game area).\n" +
        "2. Click the blue button at the bottom of the card labeled 'Regenerate Layout Seed'.\n" +
        "3. Watch the four Option buttons rearrange positions.\n" +
        "   → I run a seeded Fisher-Yates sort() on the options array using your session ID.",
};
