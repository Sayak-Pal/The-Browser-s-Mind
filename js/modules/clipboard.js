/**
 * clipboard.js
 * Intercepts copy events, fingerprints the payload, and logs discovery.
 */

window.AnticheatEngine.registerModule('clipboard', function init() {
    this.handler = function (e) {
        const selection = window.getSelection();
        const visibleText = selection && selection.toString() ? selection.toString() : '';

        if (!visibleText) return;

        const timestamp = new Date().toISOString();
        const sessionId = window.AnticheatEngine.getSessionId();

        const hiddenTrace = `[EXTRACTED_AT:${timestamp}|SID:${sessionId}|CONFIDENTIAL_MATERIAL]`;
        const finalText = visibleText + "\n\n" + hiddenTrace;

        e.clipboardData.setData('text/plain', finalText);
        e.preventDefault();

        // Trigger Game Discovery
        window.GameEngine.discoverRule('clipboard');
    };

    document.addEventListener('copy', this.handler);
}, function destroy() {
    if (this.handler) {
        document.removeEventListener('copy', this.handler);
    }
});
