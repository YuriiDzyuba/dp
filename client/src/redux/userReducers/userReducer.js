import {
    USER_EMAIL,
    USER_ID,
    USER_NAME,
    USER_AVATAR,
    USER_SUMMARY
} from '../../consts/userConsts';

const UPLOAD_USER = 'UPLOAD_USER';
const UNLOAD_USER = 'UNLOAD_USER';

const initialState = {
    [USER_EMAIL]: '',
    [USER_NAME]: '',
    [USER_ID]: '',
    [USER_AVATAR]: '',
    [USER_SUMMARY]: '',
};

export const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPLOAD_USER:
            const newState = { ...initialState };
            const newStateFields = Object.keys(initialState);

            newStateFields.forEach((field) => { newState[field] = action.payload[field]; });
            return { ...newState };
        case UNLOAD_USER:
            return { ...state, ...initialState };
        default:
            return state;
    }
};

export const uploadUser = (payload) => ({ type: UPLOAD_USER, payload });
