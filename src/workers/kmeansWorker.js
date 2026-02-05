self.onmessage = (e) => {
  const { citiesBuffer, start, end, centroids } = e.data;

  const cities = new Float64Array(citiesBuffer);
  const results = [];

  for (let i = start; i < end; i++) {
    const base = i * 4;

    const city = {
      lat: cities[base],
      lon: cities[base + 1],
      pop: cities[base + 2]
    };

    let minDist = Infinity;
    let cluster = 0;

    centroids.forEach((c, idx) => {
      if(!c) return;

      const lat = city.lat - c.lat;
      const lon = city.lon - c.lon;
      const population = (city.pop - c.pop) / 1_000_000;

      const dist = Math.sqrt(lat*lat + lon*lon + population*population);
      if (dist < minDist) {
        minDist = dist;
        cluster = idx;
      }
    });

    results.push({ index: i, cluster });
  }

  postMessage(results);
};
