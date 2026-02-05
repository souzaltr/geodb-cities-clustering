import { waitForRateLimit } from "./rateLimiter";

const CITY_FILDS = 4; // tamanho necessário no buffer para (id, lon, lat, pop)

export const kmeansCityMap = new Map();

export const fetchCitiesInParallel = async (totalCities, apiKey) => {
  const limit = 10;
  const totalPages = Math.ceil(totalCities / limit);

  // Plano free tem limite de 1 request por segundo o que limita uso de múltiplos workers de forma eficaz
  const MAX_WORKERS = 1; 
  const pagesPerWorker = Math.ceil(totalPages / MAX_WORKERS);

  const cityBuffer = new SharedArrayBuffer(Float64Array.BYTES_PER_ELEMENT * CITY_FILDS * totalCities);
  const citiesArray = new Float64Array(cityBuffer);

  const indexBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
  const indexCounter = new Int32Array(indexBuffer);
  Atomics.store(indexCounter, 0, 0);

  let finishedWorkers = 0;

  return new Promise((resolve) => {
    for (let i = 0; i < MAX_WORKERS; i++) {
      
      const startPage = i * pagesPerWorker;
      const endPage = Math.min(startPage + pagesPerWorker, totalPages);

      const pages = Array.from({ length: endPage - startPage }, ()=> Math.floor(Math.random() * 5000));
      
      if (startPage >= endPage) continue;

      const worker = new Worker(new URL("../workers/worker.js", import.meta.url), { type: "module" });

      worker.postMessage({
        pages,
        apiKey,
        limit,
        cityBuffer,
        indexBuffer
      });

      worker.onmessage = async (e) => {
        const { type, city } = e.data;

        if (type === "request-permission") {
          await waitForRateLimit();
          worker.postMessage({ type: "granted" });
        }

        if (type === "city-meta") {
          kmeansCityMap.set(city.index, city);
        }

        if (type === "done") {
          finishedWorkers++;
          worker.terminate();

          if (finishedWorkers === MAX_WORKERS) {
            resolve({
              buffer : citiesArray,
              count : Atomics.load(indexCounter, 0)
            });
          }
        }
      };
    }
  });
};
