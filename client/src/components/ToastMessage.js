import { Toast } from 'react-bootstrap';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideToast } from '../redux/toastReducer';
import style from './toastMessage.module.scss';

function ToastMessage() {

    const toast = useSelector((state) => state.toast);
    const dispatch = useDispatch();

    return (
        <div className={style.toast}>
            <Toast onClose={() => dispatch(hideToast())} show={toast.showToast} delay={3000} autohide>
                <Toast.Header>
                    <strong className="me-auto">server response</strong>
                </Toast.Header>
                <Toast.Body>{toast.message}</Toast.Body>
            </Toast>
        </div>
    );
}

export default ToastMessage;
