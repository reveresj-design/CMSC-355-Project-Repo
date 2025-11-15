// FileName: Login.js
// Description: Handles email/password input and authentication, as well as
// error handling

// Imports.
import React, { useState } from 'react';

// Component for handling user login.
function Login({ onLogin }) {
  // State for input fields and error messages.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Handles form submission and API call.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page from reloading.
    
    try {
      // Sends login credentials to the server.
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      // If login is successful, pass token to parent. Otherwise, display error.
      if (response.ok) {
        onLogin(data.token);
      } else {
        setError(data.message);
      }
    } catch (err) {
      // Handles network or server connection errors.
      setError('Server error. Please try again later.');
    }
  };

  // Main rendering.
  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {/* Renders error message. */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

// Exporting.
export default Login;