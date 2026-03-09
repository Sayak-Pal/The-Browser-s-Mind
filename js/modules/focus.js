/**
 * focus.js
 * Detects tab switching, window blur, and visibility changes.
 */

window.AnticheatEngine.registerModule('focus', function init() {
    this.blurHandler = () => {
        window.GameEngine.discoverRule('focus');
    };

    this.visibilityHandler = () => {
        if (document.hidden) {
            window.GameEngine.discoverRule('focus');
        }
    };

    window.addEventListener('blur', this.blurHandler);
    document.addEventListener('visibilitychange', this.visibilityHandler);

}, function destroy() {
    window.removeEventListener('blur', this.blurHandler);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
});
