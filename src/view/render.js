export const render = (state, handlers) => {
  const { onAdd, onRemove, onNext, onPrev } = handlers;

  const citiesList = document.getElementById("cities-list");
  
  citiesList.innerHTML = state.loadedCities.map(city => {
    const isSelected = state.selectedCities.some(c => c.id === city.id);
    return `
      <div class="city-card ${isSelected ? 'added' : 'js-add-city'}" data-id="${city.id}">
        <div class="city-info">
          <h3>${city.name}</h3>
          <p>${city.country} | Pop: ${city.population?.toLocaleString() ?? 'Indisponível'}</p>
        </div>
        <div>${isSelected ? 'selecionada' : 'selecionar'}</div>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".js-add-city").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      const city = state.loadedCities.find(c => String(c.id) === String(id));
      if (city) onAdd(city);
    });
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

  if (state.selectedCities.length === 0) {
    selectedList.innerHTML = '<p class="empty-msg">Nenhuma cidade selecionada.</p>';
  } else {
    selectedList.innerHTML = state.selectedCities.map(city => `
      <div class="city-card" style="border-color: var(--secondary)">
        <div class="city-info">
          <h3>${city.name}</h3>
          <p>Lat: ${city.latitude} | Lon: ${city.longitude}</p>
        </div>
        <button class="btn-remove" data-id="${city.id}">✖</button>
      </div>
    `).join("");

    document.querySelectorAll(".btn-remove").forEach(btn => {
      btn.addEventListener("click", () => onRemove(btn.dataset.id));
    });
  }

  document.getElementById("selected-count").innerText = `${state.selectedCities.length} selecionadas`;
};
