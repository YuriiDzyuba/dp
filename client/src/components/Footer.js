import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import style from './footer.module.scss';

const Footer = () => (
    <Container fluid className={`d-flex flex-column ${style.footer}`}>
        <Container>
            <Row className={'row-cols-2 g-3'}>
                <Col>
                    <h4 className={style.footer__header}>Facere in iste laboriosam</h4>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. At culpa dolorum earum eius enim excepturi
                        expedita, explicabo,  libero molestiae nostrum numquam quibusdam quod
                        rerum
                        tempora voluptas.</p>
                </Col>
                <Col>
                    <h4 className={style.footer__header}>Libero molestiae nostrum numquam quibusdam</h4>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. At culpa dolorum earum eius enim excepturi
                        expedita, explicabo, facere in iste laboriosam, libero molestiae nostrum numquam quibusdam quod
                        rerum
                        tempora voluptas.</p>
                </Col>
            </Row>
        </Container>
    </Container>
);

export default Footer;
