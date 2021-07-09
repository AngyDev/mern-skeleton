import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { hydrate } from "react-dom";

hydrate(<App />, document.getElementById('root'));