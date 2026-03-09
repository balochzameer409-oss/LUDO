
/**
 * dice-sync.js
 * Bridges the original ludo.js with the new corner dice UI.
 * 
 * Colors map:  0=green, 1=red, 2=blue, 3=yellow
 * Corner IDs:  corner-0(green), corner-1(red), corner-2(blue), corner-3(yellow)
 */

(function () {

    const colorNames = ['green', 'red', 'blue', 'yellow'];
    const cornerMsgs = {
        0: 'Your Turn!',
        1: 'Your Turn!',
        2: 'Your Turn!',
        3: 'Your Turn!'
    };

    // --- Activate a corner (glow + enable dice) ---
    function activateCorner(playerId) {
        for (let i = 0; i < 4; i++) {
            const corner = document.getElementById('corner-' + i);
            const dice   = document.getElementById('dice-' + i);
            const cmsg   = document.getElementById('cmsg-' + i);
            if (!corner || !dice) continue;

            if (i === playerId) {
                corner.classList.add('my-turn');
                dice.classList.remove('disabled');
                dice.classList.add('active');
                if (cmsg) cmsg.textContent = '⚡ Your Turn!';
            } else {
                corner.classList.remove('my-turn');
                dice.classList.add('disabled');
                dice.classList.remove('active');
                if (cmsg) cmsg.textContent = 'Waiting...';
            }
        }
    }

    // --- Update dice face on a corner ---
    function updateCornerDice(playerId, num) {
        const dice = document.getElementById('dice-' + playerId);
        if (!dice) return;
        dice.setAttribute('data-num', '0'); // گھومتے وقت نمبر چھپاؤ
        dice.classList.add('rolling');
        setTimeout(() => {
            dice.setAttribute('data-num', num);
            dice.classList.remove('rolling');
        }, 350);
    }

    // -------------------------------------------------------
    // WATCH the hidden #randomButt for class changes
    // (ludo.js calls styleButton() which adds/removes 'disabled'/'active')
    // -------------------------------------------------------
    const hiddenButt = document.getElementById('randomButt');
    if (hiddenButt) {
        const observer = new MutationObserver(() => {
            const myPlayerId = window.myid !== undefined ? Number(window.myid) : -1;
            if (myPlayerId < 0) return;

            const isActive = !hiddenButt.classList.contains('disabled');
            if (isActive) {
                activateCorner(myPlayerId);
            }
        });
        observer.observe(hiddenButt, { attributes: true, attributeFilter: ['class'] });
    }

    // numObserver ہٹا دیا — rolled-dice socket سے directly update ہوگا

    // -------------------------------------------------------
    // Wire each corner dice click -> trigger hidden randomButt click
    // (Only the active one matters)
    // -------------------------------------------------------
    for (let i = 0; i < 4; i++) {
        const dice = document.getElementById('dice-' + i);
        if (!dice) continue;
        dice.addEventListener('click', function () {
            if (this.classList.contains('disabled')) return;
            // Trigger the original ludo.js click handler
            const original = document.getElementById('randomButt');
            if (original) original.click();
        });
    }

    // -------------------------------------------------------
    // Listen for 'rolled-dice' via socket to show number on ALL corners
    // (so other players see what was rolled)
    // -------------------------------------------------------
    // We hook into the outputMessage function to detect turns changing
    // by patching window after ludo.js loads

    window.addEventListener('load', () => {
        // Patch styleButton to sync corners
        const origStyleButton = window.styleButton;
        if (typeof origStyleButton === 'function') {
            window.styleButton = function (k) {
                origStyleButton(k);
                const myPlayerId = window.myid !== undefined ? Number(window.myid) : -1;
                if (myPlayerId >= 0) {
                    if (k === 1) activateCorner(myPlayerId);
                    else {
                        // Disable only MY corner, others stay as they are
                        const myCorner = document.getElementById('corner-' + myPlayerId);
                        const myDice   = document.getElementById('dice-' + myPlayerId);
                        if (myCorner) myCorner.classList.remove('my-turn');
                        if (myDice)   { myDice.classList.add('disabled'); myDice.classList.remove('active'); }
                    }
                }
            };
        }

        // updateDice already handles corner dice in main.js - no double update needed
    });

    // -------------------------------------------------------
    // Show rolled number on other players' corners too
    // Hook into socket events after page load
    // -------------------------------------------------------
    window.addEventListener('load', () => {
        // Give ludo.js time to initialize socket
        setTimeout(() => {
            if (window.socket) {
                window.socket.on('rolled-dice', function (data) {
                    const pid = Number(data.id);
                    if (data.num) updateCornerDice(pid, data.num);
                    // Show active corner for the roller
                    const corner = document.getElementById('corner-' + pid);
                    if (corner) corner.classList.add('my-turn');
                    const dice = document.getElementById('dice-' + pid);
                    if (dice) { dice.classList.remove('disabled'); dice.classList.add('active'); }
                    const cmsg = document.getElementById('cmsg-' + pid);
                    if (cmsg) cmsg.textContent = '🎲 Rolled ' + data.num + '!';
                });

                // On turn change (chance socket event), activate correct corner
                window.socket.on('chance', function (data) {
                    const nxt = Number(data.nxt_id);
                    // Deactivate all first
                    for (let i = 0; i < 4; i++) {
                        const c = document.getElementById('corner-' + i);
                        const d = document.getElementById('dice-' + i);
                        const m = document.getElementById('cmsg-' + i);
                        if (c) c.classList.remove('my-turn');
                        if (d) { d.classList.add('disabled'); d.classList.remove('active'); }
                        if (m) m.textContent = 'Waiting...';
                    }
                    // Activate next player's corner
                    const nc = document.getElementById('corner-' + nxt);
                    const nd = document.getElementById('dice-' + nxt);
                    const nm = document.getElementById('cmsg-' + nxt);
                    if (nc) nc.classList.add('my-turn');
                    if (nd) { nd.classList.remove('disabled'); nd.classList.add('active'); }
                    if (nm) nm.textContent = '⚡ Your Turn!';
                });
            }
        }, 2000);
    });

})();