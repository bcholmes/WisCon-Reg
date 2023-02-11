import React from 'react';
import Home from './page/home'
import { Toaster } from 'react-hot-toast';
import FindMyRegistrationPage from './page/findMyRegistrationPage';
import RegistrationsPage from './page/registrationsPage';
import AdminOrderPage from './page/adminOrderPage';
import ReviewPage from './page/reviewPage';
import CheckoutPage from './page/checkoutPage';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import AdminOfferingsPage from './page/adminOfferingsPage';
import adminOfferingFormPage from './page/adminOfferingFormPage';

import './scss/online-reg.scss'

const App = () => (
    <>
        <Router>
            <Switch>
                <Route path="/find" component={FindMyRegistrationPage} />
                <Route path="/admin/review/:orderId" component={AdminOrderPage} />
                <Route path="/admin/offerings/:offeringId" component={adminOfferingFormPage} />
                <Route path="/admin/offerings" component={AdminOfferingsPage} />
                <Route path="/admin" component={RegistrationsPage} />
                <Route path="/checkout" component={CheckoutPage} />
                <Route path="/review" component={ReviewPage} />
                <Route path="/" component={Home} />
            </Switch>
        </Router>
        <Toaster />
    </>
);

export default App;
