import jwt_decode from 'jwt-decode';
import {$host, $refreshTokenHost, $registerHost, $loginHost} from './index';
import {
    USER_EMAIL, USER_NAME,
    USER_PASSWORD, USER_ID, USER_SUMMARY, USER_AVATAR
} from '../consts/userConsts';
import {
    ACCESS_TOKEN,
    REFRESH_TOKEN
} from '../consts/authConsts';

export const registration = async ({ email, password, username }) => {

    const response = await $registerHost.post('',
        {
            [USER_EMAIL]: email,
            [USER_PASSWORD]: password,
            [USER_NAME]: username}
    );

    if (response.status === 201) {
        if (response.data) {
            localStorage.setItem(ACCESS_TOKEN, response.data.token);

            return {
                [USER_EMAIL]: response.data.email,
                [USER_NAME]: response.data.username,
                [USER_ID]: response.data.id,
                [USER_SUMMARY]: response.data.summary,
                [USER_AVATAR]: response.data.avatar
            }
        }

    } return false;
};

export const login = async ({ email, password }) => {
    const response = await $loginHost.post('', { [USER_EMAIL]: email, [USER_PASSWORD]: password });

    if (response.status === 200) {

        if (response.data) {
            localStorage.setItem(ACCESS_TOKEN, response.data.token);
        }
        return jwt_decode(response.data.token);

    } return false;
};

export const getNewTokens = async () => {
    const response = await $refreshTokenHost.post(
        '/refresh',
        {},
        { headers: { Authorization: localStorage.getItem(REFRESH_TOKEN) } }
);

    if (response.status === 200) {

        if (response.data) {
            localStorage.setItem(ACCESS_TOKEN, response.data.accessToken);
            localStorage.setItem(REFRESH_TOKEN, response.data.refreshToken);
        }
        return jwt_decode(response.data.accessToken);

    } return false;
};

export const check = async () => {
    const response = await $host.post('/registration',);
    return response;
};
