import React from 'react';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';

import Cart from './component/cart'
import CheckoutButton from './component/checkoutButton'
import Notice from './component/notice'
import Welcome from './component/welcome'
import Waiver from './component/waiver'

import './scss/online-reg.scss'

const App = () => (
  <Container className="mx-auto">
    <header className="pb-3 mb-2">
      <img class="img-fluid" src="./images/wiscon_header.jpg" style={{width: "100%" }} alt="The WisCon Conference"/>
      <Navbar bg="dark" expand="lg" className="navbar-dark navbar-expand-md">
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="navbar-expand-md navbar-dark bg-dark ">
            <Nav.Link href="https://wiscon.net">WisCon Home</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
    <div class="row">
      <section className="col-lg-9">
        <Welcome />
      </section>
      <section className="col-lg-3">
        <Cart />
        <CheckoutButton />
        <Notice />
      </section>
    </div>
    <Waiver />

    <footer className="row mt-4">
        <hr className="my-2 col-md-12" />
        <div className="text-muted col-md-9"><small>This site is maintained by SF3 – Society for the Furtherance &amp; Study of Fantasy &amp; Science Fiction</small></div>
        <div className="col-md-1"><small><a href="http://wiscon.net/policies/privacy/" class="text-muted">Privacy</a></small></div>
        <div className="col-md-1"><small><a href="http://wiscon.net/contact/" class="text-muted">Contact</a></small></div>
      </footer>
  </Container>
);

export default App;
