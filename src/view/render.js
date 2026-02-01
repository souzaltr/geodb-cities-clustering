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

  document.getElementById("total-results").innerText = `Total: ${state.total}`;
  document.getElementById("selected-count").innerText = `${state.selectedCities.length} selecionadas`;
};
