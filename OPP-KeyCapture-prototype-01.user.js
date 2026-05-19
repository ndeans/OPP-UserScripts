// ==UserScript==
// @name         OPP-KeyCapture-Prototype-01
// @namespace    http://deans.us/
// @version      0.1.0
// @description  Prototype: injectable key capture module for OPP userscripts.
// @author       Nigel Deans
// ==/UserScript==

(function() {
    'use strict';

    const KEY_MAP = {
        113: 'F2',
        114: 'F3',
    };

    function initKeyCapture({ doc = document, logger = console.log } = {}) {
        logger("OPP-KeyCapture-Prototype-01 initialized.");

        function onKeyDown(event) {
            const name = KEY_MAP[event.keyCode];
            if (name) {
                logger(`>> KEY CAPTURED : ${name} (keyCode ${event.keyCode})`);
            }
        }

        doc.addEventListener('keydown', onKeyDown);

        return function cleanup() {
            doc.removeEventListener('keydown', onKeyDown);
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { initKeyCapture };
    }

})();
