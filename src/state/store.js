export const initialState = {
    selectedCities: [],
    loadedCities: [],
    currentOffset: 0,
    total: 0,
    limit: 10
};

export const reducer = (state, action) => {
    switch (action.type){
        case "SET_DATA":
            return {
                ...state,
                loadedCities: action.payload.cities,
                total: action.payload.total,
                currentOffset: action.payload.offset
            };
        
        case "ADD_CITY":
            if (state.selectedCities.some(c => c.id === action.payload.id)) return state;

            return {
                ...state,
                selectedCities: [...state.selectedCities, action.payload]
            };
        
        case "REMOVE_CITY":
            return {
                ...state,
                selectedCities: state.selectedCities.filter(c => c.id !== action.payload)
            };
        
        default:
            return state;
    }
};