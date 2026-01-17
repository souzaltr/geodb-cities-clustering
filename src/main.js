import {ApiClient, GeoApi } from 'wft-geodb-js-client';

// API CONFIG
const apiKey = import.meta.env.VITE_API_KEY;

const defaultCLient = ApiClient.instance;
const UserSecurity = defaultCLient.authentications['UserSecurity'];
UserSecurity.apiKey = apiKey;

const geoDb = new GeoApi(defaultCLient);

// Estado da aplicação
const state = {
    offset: 0,   // Vai ser o deslocamento na paginação
    limit: 10,  // Quantidade por página
    loadedCities: [], // Cidades carregadas (à esquerda)
    selectedCities: [] // Cidades selecionadas (à direita)
};

const isCitySelected = (cityId, selectedCities) => {
    return selectedCities.some(city => city.id === cityId);
};

const loadCities = async () =>{
    const btn = document.getElementById('btn-load');
    btn.disabled = true;

    try {
        const opts = {
            limit : state.limit,
            offset : state.offset,
            types : 'CITY',
            sort : 'name' 
        };

        const response = await geoDb.findCitiesUsingGET(opts);
        const cities = response.data || [];

        state.loadedCities = [...state.loadedCities, ...cities];

        state.offset += state.limit;

        render();
    } catch (error) {
        console.error('Houve um erro ao carregar as cidades:', error);
    } finally {
        btn.disabled = false;
    }
};

const selectCities = (city) => {
    if (isCitySelected(city.id, state.selectedCities)) return;

    const newSelectedCities = [...state.selectedCities, city];
    state.selectedCities = newSelectedCities;
    render();
};

const render = () => {
    // Coluna da esquerda
    const listEl = document.getElementById('cities-list');
    listEl.innerHTML = ''; 

    state.loadedCities.forEach(city => {
        const isSelected = isCitySelected(city.id, state.selectedCities);
        
        const card = document.createElement('div');
        card.className = `city-card ${isSelected ? 'added' : ''}`;
        card.innerHTML = `
            <div class="city-info">
                <h3>${city.name}</h3>
                <p>${city.country} | Pop: ${city.population?.toLocaleString() || '?'}</p>
            </div>
            <div>${isSelected ? 'selecionada' : 'selecionar'}</div>
        `;

        if (!isSelected) {
            card.onclick = () => selectCities(city);
        }

        listEl.appendChild(card);
    });

    document.getElementById('total-results').innerText = `${state.loadedCities.length} carregadas`;

    // Coluna da direita 
    const selectedEl = document.getElementById('selected-list');
    selectedEl.innerHTML = '';

    if (state.selectedCities.length === 0) {
        selectedEl.innerHTML = '<p class="empty-msg">Selecione cidades ao lado.</p>';
    } else {
        state.selectedCities.forEach(city => {
            const card = document.createElement('div');
            card.className = 'city-card';
            card.style.borderColor = 'var(--secondary)';
            card.innerHTML = `
                <div class="city-info">
                    <h3>${city.name}</h3>
                    <p>Latitude: ${city.latitude.toFixed(2)}</p>
                </div>
                <div style="font-size:0.8rem">Lat/Lon Salva</div>
            `;
            selectedEl.appendChild(card);
        });
    }

    document.getElementById('selected-count').innerText = `${state.selectedCities.length} selecionadas`;
};

document.getElementById('btn-load').addEventListener('click', loadCities);
