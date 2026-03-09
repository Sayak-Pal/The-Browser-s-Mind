/**
 * noise.js
 * Generates high-frequency visual noise across a full-screen canvas.
 */

window.AnticheatEngine.registerModule('noise', function init() {
    this.canvas = document.getElementById('antiScrapeCanvas');
    if (!this.canvas) return;

    this.canvas.classList.remove('hidden');
    const ctx = this.canvas.getContext('2d');

    const sidHash = window.AnticheatEngine.getSessionId().charCodeAt(4) % 10;

    this.resize = () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    let framesDrawn = 0;
    this.drawNoise = () => {
        if (!this.canvas || this.canvas.classList.contains('hidden')) return;

        const imageData = ctx.createImageData(this.canvas.width, this.canvas.height);
        const buffer = new Uint32Array(imageData.data.buffer);

        for (let i = 0; i < buffer.length; i++) {
            const noiseVal = Math.random() > 0.5 ? 255 : sidHash * 10;
            // Zen blueish tint to the noise
            buffer[i] = (255 << 24) | (200 << 16) | (220 << 8) | noiseVal;
        }
        ctx.putImageData(imageData, 0, 0);

        framesDrawn++;
        // Discover rule after the noise has been active for a bit and user clicks the screen
        if (framesDrawn > 100) {
            this.canvas.addEventListener('click', () => {
                window.GameEngine.discoverRule('noise');
            }, { once: true });
        }
    };

    window.addEventListener('resize', this.resize);
    this.resize();
    this.noiseInterval = setInterval(this.drawNoise, 60);

}, function destroy() {
    window.removeEventListener('resize', this.resize);
    clearInterval(this.noiseInterval);
    if (this.canvas) this.canvas.classList.add('hidden');
});
