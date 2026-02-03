const BASE_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities";

async function fetchCitiesPage(apiKey, limit, offset) {
  const res = await fetch(`${BASE_URL}?limit=${limit}&offset=${offset}&types=CITY&sort=-population`, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
    }
  });

  if (!res.ok) throw new Error("HTTP " + res.status);

  const json = await res.json();
  return json.data || [];
}


const requestPermission = () =>
  new Promise((resolve) => {
    
    const handler = (e) => {
      if (e.data.type === "granted") {
        self.removeEventListener("message", handler);
        resolve();
      }

    };

    self.addEventListener("message", handler);
    postMessage({ type: "request-permission" });
  });

self.onmessage = async (e) => {
  const data = e.data;

  if (data.type === "granted") return;

  const { pages, apiKey, limit, cityBuffer, indexBuffer } = data;

  if (!pages || !Array.isArray(pages)) return;

  const citiesArray = new Float64Array(cityBuffer);
  const indexCounter = new Int32Array(indexBuffer);

  for (const page of pages) {
    await requestPermission();

    try {
      const cities = await fetchCitiesPage(apiKey, limit, page * limit);

      for (const city of cities) {
        const writeIndex = Atomics.add(indexCounter, 0, 1);

        if (writeIndex >= citiesArray.length / 4) break;

        const base = writeIndex * 4;
        citiesArray[base]     = city.latitude;
        citiesArray[base + 1] = city.longitude;
        citiesArray[base + 2] = city.population || 0;
        citiesArray[base + 3] = city.id;
      }

    } catch (err) {
      console.error("Erro ao tentar obter dados na página ", page, err.message);
    }
  }

  postMessage({ type: "done" });
};
