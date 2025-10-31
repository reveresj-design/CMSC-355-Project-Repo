// FileName: MedicationLog.js
// Description: manages medications and their 
// administration history via API calls.

// Imports.
import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';

function MedicationLog({ token }) {
  // State Management for adding, editing, deleting medications.
  const [medications, setMedications] = useState([]);
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [form, setForm] = useState({ name: '', dosage: '', recipientName: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentMed, setCurrentMed] = useState(null);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [currentAdminEvent, setCurrentAdminEvent] = useState(null);
  const [parentMedicationId, setParentMedicationId] = useState(null);

  // State For Enhanced Search
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchTime, setSearchTime] = useState('');


  // Fetching data
  const fetchMedications = useCallback(async () => {
    try {
      const response = await fetch('/api/medications', {
        headers: { 'x-auth-token': token }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setMedications(data);
    } catch (error) {
      console.error("Failed to fetch medications:", error);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchMedications();
    }
  }, [token, fetchMedications]);

  // Medication filtering
  useEffect(() => {
    let results = medications;

    // 1. Filter by the medication name.
    if (searchName) {
      results = results.filter(med =>
        med.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Then filter for date and time.
    if (searchDate || searchTime) {
      results = results
        .map(med => {
          // Administration filtering list for each medication.
          const matchingAdministrations = med.administrations.filter(admin => {
            const adminMoment = moment(admin.timestamp);
            const dateMatch = !searchDate || adminMoment.isSame(searchDate, 'day');
            const timeMatch = !searchTime || adminMoment.format('HH:mm') === searchTime;
            return dateMatch && timeMatch;
          });

          // Return only the medication with matching adminsitrations.
          return { ...med, administrations: matchingAdministrations };
        })
        // Remove ones that dont match.
        .filter(med => med.administrations.length > 0);
    }

    setFilteredMedications(results);

  }, [searchName, searchDate, searchTime, medications]);


  // Form handlers
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify(form),
    });
    setForm({ name: '', dosage: '', recipientName: '' });
    fetchMedications();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      await fetch(`/api/medications/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      fetchMedications();
    }
  };

  // Handlers for medication editing
  const openEditModal = (med) => {
    setCurrentMed(med);
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setCurrentMed(null);
    setIsEditing(false);
  };

  const handleEditChange = (e) => {
    setCurrentMed({ ...currentMed, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!currentMed) return;
    await fetch(`/api/medications/${currentMed._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({ name: currentMed.name, dosage: currentMed.dosage, recipientName: currentMed.recipientName }),
    });
    closeEditModal();
    fetchMedications();
  };

  // Handlers for medication administration
  const handleAdminister = async (id) => {
    await fetch(`/api/medications/${id}/administer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
    });
    fetchMedications();
  };

  // Administration editing handlers
  const openAdminEditModal = (medication, adminEvent) => {
    setParentMedicationId(medication._id);
    setCurrentAdminEvent({
      ...adminEvent,
      date: moment(adminEvent.timestamp).format('YYYY-MM-DD'),
      time: moment(adminEvent.timestamp).format('HH:mm'),
    });
    setIsEditingAdmin(true);
  };

  const closeAdminEditModal = () => {
    setIsEditingAdmin(false);
    setCurrentAdminEvent(null);
    setParentMedicationId(null);
  };

  const handleAdminEditChange = (e) => {
    setCurrentAdminEvent({ ...currentAdminEvent, [e.target.name]: e.target.value });
  };

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    if (!currentAdminEvent || !parentMedicationId) return;
    const combinedTimestamp = new Date(`${currentAdminEvent.date}T${currentAdminEvent.time}`);
    await fetch(`/api/medications/${parentMedicationId}/administrations/${currentAdminEvent._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({
        administeredBy: currentAdminEvent.administeredBy,
        timestamp: combinedTimestamp,
      }),
    });
    closeAdminEditModal();
    fetchMedications();
  };

  const handleAdminDelete = async (medId, adminId) => {
    if (window.confirm('Are you sure you want to delete this administration record?')) {
      await fetch(`/api/medications/${medId}/administrations/${adminId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      fetchMedications();
    }
  };
  
  // Handler for Clearing All Search Filters
  const clearSearchFilters = () => {
    setSearchName('');
    setSearchDate('');
    setSearchTime('');
  };

  // Rendering
  return (
    <div className="feature-container">
      <div className="feature-header">
        <h1>Medications</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <input name="name" type="text" placeholder="Medication Name" value={form.name} onChange={handleInputChange} required />
        <input name="dosage" type="text" placeholder="Dosage" value={form.dosage} onChange={handleInputChange} required />
        <input name="recipientName" type="text" placeholder="Recipient's Name" value={form.recipientName} onChange={handleInputChange} required />
        <button type="submit">Add Medication</button>
      </form>

      <div className="medication-list">
        <div className="list-header">
          <h2>Current Medications</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
            <input
              type="time"
              value={searchTime}
              onChange={(e) => setSearchTime(e.target.value)}
            />
            <button className="btn btn-secondary" onClick={clearSearchFilters}>Clear</button>
          </div>
        </div>
        <ul>
          {filteredMedications.map((med) => (
            <li key={med._id} className="medication-item">
              <div className="medication-info">
                <div>
                  <strong>{med.name}</strong> - {med.dosage}
                  <div style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>For: {med.recipientName}</div>
                </div>
                <div className="button-group">
                  <button
                    onClick={() => handleAdminister(med._id)}
                    className="administer-button"
                  >
                    Mark as Taken
                  </button>
                  <button onClick={() => openEditModal(med)} className="edit-button">Edit</button>
                  <button onClick={() => handleDelete(med._id)} className="delete-button">Delete</button>
                </div>
              </div>

              <div className="history-log">
                <h4>Administration History:</h4>
                {med.administrations && med.administrations.length > 0 ? (
                  <ul>
                    {[...med.administrations].reverse().map((admin) => (
                      <li key={admin._id}>
                        <span>
                          Administered by {admin.administeredBy} on {new Date(admin.timestamp).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="history-buttons">
                          <button onClick={() => openAdminEditModal(med, admin)} className="edit-button-small">Edit</button>
                          <button onClick={() => handleAdminDelete(med._id, admin._id)} className="delete-button-small">Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (<p>No administration history yet.</p>)}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modals for editing */}
      {isEditing && currentMed && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Medication</h2>
            <form onSubmit={handleUpdate}>
              <label>Medication Name:</label>
              <input type="text" name="name" value={currentMed?.name} onChange={handleEditChange} />
              <label>Dosage:</label>
              <input type="text" name="dosage" value={currentMed?.dosage} onChange={handleEditChange} />
              <label>Recipient's Name:</label>
              <input type="text" name="recipientName" value={currentMed?.recipientName} onChange={handleEditChange} />
              <button type="submit">Save Changes</button>
              <button type="button" onClick={closeEditModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {isEditingAdmin && currentAdminEvent && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Administration Record</h2>
            <form onSubmit={handleAdminUpdate}>
              <label>Administered By:</label>
              <input type="text" name="administeredBy" value={currentAdminEvent?.administeredBy} onChange={handleAdminEditChange} />
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={currentAdminEvent?.date}
                onChange={handleAdminEditChange}
              />
              <label>Time:</label>
              <input type="time" name="time" value={currentAdminEvent?.time} onChange={handleAdminEditChange} />
              <button type="submit">Save Changes</button>
              <button type="button" onClick={closeAdminEditModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

//Exporting.
export default MedicationLog;