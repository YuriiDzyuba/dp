import Auth from './pages/Auth';
import Registration from './pages/Registration';
import Home from './pages/Home';
import UserAccount from './pages/UserAccount';
import {
    HOME_ROUTE,
    LOGIN_ROUTE,
    REGISTRATION_ROUTE,
    USER_ACCOUNT_ROUTE } from './consts/pagePaths';

export const userRoutes = [
    {
        path: USER_ACCOUNT_ROUTE,
        page: UserAccount
    },

];

export const publicRoutes = [
    {
        path: HOME_ROUTE,
        page: Home
    },
    {
        path: LOGIN_ROUTE,
        page: Auth
    },
    {
        path: REGISTRATION_ROUTE,
        page: Registration
    },
];
