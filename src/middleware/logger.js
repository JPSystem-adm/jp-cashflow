// middleware/logger.js

const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

console.log = (...args) => {
  if (!args[0].includes('GET') && !args[0].includes('POST')) {
    originalLog(...args);
  }
};

console.warn = (...args) => {
  originalWarn(...args);
};

console.error = (...args) => {
  originalError(...args);
};
