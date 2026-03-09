/**
 * devtools.js
 * Heuristic detection for Developer Tools.
 */

window.AnticheatEngine.registerModule('devtools', function init() {
    const threshold = 160;

    this.checkInterval = setInterval(() => {
        const widthDiff = window.outerWidth - window.innerWidth > threshold;
        const heightDiff = window.outerHeight - window.innerHeight > threshold;

        if (widthDiff || heightDiff) {
            window.GameEngine.discoverRule('devtools');
        }
    }, 1000);

    // Trap pattern
    this.trapInterval = setInterval(() => {
        const start = performance.now();
        debugger;
        const end = performance.now();
        if (end - start > 100) {
            window.GameEngine.discoverRule('devtools');
        }
    }, 2000);

}, function destroy() {
    clearInterval(this.checkInterval);
    clearInterval(this.trapInterval);
});
