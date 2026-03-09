/**
 * dice-sync-offline.js
 * آف لائن گیم کے لیے corner dice UI
 * کوئی socket نہیں — صرف direct UI update
 */

(function () {

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

    // --- Corner dice پر نمبر دکھاؤ ---
    function updateCornerDice(playerId, num) {
        const dice = document.getElementById('dice-' + playerId);
        if (!dice) return;
        dice.setAttribute('data-num', '0'); // گھومتے وقت خالی
        dice.classList.add('rolling');
        setTimeout(() => {
            dice.setAttribute('data-num', num);
            dice.classList.remove('rolling');
        }, 350);
    }

    // --- ludo-offline.js کے functions patch کرو ---
    window.addEventListener('load', () => {

        // updateDiceUI patch — جب بھی dice roll ہو
        const origUpdateDiceUI = window.updateDiceUI;
        if (typeof origUpdateDiceUI === 'function') {
            window.updateDiceUI = function (id, num) {
                origUpdateDiceUI(id, num);        // اصل function چلاؤ
                updateCornerDice(id, num);         // corner dice بھی update
            };
        }

        // activateChance patch — جب باری بدلے
        const origActivateChance = window.activateChance;
        if (typeof origActivateChance === 'function') {
            window.activateChance = function () {
                origActivateChance();
                var currentChance = window.chance !== undefined ? Number(window.chance) : -1;
                if (currentChance >= 0) activateCorner(currentChance);
            };
        }

    });

    // --- Corner dice click → اصل dice click ---
    for (let i = 0; i < 4; i++) {
        const dice = document.getElementById('dice-' + i);
        if (!dice) continue;
        dice.addEventListener('click', function () {
            if (this.classList.contains('disabled')) return;
            const original = document.getElementById('randomButt');
            if (original) original.click();
        });
    }

})();
