/**
 * reveal.js
 * Implements a time-bounded reveal for answers.
 */

window.AnticheatEngine.registerModule('reveal', function init() {
    this.activeTimeouts = {};
    const REVEAL_DURATION = 10; // Shorter for game pacing

    this.revealHandler = (e) => {
        if (!e.target.classList.contains('reveal-btn')) return;

        window.GameEngine.discoverRule('reveal'); // Trigger on interaction

        const btn = e.target;
        const targetId = btn.getAttribute('data-target');
        const targetEl = document.getElementById(targetId);
        const timerBadge = document.getElementById('timer-' + targetId);

        if (!targetEl || !timerBadge) return;

        btn.classList.add('hidden');
        targetEl.classList.remove('hidden');
        timerBadge.classList.remove('hidden');

        let timeLeft = REVEAL_DURATION;

        const tick = setInterval(() => {
            timeLeft--;
            timerBadge.textContent = `00:${timeLeft.toString().padStart(2, '0')}`;
            if (timeLeft <= 0) {
                clearInterval(tick);
                targetEl.classList.add('hidden');
                timerBadge.classList.add('hidden');
                btn.classList.remove('hidden');
                btn.textContent = "Memory Faded (Revealed)";
                btn.disabled = true;
            }
        }, 1000);

        this.activeTimeouts[targetId] = tick;
    };

    document.addEventListener('click', this.revealHandler);

    document.querySelectorAll('.reveal-btn').forEach(btn => {
        btn.classList.remove('hidden');
        const targetEl = document.getElementById(btn.getAttribute('data-target'));
        if (targetEl) targetEl.classList.add('hidden');
    });

}, function destroy() {
    document.removeEventListener('click', this.revealHandler);
    Object.values(this.activeTimeouts).forEach(t => clearInterval(t));
    this.activeTimeouts = {};

    document.querySelectorAll('.reveal-btn').forEach(btn => {
        btn.classList.add('hidden');
        const targetEl = document.getElementById(btn.getAttribute('data-target'));
        if (targetEl) targetEl.classList.remove('hidden');
        const timerBadge = document.getElementById('timer-' + btn.getAttribute('data-target'));
        if (timerBadge) timerBadge.classList.add('hidden');
    });
});
