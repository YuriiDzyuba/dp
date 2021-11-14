import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Image, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import ToastMessage from '../components/ToastMessage';
import style from './userAccount.module.scss';
import noavatar from '../img/no-avatar.png';
import {
    USER_AVATAR,
    USER_EMAIL,
    USER_ID,
    USER_NAME,
} from '../consts/userConsts';

const UserAccount = () => {

    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);


    return (
        <>
            <ToastMessage/>
            <Container fluid className={style.userAccount__userData}>
                <Container>
                    <Row>
                        <Col lg={4} xs={12} className={style.userAccount__avatarWrapper}>
                            <Image className={style.userAccount__avatar}
                                   src={user[USER_AVATAR] ? user[USER_AVATAR] : noavatar}
                                   rounded/>
                        </Col>
                        <Col lg={8} xs={12} className={style.userAccount__headersWrapper}>
                            <Row className={`row-cols-1 g-2 ${style.userAccount__headersRow}`}>
                                <Col><h5>email: {user[USER_EMAIL]}</h5></Col>
                                <Col><h5>id: {user[USER_ID]}</h5></Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </Container>
        </>
    );
};

export default UserAccount;