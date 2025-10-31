// FileName: GroupManager.js
// Description: Provides the functionality for a user to create a group/join one
// using an invite code

// Imports.
import React, { useState } from 'react';

// Component for creating a new group or joining an existing one.
function GroupManager({ onGroupCreated }) {
  // State for the invite code input field.
  const [inviteCode, setInviteCode] = useState('');

  // Handles the API call to create a new group.
  const handleCreateGroup = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      });

      if (response.ok) {
        const group = await response.json();
        alert(`Successfully created group: ${group.name}`);
        onGroupCreated(); // Notify App.js to refresh user data
      } else {
        const data = await response.json();
        alert(`Error: ${data.msg || 'Could not create group.'}`);
      }
    } catch (error) {
      console.error("Failed to create group:", error);
      alert('A server error occurred.');
    }
  };

  // Handles the API call to join a group using an invite code.
  const handleJoinGroup = async () => {
    if (!inviteCode) {
      alert('Please enter an invite code.');
      return;
    }
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ inviteCode }),
      });

      if (response.ok) {
        alert('Successfully joined group!');
        onGroupCreated(); // Refresh user data
      } else {
        const data = await response.json();
        alert(`Error: ${data.msg || 'Could not join group.'}`);
      }
    } catch (error) {
      console.error("Failed to join group:", error);
      alert('A server error occurred.');
    }
  };

  // Main rendering.
  return (
    <div className="auth-container">
      <h2>Join or Create a Group</h2>
      <p>Create a new family group or enter an invite code to join an existing one.</p>
      
      <div className="group-action" style={{ marginTop: '30px' }}>
        <button onClick={handleCreateGroup} style={{ width: '100%' }}>
          <i className="fas fa-users"></i> Create a New Group
        </button>
      </div>

      <hr />

      <div className="group-action">
        <input
          type="text"
          placeholder="Enter Invite Code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          style={{ textTransform: 'uppercase', textAlign: 'center' }}
        />
        <button onClick={handleJoinGroup} style={{ width: '100%', marginTop: '10px' }}>
          <i className="fas fa-sign-in-alt"></i> Join Group
        </button>
      </div>
    </div>
  );
}

// Exporting.
export default GroupManager;