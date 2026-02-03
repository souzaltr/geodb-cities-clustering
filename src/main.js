import { fetchCities } from "./api/apiService";
import { initialState, reducer } from "./state/store";
import { render } from "./view/render";
import {fetchCitiesInParallel } from "./utils/fetchParallel";

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
    onNext: () => {
        loadCities(state.currentOffset + state.limit);
    },

    onPrev: () => {
        loadCities(state.currentOffset - state.limit);
    }
};

document.getElementById("btn-process").addEventListener("click", async () => {
  const btn = document.getElementById("btn-process");


  btn.disabled = true;
  btn.innerText = "Carregando 10.000 cidades...";

  const { buffer, count} = await fetchCitiesInParallel(90, import.meta.env.VITE_API_KEY);

  console.log("Total carregado:", count);

  btn.innerText = "Dados carregados! Iniciando K-means.";
});

loadCities(0);