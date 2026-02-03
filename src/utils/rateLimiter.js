const MIN_INTERVAL = 1500; // Poderia ser ajustado conforme plano da api, permitindo menos espera entre requests
        
let queue = Promise.resolve();

export const waitForRateLimit = () => {
  queue = queue.then(() =>
    new Promise(resolve => setTimeout(resolve, MIN_INTERVAL))
  );

  return queue;
};
        

