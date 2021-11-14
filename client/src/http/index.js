import axios from 'axios';
import {
    SERVER_API, SERVER_API_AUTH_LOGIN, SERVER_API_AUTH_REGISTRATION,
} from '../consts/serverApiConsts';

const $host = axios.create({
    baseURL: SERVER_API
});

const $loginHost = axios.create({
    baseURL: SERVER_API_AUTH_LOGIN
});

const $registerHost = axios.create({
    baseURL: SERVER_API_AUTH_REGISTRATION
});

const $refreshTokenHost = axios.create({
    baseURL: SERVER_API
});



export {
    $host,
    $loginHost,
    $registerHost,
    $refreshTokenHost,
};
