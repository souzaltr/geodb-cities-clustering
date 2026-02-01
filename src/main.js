import {ApiClient, GeoApi } from 'wft-geodb-js-client';

// API CONFIG
const apiKey = import.meta.env.VITE_API_KEY;

const defaultCLient = ApiClient.instance;
const UserSecurity = defaultCLient.authentications['UserSecurity'];
UserSecurity.apiKey = apiKey;

const geoDb = new GeoApi(defaultCLient);

// Estado da aplicação
const initialState = {
    currentOffset: 0,
    limit: 10, // Quantidade por página
    total: 0,  
    loadedCities: [], // Cidades carregadas (à esquerda)
    selectedCities: [] // Cidades selecionadas (à direita)
};

// Variável reativa ao estado da aplicação
let appState = {...initialState};

// Funções de transformação do estado
const actions = {
    addCity: (state, city) => {
        if (state.selectedCities.some(c => String(c.id) === String(city.id))) return state;
        
        return {
            ...state,
            selectedCities: [...state.selectedCities, city]
        };
    },

    removeCity: (state, cityId) => {
        return {
            ...state,
            selectedCities: state.selectedCities.filter(c => String(c.id) !== String(cityId))
        }
    },

    setData: (state, payload) => ({
        ...state, 
        loadedCities: payload.data,
        total: payload.metadata.totalCount,
        currentOffset: payload.metadata.currentOffset
    })
};

// Aplica as ações ao estado e chama a renderização da UI
function dispatcher(action, payloas){
    if (action === 'ADD_CITY') appState = actions.addCity(appState, payloas);
    if (action === 'REMOVE_CITY') appState = actions.removeCity(appState, payloas);
    if (action === 'SET_DATA') appState = actions.setData(appState, payloas); 

    render(appState);
}

// Chamada a API
const loadCities = async (offset=0) =>{
    if (offset < 0) offset = 0;

    try {
        const opts = {
            limit : appState.limit,
            offset : offset,
            types : 'CITY',
            sort : 'name' 
        };

        const response = await geoDb.findCitiesUsingGET(opts);

        dispatcher('SET_DATA', {
            data: response.data || [],
            metadata: response.metadata || {total: 0},
            offset: offset
        });
    } catch (error) {
        console.error('Houve um erro ao carregar as cidades:', error);
    } 
};

// Renderização da UI (VIEW)
const render = (state) => {
    // Esquerda: lista de cidades da API
    const citiesApiList = document.getElementById('cities-list');
    citiesApiList.innerHTML = state.loadedCities.map(city => {
        
        const isSelected = state.selectedCities.some(c => String(c.id) === String(city.id));
        return `
        <div class="city-card ${isSelected ? 'added' : 'js-add-city'}" 
             data-id="${city.id}">
            <div class="city-info">
                <h3>${city.name}</h3>
                <p>${city.country} | Pop: ${city.population?.toLocaleString() ?? 'Não disponível'}</p>
            </div>
            <div>${isSelected ? 'selecionada' : 'selecionar'}</div>
        </div>
        `;
    }).join('');

    // Paginação
    const pagination = document.getElementById('pagination');
    const currentPage = Math.floor(state.currentOffset / state.limit) + 1;
    const hasNextPage = state.currentOffset + state.limit < state.total;
    const hasPrevPage = state.currentOffset > 0;

    pagination.innerHTML = `
        <button id="btn-prev" class="btn secondary" ${!hasPrevPage ? 'disabled' : ''}>⬅ Anterior</button>
        <span class="page-info">Pág ${currentPage}</span>
        <button id="btn-next" class="btn secondary" ${!hasNextPage ? 'disabled' : ''}>Próxima ➡</button>
    `;

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if(btnPrev) btnPrev.onclick = () => loadCities(state.currentOffset - state.limit);
    if(btnNext) btnNext.onclick = () => loadCities(state.currentOffset + state.limit);

    // Direita: lista de cidades selecionadas
    const selectedCitiesList = document.getElementById('selected-list');
    if (state.selectedCities.length === 0) {
        selectedCitiesList.innerHTML = '<p class="empty-msg">Nenhuma cidade selecionada.</p>';
    } else {
        selectedCitiesList.innerHTML = state.selectedCities.map(city => `
            <div class="city-card" style="border-color: var(--secondary)">
                <div class="city-info">
                    <h3>${city.name}</h3>
                    <p>Lat: ${city.latitude} | Lon: ${city.longitude}</p>
                </div>
                <button class="btn-remove js-remove-city" data-id="${city.id}">Remover</button>
            </div>
        `).join('');
    }
    
    document.getElementById('total-results').innerText = `Total: ${state.total}`;
    document.getElementById('selected-count').innerText = `${state.selectedCities.length} selecionadas`; 
    document.getElementById('btn-process').disabled = state.selectedCities.length < 2;    
};

// Eventos 
    
        //listener do adicionar cidade à lista de selecionadas
    document.getElementById('cities-list').addEventListener('click', (event) => {
        //o metodo closest procura o elemento pai mais próximo 
    const cityCard = event.target.closest('.js-add-city');
    if (cityCard) {
        const cityId = cityCard.dataset.id;
        const city = appState.loadedCities.find(c => String(c.id) === String(cityId));
        if (city) {
            dispatcher('ADD_CITY', city);
        }
    }
    });

        //listener do remover cidade da lista de selecionadas
    document.getElementById('selected-list').addEventListener('click', (event) => {
        const removeBtn = event.target.closest('.js-remove-city');
        if (removeBtn) {
            const cityId = removeBtn.dataset.id;
            dispatcher('REMOVE_CITY', cityId);
        }
    });

loadCities(0);
