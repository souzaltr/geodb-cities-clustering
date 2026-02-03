let lastTime = 0;
const MIN_INTERVAL = 1100; // Poderia ser ajustado conforme plano da api, permitindo menos espera entre requests

  export const waitForRateLimit = () => {
  return new Promise((resolve) => {
    const now = Date.now();
    const wait = Math.max(0, MIN_INTERVAL - (now - lastTime));

    setTimeout(() => {
      lastTime = Date.now();
      resolve();
    }, wait);
  });
};
