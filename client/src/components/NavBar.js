import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useHistory } from 'react-router-dom';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { HOME_ROUTE, LOGIN_ROUTE, REGISTRATION_ROUTE, USER_ACCOUNT_ROUTE } from '../consts/pagePaths';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../consts/authConsts';
import style from './navbar.module.scss';

const NavBar = () => {

    const user = useSelector((state) => state.user);
    const history = useHistory();
    console.log(user.id, 'user._id');
    const logOut = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        history.push('/');
    };

    return (
        <Navbar className={style.navbar} variant="dark">
            <Container>
                <NavLink to={HOME_ROUTE}>Home</NavLink>
                <Nav className="ml-auto">
                    {!user.id && <NavLink to={LOGIN_ROUTE}>log in</NavLink>}
                    {!user.id && <NavLink to={REGISTRATION_ROUTE}>registration</NavLink>}
                    {user.id && <NavLink to={USER_ACCOUNT_ROUTE}>user account</NavLink>}
                    {user.id && <Button
                        variant="link"
                        onClick={() => logOut()}
                    >log out</Button>}
                </Nav>
            </Container>
        </Navbar>
    );
};

export default NavBar;
