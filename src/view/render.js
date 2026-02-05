export const render = (state, handlers) => {
  const { onAdd, onRemove, onNext, onPrev } = handlers;

  const citiesList = document.getElementById("cities-list");
  
  citiesList.innerHTML = "";

state.loadedCities.forEach(city => {
  const isSelected = state.selectedCities.some(c => c.id === city.id);

  const cityRow = document.createElement("div");
  cityRow.className = "city-item";

  const info = document.createElement("div");
  info.className = "city-info";

  const name = document.createElement("div");
  name.className = "city-name";
  name.textContent = `${city.name} - ${city.country}`;

  const pop = document.createElement("div");
  pop.className = "city-pop";
  pop.textContent = `População: ${city.population?.toLocaleString() ?? 'Indisponível'}`;

  info.appendChild(name);
  info.appendChild(pop);

  const btn = document.createElement("button");
  btn.className = isSelected ? "btn-selected" : "btn-select";
  btn.textContent = isSelected ? "Selecionada ✓" : "Selecionar";

  btn.onclick = () => {
    if (isSelected) {
      onRemove(city.id);
    } else {
      onAdd(city);
    }
  };

  cityRow.appendChild(info);
  cityRow.appendChild(btn);
  citiesList.appendChild(cityRow);
});

  const pagination = document.getElementById("pagination");

  const currentPage = Math.floor(state.currentOffset / state.limit) + 1;
  const hasNext = state.currentOffset + state.limit < state.total;
  const hasPrev = state.currentOffset > 0;

  pagination.innerHTML = `
    <button id="btn-prev" ${!hasPrev ? "disabled" : ""}>⬅ Anterior</button>
    <span>Pág ${currentPage}</span>
    <button id="btn-next" ${!hasNext ? "disabled" : ""}>Próxima ➡</button>
  `;

  if (hasPrev) document.getElementById("btn-prev").onclick = onPrev;
  if (hasNext) document.getElementById("btn-next").onclick = onNext;

  const selectedList = document.getElementById("selected-list");

  selectedList.innerHTML = "";

  state.selectedCities.forEach(city => {
    const row = document.createElement("div");
    row.className = "selected-city-item";

    const info = document.createElement("span");
    info.textContent = `${city.name} - ${city.countryCode}`;

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove";
    removeBtn.textContent = "✕";
    removeBtn.onclick = () => handlers.onRemove(city.id);

    row.appendChild(info);
    row.appendChild(removeBtn);
    selectedList.appendChild(row);
  });

  document.getElementById("selected-count").innerText = `${state.selectedCities.length} selecionadas`;
};
