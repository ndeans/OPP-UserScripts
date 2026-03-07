// ==UserScript==
// @name         OPP-KeyCapture-Prototype-01
// @namespace    http://deans.us/
// @version      0.1
// @description  Prototype script to capture F2 and F3 keyboard input
// @author       Nigel Deans
// @match        https://www.onepoliticalplaza.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=onepoliticalplaza.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function handleKeydown(event, logger) {
        if (event.keyCode == 113) {
            logger(">> KEY CAPTURED : F2 (keyCode 113)");
        }
        if (event.keyCode == 114) {
            logger(">> KEY CAPTURED : F3 (keyCode 114)");
        }
    }

    function initKeyCapture(options) {
        var opts = options || {};
        var doc = opts.doc || document;
        var logger = opts.logger || console.log;

        logger("OPP-KeyCapture-Prototype-01 initialized.");

        var onKeydown = function(event) {
            handleKeydown(event, logger);
        };

        doc.addEventListener('keydown', onKeydown);

        return function cleanup() {
            doc.removeEventListener('keydown', onKeydown);
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { handleKeydown: handleKeydown, initKeyCapture: initKeyCapture };
    }

    if (typeof module === 'undefined' && typeof document !== 'undefined') {
        initKeyCapture();
    }
})();
