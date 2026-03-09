/**
 * layout_shift.js
 * Disrupts static frame scraping by applying sub-pixel jitter.
 */

window.AnticheatEngine.registerModule('layout-shift', function init() {
    this.container = document.getElementById('contentContainer');
    if (!this.container) return;

    this.jitter = setInterval(() => {
        const xOffsets = ["0.5px", "-0.5px", "0px", "1px", "-1px"];
        const yOffsets = ["0px", "-0.5px", "0.5px"];

        const x = xOffsets[Math.floor(Math.random() * xOffsets.length)];
        const y = yOffsets[Math.floor(Math.random() * yOffsets.length)];

        this.container.style.transform = `translate(${x}, ${y})`;
        // Slight opacity jitter instead of color for Zen theme
        this.container.style.opacity = Math.random() > 0.8 ? "0.95" : "1";
    }, 2000);

    // Provide a way for the user to "discover" this rule by hovering over the jittering container for 3 seconds
    let hoverTimer;
    this.mouseEnter = () => {
        hoverTimer = setTimeout(() => {
            window.GameEngine.discoverRule('layout-shift');
        }, 3000);
    };
    this.mouseLeave = () => clearTimeout(hoverTimer);

    this.container.addEventListener('mouseenter', this.mouseEnter);
    this.container.addEventListener('mouseleave', this.mouseLeave);

}, function destroy() {
    clearInterval(this.jitter);
    if (this.container) {
        this.container.style.transform = `translate(0, 0)`;
        this.container.style.opacity = "1";
        this.container.removeEventListener('mouseenter', this.mouseEnter);
        this.container.removeEventListener('mouseleave', this.mouseLeave);
    }
});
