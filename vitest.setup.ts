import "@testing-library/jest-dom/vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverMock;

const requestSubmitShim = function requestSubmit(this: HTMLFormElement) {
  this.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
};
const submitShim = function submit(this: HTMLFormElement) {
  this.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
};

if (typeof HTMLFormElement !== "undefined") {
  Object.defineProperty(HTMLFormElement.prototype, "requestSubmit", {
    value: requestSubmitShim,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(HTMLFormElement.prototype, "submit", {
    value: submitShim,
    configurable: true,
    writable: true,
  });
}

if (typeof window !== "undefined" && window.HTMLFormElement) {
  Object.defineProperty(window.HTMLFormElement.prototype, "requestSubmit", {
    value: requestSubmitShim,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window.HTMLFormElement.prototype, "submit", {
    value: submitShim,
    configurable: true,
    writable: true,
  });
}
