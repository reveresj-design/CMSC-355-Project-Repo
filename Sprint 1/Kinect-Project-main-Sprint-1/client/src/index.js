// FileName: index.js
// Description: Renders the App component 

//Imports
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Creates root for the React app.
const root = ReactDOM.createRoot(document.getElementById('root'));
// Displays the app.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// For measuring performance.
reportWebVitals();
