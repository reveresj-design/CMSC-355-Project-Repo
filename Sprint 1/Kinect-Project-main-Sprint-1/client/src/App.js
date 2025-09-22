import React, { useState, useEffect } from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import MedicationLog from './components/MedicationLog';
import AppointmentCalendar from './components/AppointmentCalendar';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="App">
      <header className="App-header">
        {token ? (
          <div>
            <button onClick={handleLogout} style={{ float: 'right' }}>Logout</button>
            {/* Pass the token down as a prop */}
            <MedicationLog token={token} /> 
            <hr />
            <AppointmentCalendar />
          </div>
        ) : (
          <div>
            <h1>Welcome to Kinnect</h1>
            <Register />
            <hr />
            <Login onLogin={handleLogin} />
          </div>
        )}
      </header>
    </div>
  );
}

export default App;