// FileName: GroupInfo.js
// Description: Displays group info such as the group name/inivte code as well as 
//handling leaving/deletion of a group

// Imports.
import React from 'react';

// Displays the user's group information and provides options to manage the group.
function GroupInfo({ user, group, onLeaveGroup }) {
  // If user or group data isn't loaded yet, render nothing.
  if (!user || !group) return null;

  // Handles copying the group's invite code to the clipboard.
  const handleCopy = () => {
    navigator.clipboard.writeText(group.inviteCode);
    alert('Invite code copied to clipboard!');
  };

  // Handles the logic for a user leaving their current group.
  const handleLeaveGroup = async () => {
    if (window.confirm('Are you sure you want to leave this group?')) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('/api/groups/leave', {
          method: 'POST',
          headers: { 'x-auth-token': token },
        });
        if (response.ok) {
          alert('You have left the group.');
          onLeaveGroup(); // Notifies the parent App component to refresh user data.
        } else {
          alert('Failed to leave group.');
        }
      } catch (error) {
        alert('A server error occurred.');
      }
    }
  };

  // Handles the logic for deleting the entire group and all its data.
  const handleDeleteGroup = async () => {
    if (window.confirm('Are you sure you want to delete this group? This will delete all medications and appointments for ALL members. This action cannot be undone.')) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('/api/groups', {
          method: 'DELETE',
          headers: { 'x-auth-token': token },
        });
        if (response.ok) {
          alert('Group deleted successfully.');
          onLeaveGroup(); // Notifies the parent App component to refresh user data.
        } else {
          alert('Failed to delete group.');
        }
      } catch (error) {
        alert('A server error occurred.');
      }
    }
  };

  // Renders the UI for the component.
  return (
    <div className="group-info-container">
      {/* Displays the logged-in user's details. */}
      <div className="user-profile-info">
        <h4>Logged in as:</h4>
        <p>{user.username} ({user.email})</p>
      </div>
      {/* Displays shared group information. */}
      <div className="group-details">
        <h3>{group.name}</h3>
        <div className="group-actions">
          <div>
            <p>Share this code to invite others:</p>
            <div className="invite-code" onClick={handleCopy}>
              {group.inviteCode} <i className="fas fa-copy"></i>
            </div>
          </div>
          <div className="group-buttons">
              <button onClick={handleLeaveGroup} className="btn btn-outline">
                <i className="fas fa-sign-out-alt"></i> Leave Group
              </button>
              <button onClick={handleDeleteGroup} className="btn btn-outline btn-danger">
                <i className="fas fa-trash-alt"></i> Delete Group
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Exports the component for use in other files.
export default GroupInfo;