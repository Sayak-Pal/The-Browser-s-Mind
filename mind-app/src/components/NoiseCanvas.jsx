import { useRef, useEffect } from 'react';

export function NoiseCanvas({ onDiscover }) {
    const canvasRef = useRef(null);
    const discoveredRef = useRef(false);
    const rafRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // ✅ requestAnimationFrame instead of setInterval — frame-perfect, auto-pauses when tab hidden
        const drawNoise = () => {
            if (canvas.width > 0 && canvas.height > 0) {
                const imageData = ctx.createImageData(canvas.width, canvas.height);
                const buffer = new Uint32Array(imageData.data.buffer);

                for (let i = 0; i < buffer.length; i++) {
                    // Sparse pink/white static ~5% density
                    buffer[i] = Math.random() > 0.95
                        ? (0xff << 24) | (0xff << 16) | (0xc8 << 8) | 0xff
                        : 0;
                }
                ctx.putImageData(imageData, 0, 0);
            }
            rafRef.current = requestAnimationFrame(drawNoise);
        };

        rafRef.current = requestAnimationFrame(drawNoise);

        const handleClick = () => {
            if (!discoveredRef.current) {
                discoveredRef.current = true;
                onDiscover('noise');
            }
        };
        canvas.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('click', handleClick);
            cancelAnimationFrame(rafRef.current); // ✅ clean cancel
        };
    }, [onDiscover]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[5] opacity-20 cursor-crosshair mix-blend-screen"
        />
    );
}
