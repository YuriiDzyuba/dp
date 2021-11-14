import React from 'react';
import NavBar from './NavBar';
import Footer from './Footer';

const Layout = (props) => (
    <>
        <NavBar/>
        {props.children}
        <Footer/>
    </>
);

export default Layout;
