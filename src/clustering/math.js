export const distance = (city, centroid) => {
  const lat = city.lat - centroid.lat;
  const lon = city.lon - centroid.lon;
  const population = (city.pop - centroid.pop) / 1_000_000; // normalização

  return Math.sqrt(lat*lat + lon*lon + population*population);
};

export const meanPoint = (points) => {
  const sum = points.reduce((acc, p) => ({
    lat: acc.lat + p.lat,
    lon: acc.lon + p.lon,
    pop: acc.pop + p.pop
  }), { lat: 0, lon: 0, pop: 0 });

  return {
    lat: sum.lat / points.length,
    lon: sum.lon / points.length,
    pop: sum.pop / points.length
  };
};
