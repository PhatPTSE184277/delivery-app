import axios from "axios";
import queryString from "query-string";
import AsyncStorage from '@react-native-async-storage/async-storage';
import  { BASE_API_URL } from '@env';

const baseURL = BASE_API_URL;

const getAccessToken = async () => {
    try {
        const authDataString = await AsyncStorage.getItem('Auth_Data');
        if (authDataString) {
            const authData = JSON.parse(authDataString);
            if (authData && authData.token) {
                return authData.token;
            }
        }
        return '';
    } catch (error) {
        console.log('Error getting access token:', error);
        return '';
    }
};

const axiosClient = axios.create({
    baseURL,
    paramsSerializer: (params) => queryString.stringify(params)
});

axiosClient.interceptors.request.use(async (config) => {
    const accessToken = await getAccessToken();

    config.headers = {
        Authorization:  accessToken ? `Bearer ${accessToken}` : '',
        Accept: 'application/json',
        ...config.headers,
    };

    return {...config, data: config.data ?? null};
});

axiosClient.interceptors.response.use(res => {
    if (res.data && res.status >= 200 && res.status < 300) {
        return res.data;
    }else{
        return Promise.reject(res.data);
    }
}, error => {
    if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: error.message || 'Networking error' });
})

export default axiosClient;