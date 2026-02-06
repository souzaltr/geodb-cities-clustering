
import { initialState, reducer } from "./state/store";
import { waitForRateLimit } from "./utils/rateLimiter";
import { render } from "./view/render";
import {fetchCitiesInParallel, kmeansCityMap } from "./utils/fetchParallel";
import { startKmeans } from "./clustering/kmeans";
import { fetchCities } from "./services/apiService";

let state = initialState;

export const addCitiesToStore = (cities) => {
  cities.forEach(c => cityMap.set(Number(c.id), c));
};

export const getCityById = (id) => cityMap.get(Number(id));


const dispatch = (action) => {
  state = reducer(state, action);

  render(state, handlers);
};

let currentSearch = "";
let searchTimeout;

const searchInput = document.getElementById("city-search");
searchInput.addEventListener("input", async (e) => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async () => {
    currentSearch = e.target.value;
    await waitForRateLimit();
    loadCities(0);
  }, 500);
});

const loadCities = async (offset = 0) => {
    const data = await fetchCities({offset, limit: state.limit, search: currentSearch});
    dispatch({ type: "SET_DATA", payload: data });
};

const handlers = {
    onAdd: (city) => {
        dispatch({ type: "ADD_CITY", payload: city });
    },
    onRemove: (cityId) => {
        dispatch({ type: "REMOVE_CITY", payload: cityId });
    },
    onNext: async () => {
        await waitForRateLimit();
        loadCities(state.currentOffset + state.limit);
    },

    onPrev: async () => {
        await waitForRateLimit();
        loadCities(state.currentOffset - state.limit);
    }
};

const showClusters = (assignments, k, cityMap) => {
  const container = document.getElementById("clusters");
  container.innerHTML = "";

  const groups = Array.from({ length: k }, () => []);
  assignments.forEach(a => groups[a.cluster].push(a.index));

  groups.forEach((group, i) => {
    const div = document.createElement("div");
    div.className = "cluster-card";

    const title = document.createElement("h3");
    title.textContent = `Cluster ${i} (${group.length} cidades)`;

    const list = document.createElement("ul");

    const BATCH_SIZE = 20;
    let rendered = 0;
    let loadBtn = null; 

    const renderMore = () => {
      const nextItems = group.slice(rendered, rendered + BATCH_SIZE);

      nextItems.forEach(index => {
        const city = cityMap.get(index);
        if (!city) return;

        const li = document.createElement("li");
        li.textContent = `${city.name} - ${city.country}`;
        list.appendChild(li);
      });

      rendered += nextItems.length;

      if (rendered >= group.length && loadBtn) {
        loadBtn.remove();
      } else if (loadBtn) {
        loadBtn.textContent = `Carregar mais (${group.length - rendered} restantes)`;
      }
    };

    div.appendChild(title);
    div.appendChild(list);

    if (group.length > BATCH_SIZE) {
      loadBtn = document.createElement("button");
      loadBtn.className = "btn-secondary";
      loadBtn.onclick = renderMore;
      div.appendChild(loadBtn);
    }

    container.appendChild(div);

    renderMore();
  });

  renderChart(groups.map(g => g.length));
};

let chart;

const renderChart = (sizes) => {
  const ctx = document.getElementById("clusterChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: sizes.map((_, i) => `Cluster ${i}`),
      datasets: [{
        label: "Número de Cidades",
        data: sizes
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
};

document.getElementById("btn-process").addEventListener("click", async () => {
    const btn = document.getElementById("btn-process");
    const k = Number(document.getElementById("kValue").value);
    
    if(!k || k <= 1){
      alert("Valor de K de ser maior que 1");
      return;
    }

    btn.disabled = true;
    btn.innerText = "Carregando as cidades para K-means";
    
    const res = await fetch("http://backend:3001/cities");
    const cities = await res.json();

    const CITY_FIELDS = 4;
    const buffer = new SharedArrayBuffer(Float64Array.BYTES_PER_ELEMENT * CITY_FIELDS * cities.length);
    const citiesArray = new Float64Array(buffer);

    const kmeansCityMap = new Map();

    cities.forEach((city, i) => {
    const base = i * CITY_FIELDS;
    citiesArray[base]     = city.latitude;
    citiesArray[base + 1] = city.longitude;
    citiesArray[base + 2] = city.population || 0;
    citiesArray[base + 3] = city.id;

    kmeansCityMap.set(i, {
      name: city.name,
      country: city.countryCode
    });
    });

    const count = cities.length;
    
    if(count < k){
      alert(`Número de cidades carregadas (${count}) é menor que K (${k}).`);
      btn.disabled = false;
      btn.innerText = "Processar cidades";
      return;
    }

    btn.innerText = "Dados carregados! Iniciando K-means";
    const { centroids, assignments } = await startKmeans(buffer, count,k, state.selectedCities);
    
    btn.disabled = false;
    btn.innerText = "Processar cidades";

    showClusters(assignments, k, kmeansCityMap);
});

document.getElementById("select-page").onclick = () => {
  state.loadedCities.forEach(city => {
    dispatch({ type: "ADD_CITY", payload: city });
  });
};

document.getElementById("clear-page").onclick = () => {
  state.loadedCities.forEach(city => {
    dispatch({ type: "REMOVE_CITY", payload: city.id });
  });
};

document.getElementById("clear-all").onclick = () => {
  state.selectedCities.forEach(city => {
    dispatch({ type: "REMOVE_CITY", payload: city.id });
  });
};

loadCities(0);
