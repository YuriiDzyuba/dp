import React from 'react';
import { Button, Container, Form, Row } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { REGISTRATION_ROUTE } from '../consts/pagePaths';
// import { login } from '../http/userApi';
import style from './auth.module.scss';
import { logInUser, updateEmail, updatePassword } from '../redux/userReducers/authReducer';

const Auth = () => {

    const authState = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    // eslint-disable-next-line no-unused-vars,require-await
    const click = async (e) => {
        e.preventDefault();
        // const response = await login(email, password);
        dispatch(logInUser());
        console.log('response');
    };

    return (
        <Container className={`d-flex justify-content-center align-items-center authPage ${style.authPage}`}>
            <Form onSubmit={(e) => click(e)} className={style.authPage__form}>
                <h3>{'Auth'}</h3>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>email address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="joedoe@gmail.com"
                        value={authState.email}
                        onChange={(e) => dispatch(updateEmail(e.target.value))}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="password"
                        value={authState.password}
                        onChange={(e) => dispatch(updatePassword(e.target.value))}
                    />
                </Form.Group>
                <Row className="g-1 ">
                    <div className="col-8">
                        dont have account? <NavLink to={REGISTRATION_ROUTE}>Registration</NavLink>
                    </div>
                    <div className="col d-grid justify-content-md-end">
                        <Button
                            className="align-self-end"
                            variant="outline-primary"
                            type="submit">
                            Submit
                        </Button>
                    </div>
                </Row>
            </Form>
        </Container>
    );
};

export default Auth;
