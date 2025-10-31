// FileName: App.js
// Description: Main component. Grabs and manages user data, 
// renders components based on user state.

// Imports.
import React, { useState, useEffect } from 'react';
import './App.css';
import Register from './components/Register';
import Login from './components/Login';
import MedicationLog from './components/MedicationLog';
import AppointmentCalendar from './components/AppointmentCalendar';
import GroupManager from './components/GroupManager';
import GroupInfo from './components/GroupInfo';

// The main application component that acts as the central controller.
function App() {
  // State for auth token.
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // State to hold user data

  // Fetches logged-in user data from backend.
  const fetchUserData = async (authToken) => {
    try {
      const response = await fetch('/api/users/me', {
        headers: { 'x-auth-token': authToken }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Log out if token ivalid.
        handleLogout();
      }
    } catch (error) {
      handleLogout();
    }
  };

  // Checks sessionStorage for existing token.
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserData(storedToken);
    }
  }, []);

  // Sets token in state/sessionStorage after login.
  const handleLogin = (newToken) => {
    setToken(newToken);
    sessionStorage.setItem('token', newToken);
    fetchUserData(newToken);
  };

  // Clears token/user data on logout.
  const handleLogout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('token');
  };

  // Handles account deletion.
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/users/me', {
          method: 'DELETE',
          headers: { 'x-auth-token': token }
        });

        if (response.ok) {
          alert('Account deleted successfully.');
          handleLogout();
        } else {
          alert('Failed to delete account.');
        }
      } catch (err) {
        console.error('Error deleting account:', err);
        alert('An error occurred. Please try again.');
      }
    }
  };

  // Renders content based on user's authentication and group status.
  const renderContent = () => {
    // If user not logged in, show authentication screen.
    if (!token || !user) {
      return (
        <div className="auth-container">
          <h1>Welcome to Kinnect</h1>
          <Register />
          <hr />
          <Login onLogin={handleLogin} />
        </div>
      );
    }

    // If user logged in but not in group, show group manager.
    if (!user.group) {
      return <GroupManager user={user} onGroupCreated={() => fetchUserData(token)} />;
    }

    // If user logged in and in group, show dashboard.
    return (
      <>
        <GroupInfo user={user} group={user.group} onLeaveGroup={() => fetchUserData(token)} />
        <div className="dashboard-container">
          <MedicationLog token={token} />
          <AppointmentCalendar token={token} />
        </div>
      </>
    );
  };

  // Main rendering.
  return (
    <div className="App">
      <nav className="app-nav">
        <div className="nav-title">Kinnect</div>
        {token && (
          <div className="user-controls">
            <button onClick={handleLogout}>Logout</button>
            <button onClick={handleDeleteAccount} className="delete-button">Delete Account</button>
          </div>
        )}
      </nav>

      <main className="app-main">
        {renderContent()}
      </main>
    </div>
  );
}

//Exporting.
export default App;
