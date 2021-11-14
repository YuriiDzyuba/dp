import { applyMiddleware, combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { toastReducer } from './toastReducer';
import { userReducer } from './userReducers/userReducer';
import { authReducer } from './userReducers/authReducer';
import { registrationReducer } from './userReducers/registrationReducer';

const rootReducer = combineReducers({
    user: userReducer,
    auth: authReducer,
    registration: registrationReducer,
    toast: toastReducer,
});

export const store = createStore(rootReducer,
    composeWithDevTools(
        applyMiddleware(thunk)
    ));

window.store = store;
