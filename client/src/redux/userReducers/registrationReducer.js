import { registration } from '../../http/userApi';
import { uploadUser } from './userReducer';
import {
    USER_EMAIL,
    USER_NAME,
    USER_PASSWORD,
} from '../../consts/userConsts';

const CHANGE_EMAIL = 'CHANGE_EMAIL';
const CHANGE_PASSWORD = 'CHANGE_PASSWORD';
const CHANGE_NAME = 'CHANGE_NAME';
const CLEAR_ALL = 'CLEAR_ALL';

const initialState = {
    [USER_EMAIL]: '',
    [USER_PASSWORD]: '',
    [USER_NAME]: '',
};

export const registrationReducer = (state = initialState, action) => {
    switch (action.type) {
        case CHANGE_EMAIL:
            return { ...state, [USER_EMAIL]: action.text };
        case CHANGE_PASSWORD:
            return { ...state, [USER_PASSWORD]: action.text };
        case CHANGE_NAME:
            return { ...state, [USER_NAME]: action.text };
        case CLEAR_ALL:
            return { ...state, ...initialState };
        default:
            return state;
    }
};

export const changeEmail = (text) => ({ type: CHANGE_EMAIL, text });

export const changePassword = (text) => ({ type: CHANGE_PASSWORD, text });

export const changeName = (text) => ({ type: CHANGE_NAME, text });

export const clearAllFields = () => ({ type: CLEAR_ALL });

export const registerNewUser = () => async (dispatch, getState) => {

    const applicantData = getState().registration;

    const registeredUser = await registration(applicantData);

    console.log(registeredUser)
    if (registeredUser) {
        dispatch(clearAllFields());
        dispatch(uploadUser(registeredUser));
    }
};
