/**
 * randomization.js
 * Scrambles question options order using Fisher-Yates shuffle.
 */

window.AnticheatEngine.registerModule('random', function init() {

    function sfc32(a, b, c, d) {
        return function () {
            a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
            var t = (a + b | 0) + d | 0;
            d = d + 1 | 0;
            a = b ^ b >>> 9;
            b = c + (c << 3) | 0;
            c = c << 21 | c >>> 11;
            c = c + t | 0;
            return (t >>> 0) / 4294967296;
        }
    }

    const sid = window.AnticheatEngine.getSessionId();
    let seed1 = 0, seed2 = 0, seed3 = 0, seed4 = 0;
    for (let i = 0; i < sid.length; i++) {
        seed1 ^= sid.charCodeAt(i) << (i % 4) * 8;
        seed2 ^= sid.charCodeAt(i) << ((i + 1) % 4) * 8;
        seed3 ^= sid.charCodeAt(i) << ((i + 2) % 4) * 8;
        seed4 ^= sid.charCodeAt(i) << ((i + 3) % 4) * 8;
    }

    const random = sfc32(seed1, seed2, seed3, seed4);

    this.groups = document.querySelectorAll('.answers-group');

    this.groups.forEach(group => {
        const options = Array.from(group.children);

        if (!group.originalOrder) {
            group.originalOrder = [...options];
        }

        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }

        options.forEach(opt => group.appendChild(opt));

        // Discover rule when user clicks any of the randomized options
        options.forEach(opt => {
            opt.addEventListener('click', () => {
                window.GameEngine.discoverRule('random');
            });
        });
    });

}, function destroy() {
    this.groups.forEach(group => {
        if (group.originalOrder) {
            group.originalOrder.forEach(opt => group.appendChild(opt));
        }
    });
});
