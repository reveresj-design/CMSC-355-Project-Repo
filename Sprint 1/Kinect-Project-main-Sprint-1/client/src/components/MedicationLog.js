import React, { useState, useEffect } from 'react';

function MedicationLog({ token }) {
  // State for medication list and add form
  const [medications, setMedications] = useState([]);
  const [form, setForm] = useState({ name: '', dosage: '', recipientName: '' });
  
  // State for the medication edit modal
  const [isEditing, setIsEditing] = useState(false);
  const [currentMed, setCurrentMed] = useState(null);

  // State for the administration edit modal
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [currentAdminEvent, setCurrentAdminEvent] = useState(null);
  const [parentMedicationId, setParentMedicationId] = useState(null);

  useEffect(() => {
    if (token) {
      fetchMedications();
    }
  }, [token]);

  const fetchMedications = async () => {
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
  };

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
    await fetch(`/api/medications/${id}`, { 
      method: 'DELETE',
      headers: { 'x-auth-token': token }
    });
    fetchMedications();
  };

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

  const handleAdminister = async (id) => {
    await fetch(`/api/medications/${id}/administer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
    });
    fetchMedications();
  };
  
  const openAdminEditModal = (medication, adminEvent) => {
    setParentMedicationId(medication._id);
    setCurrentAdminEvent(adminEvent);
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
    await fetch(`/api/medications/${parentMedicationId}/administrations/${currentAdminEvent._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({ administeredBy: currentAdminEvent.administeredBy }),
    });
    closeAdminEditModal();
    fetchMedications();
  };

  return (
    <div className="feature-container">
      <h1>Kinnect Medication Log</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Medication Name"
          value={form.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="dosage"
          placeholder="Dosage"
          value={form.dosage}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="recipientName"
          placeholder="Recipient's Name"
          value={form.recipientName}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Add Medication</button>
      </form>

      <div className="medication-list">
        <h2>My Medications</h2>
        {medications.length > 0 ? (
          <ul>
            {medications.map((med) => (
              <li key={med._id} className="medication-item">
                <div className="medication-info">
                  <div>
                    <strong>{med.name}</strong> - {med.dosage}
                    <div style={{ fontSize: '0.8em', color: '#aaa' }}>For: {med.recipientName}</div>
                  </div>
                  <div className="button-group">
                    <button onClick={() => handleAdminister(med._id)} className="administer-button">
                      Mark as Taken ✅
                    </button>
                    <button onClick={() => openEditModal(med)} className="edit-button">
                      Edit ✏️
                    </button>
                    <button onClick={() => handleDelete(med._id)} className="delete-button">
                      Delete 🗑️
                    </button>
                  </div>
                </div>
                <div className="history-log">
                  <h4>Administration History:</h4>
                  {med.administrations && med.administrations.length > 0 ? (
                    <ul>
                      {med.administrations.slice(-3).reverse().map((admin) => (
                        <li key={admin._id}>
                          Administered by {admin.administeredBy} on {new Date(admin.timestamp).toLocaleString()}
                          <button onClick={() => openAdminEditModal(med, admin)} className="edit-button-small">
                            Edit
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No administration history yet.</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No medications added yet.</p>
        )}
      </div>

      {isEditing && currentMed && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Medication</h2>
            <form onSubmit={handleUpdate}>
              <input type="text" name="name" value={currentMed.name} onChange={handleEditChange} />
              <input type="text" name="dosage" value={currentMed.dosage} onChange={handleEditChange} />
              <input type="text" name="recipientName" value={currentMed.recipientName} onChange={handleEditChange} />
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
              <input
                type="text"
                name="administeredBy"
                value={currentAdminEvent.administeredBy}
                onChange={handleAdminEditChange}
              />
              <p style={{fontSize: '0.8em', color: '#aaa'}}>
                Timestamp: {new Date(currentAdminEvent.timestamp).toLocaleString()}
              </p>
              <button type="submit">Save Changes</button>
              <button type="button" onClick={closeAdminEditModal}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicationLog;