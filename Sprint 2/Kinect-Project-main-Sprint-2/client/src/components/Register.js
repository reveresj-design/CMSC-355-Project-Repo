// FileName: Register.js
// Description: Handles user registration form and user 
// input, API submission, and displays success/error messages.

// Imports.
import React, { useState } from 'react';

// Manages the user registration form and API call.
function Register() {
  // State for each input field.
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Handles form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sends the registration data to the backend API.
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Registration successful! Please log in.');
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage('Server error. Please try again later.');
    }
  };

  // Main display.
  return (
    <div className="feature-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

// Exporting.
export default Register;