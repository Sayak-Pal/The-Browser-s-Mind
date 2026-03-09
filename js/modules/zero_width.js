/**
 * zero_width.js
 * Injects zero-width characters into protected text elements.
 */

window.AnticheatEngine.registerModule('zerowidth', function init() {

    function stringToHidden(str) {
        return str.split('').map(char => {
            const bin = char.charCodeAt(0).toString(2).padStart(8, '0');
            return bin.split('').map(bit => bit === '1' ? '\u200B' : '\u200C').join('');
        }).join('\u200D');
    }

    function cleanZeroWidth(str) {
        return str.replace(/[\u200B\u200C\u200D]/g, '');
    }

    const sid = window.AnticheatEngine.getSessionId();
    const hiddenPayload = stringToHidden(sid);

    this.protectedElements = document.querySelectorAll('.q-text');

    this.protectedElements.forEach(el => {
        const cleanText = cleanZeroWidth(el.textContent);
        el.textContent = cleanText + hiddenPayload;

        // Discover rule if user selects the text containing the zero width characters
        el.addEventListener('mouseup', () => {
            const selection = window.getSelection().toString();
            if (selection.length > 5) {
                // If they highlighted a substantial portion of the text, trigger discovery
                window.GameEngine.discoverRule('zerowidth');
            }
        });
    });

}, function destroy() {
    this.protectedElements.forEach(el => {
        const cleanText = el.textContent.replace(/[\u200B\u200C\u200D]/g, '');
        el.textContent = cleanText;
    });
});
