/**
 * watermark.js
 * Renders a dynamically generated, rotating text canvas overlay to trace screenshots.
 */

window.AnticheatEngine.registerModule('watermark', function init() {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'watermark-layer';
    this.canvas.id = 'activeWatermark';
    document.getElementById('watermarkContainer').appendChild(this.canvas);

    // Zen styling for container
    document.getElementById('watermarkContainer').classList.remove('hidden');

    const ctx = this.canvas.getContext('2d');
    const sid = window.AnticheatEngine.getSessionId();

    this.drawPattern = () => {
        const time = new Date().toISOString().split('T')[1].split('.')[0];
        const text = `ADM-1024 | SID:${sid} | ${time}`;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const pCanvas = document.createElement('canvas');
        pCanvas.width = 300;
        pCanvas.height = 150;
        const pCtx = pCanvas.getContext('2d');

        pCtx.font = "14px 'Fira Code', monospace";
        pCtx.fillStyle = "rgba(56, 189, 248, 0.15)"; // Sky Blue zen tone
        pCtx.translate(0, 75);
        pCtx.rotate(-Math.PI / 6);
        pCtx.fillText(text, 0, 0);
        pCtx.fillText(text, 150, 75);

        const pattern = ctx.createPattern(pCanvas, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };

    let resizeCount = 0;
    this.resizeData = () => {
        this.canvas.width = window.innerWidth * 1.5;
        this.canvas.height = window.innerHeight * 1.5;
        this.drawPattern();

        // Discover rule if user resizes window significantly
        resizeCount++;
        if (resizeCount > 2) {
            window.GameEngine.discoverRule('watermark');
        }
    };

    window.addEventListener('resize', this.resizeData);
    this.resizeData();
    this.interval = setInterval(this.drawPattern, 60000);

}, function destroy() {
    window.removeEventListener('resize', this.resizeData);
    clearInterval(this.interval);
    const canvas = document.getElementById('activeWatermark');
    if (canvas) canvas.remove();
    document.getElementById('watermarkContainer').classList.add('hidden');
});
