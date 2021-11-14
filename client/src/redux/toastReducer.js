const SHOW_TOAST = 'SHOW_TOAST';
const HIDE_TOAST = 'HIDE_TOAST';
const CHANGE_TOAST_MESSAGE = 'CHANGE_TOAST_MESSAGE';

const initialState = {
    showToast: false,
    message: ''
};

export const toastReducer = (state = initialState, action) => {
    switch (action.type) {
        case SHOW_TOAST:
            return { ...state, showToast: true, message: action.text };
        case HIDE_TOAST:
            return { ...initialState };
        case CHANGE_TOAST_MESSAGE:
            return { ...state, message: action.text };
        default:
            return state;
    }
};

export const showToast = (text) => ({ type: SHOW_TOAST, text });

export const hideToast = () => ({ type: HIDE_TOAST });
