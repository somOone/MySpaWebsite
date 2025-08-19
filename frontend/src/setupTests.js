import '@testing-library/jest-dom';

// Mock Web Speech API
Object.defineProperty(window, 'SpeechRecognition', {
  value: class SpeechRecognition {
    constructor() {
      this.start = jest.fn();
      this.stop = jest.fn();
      this.abort = jest.fn();
      this.onresult = null;
      this.onerror = null;
      this.onstart = null;
      this.onend = null;
    }
  }
});

Object.defineProperty(window, 'SpeechSynthesis', {
  value: class SpeechSynthesis {
    constructor() {
      this.speak = jest.fn();
      this.cancel = jest.fn();
      this.pause = jest.fn();
      this.resume = jest.fn();
      this.onvoiceschanged = null;
    }
  }
});

Object.defineProperty(window, 'speechSynthesis', {
  value: new window.SpeechSynthesis()
});

// Mock window.location
delete window.location;
window.location = {
  href: '',
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn()
};

// Mock fetch globally
global.fetch = jest.fn();

// Mock Element.scrollIntoView used in ChatBot
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = jest.fn();
}

// Mock ResizeObserver for components relying on it (e.g., Recharts ResponsiveContainer)
if (typeof window.ResizeObserver === 'undefined') {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // eslint-disable-next-line no-undef
  window.ResizeObserver = ResizeObserverMock;
  // Some libs might access it from global
  // eslint-disable-next-line no-undef
  global.ResizeObserver = ResizeObserverMock;
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

