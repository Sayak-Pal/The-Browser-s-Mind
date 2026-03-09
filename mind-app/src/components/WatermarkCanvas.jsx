import { useRef, useEffect } from 'react';

export function WatermarkCanvas({ onDiscover }) {
    const canvasRef = useRef(null);
    const discoveredRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let animationId;
        let resizeTimer;

        const draw = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const session = "ZEN-9402";
            const time = new Date().toLocaleTimeString();
            const text = `[ID:${session}] ${time}`;

            ctx.font = '24px monospace';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'; // Very faint

            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-Math.PI / 4);
            ctx.textAlign = 'center';

            // Draw grid
            for (let x = -canvas.width; x < canvas.width; x += 300) {
                for (let y = -canvas.height; y < canvas.height; y += 150) {
                    ctx.fillText(text, x, y);
                }
            }
            ctx.restore();
        };

        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (!discoveredRef.current) {
                    discoveredRef.current = true;
                    onDiscover('watermark');
                }
            }, 500);
            draw();
        };

        window.addEventListener('resize', handleResize);

        // Initial draw
        const initTimer = setTimeout(draw, 100);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimer);
            clearTimeout(initTimer);
            cancelAnimationFrame(animationId);
        };
    }, [onDiscover]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-10 mix-blend-overlay"
        />
    );
}
