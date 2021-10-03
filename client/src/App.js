import React from 'react';
import Home from './page/home'
import Find from './page/find';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'

import './scss/online-reg.scss'

const App = () => (
  <Router>
    <Switch>
      <Route path="/find" component={Find} />
      <Route path="/" component={Home} />
    </Switch>
  </Router>
);

export default App;
