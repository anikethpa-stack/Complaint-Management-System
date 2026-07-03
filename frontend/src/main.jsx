import React from 'react';
import ReactDOM from 'react-dom/client';

// Import Bootstrap Styling and Icons first
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 

// Import App.jsx (which imports App.css to override Bootstrap)
import App from './App.jsx';

// Import standard baseline styling
import './index.css';

// Inject Google Identity Services client script
const googleScript = document.createElement('script');
googleScript.src = 'https://accounts.google.com/gsi/client';
googleScript.async = true;
googleScript.defer = true;
document.head.appendChild(googleScript);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
