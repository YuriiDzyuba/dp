import React from 'react';
import { Container, Row } from 'react-bootstrap';
import style from './loader.module.scss';

const Loader = () => (
    <Container fluid className={style.ldsRollerWrapper}>
        <Row>
            <div className={style.ldsRoller}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        </Row>
    </Container>
);

export default Loader;
