import { useEffect, useRef } from 'react';

export function useAntiCheat(discoverRule, isGameActive) {
    const listenersBound = useRef(false);

    useEffect(() => {
        if (!isGameActive || listenersBound.current) return;

        // --- 1. Clipboard Intercept ---
        const handleCopy = (e) => {
            e.preventDefault();
            const selection = document.getSelection().toString();
            const payload = selection + '\n\n[SID:ZEN-9402|CONFIDENTIAL_MATERIAL]';
            if (e.clipboardData) {
                e.clipboardData.setData('text/plain', payload);
            }
            discoverRule('clipboard');
        };
        document.addEventListener('copy', handleCopy);

        // --- 2. Focus / Tab-switch Detection ---
        // ✅ Uses visibilitychange (reliable: fires on Alt+Tab, browser minimize, other tab)
        //    PLUS document mouseleave (mouse exits viewport = user going to address bar / another app)
        // ❌ Removed window.blur — too noisy (fires on canvas clicks, iframe focus, devtools)
        const focusDiscoveredRef = { current: false };

        const handleVisibilityChange = () => {
            if (document.hidden && !focusDiscoveredRef.current) {
                focusDiscoveredRef.current = true;
                discoverRule('focus');
            }
        };

        // Fires when mouse cursor leaves the browser viewport entirely
        const handleMouseLeaveViewport = (e) => {
            // Only count if mouse leaves via top edge (to address bar) or any edge
            // relatedTarget === null means cursor left the document
            if (e.relatedTarget === null && !focusDiscoveredRef.current) {
                focusDiscoveredRef.current = true;
                discoverRule('focus');
            }
        };

        // Small delay on mount so page load focus events don't trigger it immediately
        const focusTimer = setTimeout(() => {
            document.addEventListener('visibilitychange', handleVisibilityChange);
            document.addEventListener('mouseleave', handleMouseLeaveViewport);
        }, 1500);

        // --- 3. DevTools Detection ---
        // Checks viewport width delta every second
        let dtDiscovered = false;
        const dtInterval = setInterval(() => {
            const threshold = 160;
            const widthDiff = window.outerWidth - window.innerWidth > threshold;
            const heightDiff = window.outerHeight - window.innerHeight > threshold;
            if ((widthDiff || heightDiff) && !dtDiscovered) {
                dtDiscovered = true;
                discoverRule('devtools');
            }
        }, 1000);

        // --- 4. Zero Width Steganography ---
        // Triggers when user selects a meaningful amount of text (50+ chars catches the full paragraph)
        const zwDiscovered = { current: false };
        const handleSelection = () => {
            const sel = window.getSelection()?.toString() ?? '';
            if (sel.length > 30 && !zwDiscovered.current) {
                zwDiscovered.current = true;
                discoverRule('zerowidth');
            }
        };
        document.addEventListener('selectionchange', handleSelection);

        listenersBound.current = {
            cleanup: () => {
                document.removeEventListener('copy', handleCopy);
                document.removeEventListener('selectionchange', handleSelection);
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                document.removeEventListener('mouseleave', handleMouseLeaveViewport);
                clearInterval(dtInterval);
                clearTimeout(focusTimer);
            }
        };

        return () => {
            if (listenersBound.current?.cleanup) listenersBound.current.cleanup();
            listenersBound.current = false;
        };
    }, [isGameActive, discoverRule]);
}
