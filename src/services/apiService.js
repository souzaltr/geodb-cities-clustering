import { ApiClient, GeoApi } from "wft-geodb-js-client";

const apiKey = import.meta.env.VITE_API_KEY;

const defaultClient = ApiClient.instance;
const UserSecurity = defaultClient.authentications['UserSecurity'];
UserSecurity.apiKey = apiKey;

const geoDb = new GeoApi(defaultClient);

export const fetchCities = async ({offset, limit, search = ""}) => {
    const params = {
        limit,
        offset,
        minPopulation: 10000,
        types: 'CITY',
    };    
    
    if (search.trim()) {
        params.namePrefix = search;
    } else{
        params.sort = 'population';
    }

    const response = await geoDb.findCitiesUsingGET(params);
    return {
        cities: response.data || [],
        total: response.metadata.totalCount || 0,
        offset: response.metadata.currentOffset || 0
    };
};