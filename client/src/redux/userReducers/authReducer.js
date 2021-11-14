import { USER_EMAIL, USER_PASSWORD } from '../../consts/userConsts';
import { getNewTokens, login } from '../../http/userApi';
import { uploadUser } from './userReducer';

const UPDATE_EMAIL = 'UPDATE_EMAIL';
const UPDATE_PASSWORD = 'UPDATE_PASSWORD';
const CLEAR_FIELDS = 'CLEAR_FIELDS';

const initialState = {
    [USER_EMAIL]: '',
    [USER_PASSWORD]: '',
};

export const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_EMAIL:
            return { ...state, [USER_EMAIL]: action.text };
        case UPDATE_PASSWORD:
            return { ...state, [USER_PASSWORD]: action.text };
        case CLEAR_FIELDS:
            return { ...state, ...initialState };
        default:
            return state;
    }
};

export const updateEmail = (text) => ({ type: UPDATE_EMAIL, text, });

export const updatePassword = (text) => ({ type: UPDATE_PASSWORD, text, });

export const clearFields = () => ({ type: CLEAR_FIELDS });

export const logInUser = () => async (dispatch, getState) => {

    const applicantData = getState().auth;

    const accessToken = await login(applicantData);

    if (accessToken) {
        dispatch(clearFields());
        dispatch(uploadUser(accessToken));
    }
};

export const checkTokens = () => async (dispatch) => {

    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
        const accessToken = await getNewTokens(refreshToken);

        if (accessToken) {
            dispatch(uploadUser(accessToken));
        }
    } else {
        //dispatch(uploadUser({ [USER_ROLE_FIELD]: USER_ROLE_PUBLIC }));
    }

};
