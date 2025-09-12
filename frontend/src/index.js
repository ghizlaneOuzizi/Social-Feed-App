import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {HashRouter} from 'react-router-dom'
import { UserSignupPage } from './pages/UserSignupPage';
import { LoginPage } from './pages/LoginPage';
import App from './containers/App'
import { Provider } from 'react-redux';
import { createStore , applyMiddleware } from 'redux';
import authReducer from './redux/authReducer';
import logger from 'redux-logger';
import { thunk } from 'redux-thunk';
import configureStore from './redux/configureStore';
import '../node_modules/font-awesome/css/font-awesome.min.css';
const root = ReactDOM.createRoot(document.getElementById('root'));
const store = configureStore();
root.render(
  <Provider store={store}>
    <HashRouter>
      <App/>
    </HashRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
