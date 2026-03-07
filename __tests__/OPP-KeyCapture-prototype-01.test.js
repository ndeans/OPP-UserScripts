const { initKeyCapture } = require("../OPP-KeyCapture-prototype-01.user.js");

function makeEventWithKeyCode(code) {
  const event = new KeyboardEvent("keydown");
  Object.defineProperty(event, "keyCode", { value: code });
  return event;
}

test("logs F2 and F3 when pressed", () => {
  const logs = [];
  const cleanup = initKeyCapture({
    doc: document,
    logger: (msg) => logs.push(msg),
  });

  document.dispatchEvent(makeEventWithKeyCode(113));
  document.dispatchEvent(makeEventWithKeyCode(114));

  cleanup();

  expect(logs).toEqual([
    "OPP-KeyCapture-Prototype-01 initialized.",
    ">> KEY CAPTURED : F2 (keyCode 113)",
    ">> KEY CAPTURED : F3 (keyCode 114)",
  ]);
});

test("does not log for other keys", () => {
  const logs = [];
  const cleanup = initKeyCapture({
    doc: document,
    logger: (msg) => logs.push(msg),
  });

  document.dispatchEvent(makeEventWithKeyCode(65));

  cleanup();

  expect(logs).toEqual(["OPP-KeyCapture-Prototype-01 initialized."]);
});

test("cleanup removes the listener", () => {
  const logs = [];
  const cleanup = initKeyCapture({
    doc: document,
    logger: (msg) => logs.push(msg),
  });

  cleanup();
  document.dispatchEvent(makeEventWithKeyCode(113));

  expect(logs).toEqual(["OPP-KeyCapture-Prototype-01 initialized."]);
});
