// JSDOM doesn't implement innerText (it needs a CSS layout engine).
// This polyfill maps it to textContent so tests that read visible text work.
Object.defineProperty(HTMLElement.prototype, 'innerText', {
    get() { return this.textContent; },
    set(value) { this.textContent = value; },
    configurable: true,
});
