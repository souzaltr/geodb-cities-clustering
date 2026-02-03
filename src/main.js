import { fetchCities } from "./api/apiService";
import { initialState, reducer } from "./state/store";
import { waitForRateLimit } from "./utils/rateLimiter";
import { render } from "./view/render";
import {fetchCitiesInParallel } from "./utils/fetchParallel";
import { startKmeans } from "./clustering/kmeans";

let state = initialState;

const dispatch = (action) => {
  state = reducer(state, action);

  render(state, handlers);
};

const loadCities = async (offset = 0) => {
    const data = await fetchCities({offset, limit: state.limit});
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

const showClusters = (assignments, k) => {
  const container = document.getElementById("clusters");
  container.innerHTML = "";

  const groups = Array.from({ length: k }, () => []);

  assignments.forEach(a => groups[a.cluster].push(a.index));

  groups.forEach((group, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<h3>Cluster ${i} (${group.length} cidades)</h3>`;
    container.appendChild(div);
  });
};


document.getElementById("btn-process").addEventListener("click", async () => {
    const btn = document.getElementById("btn-process");
    const k = Number(document.getElementById("kValue").value);
    
    btn.disabled = true;
    btn.innerText = "Carregando 10.000 cidades...";
    const { buffer, count} = await fetchCitiesInParallel(200, import.meta.env.VITE_API_KEY);

    btn.innerText = "Dados carregados! Iniciando K-means.";
    const { centroids, assignments } = await startKmeans(buffer, count,k);
    
    console.log("Clusters prontos!", centroids);
    showClusters(assignments, k);
});

loadCities(0);