const CITY_FIELDS = 4; // lat, lon, pop, id

const createRandomCentroids = (citiesArray, count, k) => {
  const centroids = [];
  const used = new Set();

  while (centroids.length < k) {
    const idx = Math.floor(Math.random() * count);
    if (used.has(idx)) continue;
    used.add(idx);

    const base = idx * CITY_FIELDS;

    centroids.push({
      lat: citiesArray[base],
      lon: citiesArray[base + 1],
      pop: citiesArray[base + 2]
    });
  }
  return centroids;
};

const recomputeCentroids = (citiesArray, assignments, k) => {
  const clusters = Array.from({ length: k }, () => []);

  assignments.forEach(({ index, cluster }) => {
    const base = index * CITY_FIELDS;
    clusters[cluster].push({
      lat: citiesArray[base],
      lon: citiesArray[base+1],
      pop: citiesArray[base+2]
    });
  });

  return clusters.map(cluster => {
    if (cluster.length === 0) return null;

    const sum = cluster.reduce((acc, c) => ({
      lat: acc.lat+c.lat,
      lon: acc.lon+c.lon,
      pop: acc.pop+c.pop
    }), { lat: 0, lon: 0, pop: 0 });

    return {
      lat: sum.lat/cluster.length,
      lon: sum.lon/cluster.length,
      pop: sum.pop/cluster.length
    };
  });
};

const centroidsChanged = (a, b) => {
  if (!a || !b) return true;
  return a.some((c, i) =>
    !b[i] ||
    Math.abs(c.lat - b[i].lat) > 0.0001 ||
    Math.abs(c.lon - b[i].lon) > 0.0001 ||
    Math.abs(c.pop - b[i].pop) > 1
  );
};

export const startKmeans = async (citiesBuffer, count, k) => {
  const citiesArray = new Float64Array(citiesBuffer);

  const MAX_WORKERS = navigator.hardwareConcurrency || 4;
  const workers = [];
  const chunkSize = Math.ceil(count/MAX_WORKERS);

  let centroids = createRandomCentroids(citiesArray, count, k);
  let assignments = [];
  let iteration = 0;
  const MAX_ITER = 10;

  while (iteration < MAX_ITER) {
    iteration++;

    const promises = [];

    for (let i = 0; i < MAX_WORKERS; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, count);
      if (start >= end) continue;

      const worker = new Worker(new URL("../workers/kmeansWorker.js", import.meta.url), { type: "module" });

      workers.push(worker);

      promises.push(new Promise(resolve => {
        worker.onmessage = (e) => resolve(e.data);

        worker.postMessage({
          citiesBuffer,
          start,
          end,
          centroids
        });
      }));
    }

    const results = await Promise.all(promises);
    assignments = results.flat();

    workers.forEach(w => w.terminate());
    workers.length = 0;

    const newCentroids = recomputeCentroids(citiesArray, assignments, k);

    if (!centroidsChanged(centroids, newCentroids)) break;

    centroids = newCentroids;
  }
  return { centroids, assignments };
};
