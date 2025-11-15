// FileName: AppointmentCalendar.js
// Description: Handles functionality to display, add, edit, 
// and delete user appointments via API calls.

// Imports.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setting up moment.js.
const localizer = momentLocalizer(moment);

function AppointmentCalendar({ token }) {
  // State management.
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');

  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: '', date: '', startTime: '', endTime: '',
    location: '', doctorName: '', purpose: '', summary: ''
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState(null);

  // Refs for transition animations.
  const addModalRef = useRef(null);
  const detailsModalRef = useRef(null);

  // Fetches appointment data from the API to format for calendar.
  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('/api/appointments', {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const formattedEvents = data.map(apt => ({
        title: apt.title,
        start: new Date(apt.start),
        end: new Date(apt.end),
        resource: apt
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  }, [token]);

  // Fetching appointments.
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Event handlers.
  const handleNavigate = useCallback((newDate) => setDate(newDate), [setDate]);
  const handleView = useCallback((newView) => setView(newView), [setView]);

  const handleSelectEvent = (event) => {
    const eventResource = {
        ...event.resource,
        date: moment(event.resource.start).format('YYYY-MM-DD'),
        startTime: moment(event.resource.start).format('HH:mm'),
        endTime: moment(event.resource.end).format('HH:mm'),
    };
    setSelectedEvent(event.resource);
    setEditFormData(eventResource);
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };
//Handles appointment deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      await fetch(`/api/appointments/${selectedEvent._id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      handleCloseModal();
      fetchAppointments();
    }
  };
//Handles appointment updating
  const handleUpdate = async (e) => {
    e.preventDefault();
    const startDateTime = new Date(`${editFormData.date}T${editFormData.startTime}`);
    const endDateTime = new Date(`${editFormData.date}T${editFormData.endTime}`);

    await fetch(`/api/appointments/${selectedEvent._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      body: JSON.stringify({ ...editFormData, start: startDateTime, end: endDateTime }),
    });
    handleCloseModal();
    fetchAppointments();
  };
//Handles form changes
  const handleAddFormChange = (e) => {
    setAddFormData({ ...addFormData, [e.target.name]: e.target.value });
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };
//Handles form submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const startDateTime = new Date(`${addFormData.date}T${addFormData.startTime}`);
      const endDateTime = new Date(`${addFormData.date}T${addFormData.endTime}`);

      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ ...addFormData, start: startDateTime, end: endDateTime }),
      });

      setShowAddModal(false);
      setAddFormData({ title: '', date: '', startTime: '', endTime: '', location: '', doctorName: '', purpose: '', summary: '' });
      fetchAppointments();
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };
  //Handles Appointment completion.
  const handleMarkAsComplete = async () => {
    if (!selectedEvent) return;
    await fetch(`/api/appointments/${selectedEvent._id}/complete`, {
      method: 'PATCH',
      headers: { 'x-auth-token': token },
    });
    handleCloseModal();
    fetchAppointments();
  };

  // Styling application for conditional events.
  const eventStyleGetter = (event) => {
    let style = {
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };

    if (event.resource.completed) {
      style.backgroundColor = 'var(--text-secondary)';
      style.textDecoration = 'line-through';
    } else {
      style.backgroundColor = 'var(--primary-color)';
    }
    return { style };
  };

  // Rendering.
  return (
    <div className="feature-container">
      <div className="feature-header">
        <h1>Appointment Calendar</h1>
        <button onClick={() => setShowAddModal(true)}><i className="fas fa-plus"></i> Add Appointment</button>
      </div>

      <div style={{ height: '500px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          date={date}
          view={view}
          onNavigate={handleNavigate}
          onView={handleView}
          eventPropGetter={eventStyleGetter}
        />
      </div>

      {/* Add new appointment */}
      <CSSTransition in={showAddModal} nodeRef={addModalRef} timeout={300} classNames="modal" unmountOnExit>
        <div className="modal" ref={addModalRef}>
          <div className="modal-content">
            <h2>Add New Appointment</h2>
            <form onSubmit={handleAddSubmit}>
              <input type="text" name="title" placeholder="Appointment Title" onChange={handleAddFormChange} required />
              <input type="date" name="date" onChange={handleAddFormChange} required />
              <label>Start Time:</label>
              <input type="time" name="startTime" onChange={handleAddFormChange} required />
              <label>End Time:</label>
              <input type="time" name="endTime" onChange={handleAddFormChange} required />
              <input type="text" name="doctorName" placeholder="Doctor's Name" onChange={handleAddFormChange} />
              <input type="text" name="location" placeholder="Location" onChange={handleAddFormChange} />
              <input type="text" name="purpose" placeholder="Purpose of Visit" onChange={handleAddFormChange} />
              <textarea name="summary" placeholder="Post-Visit Summary" onChange={handleAddFormChange}></textarea>
              <button type="submit"><i className="fas fa-save"></i> Save Appointment</button>
              <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      </CSSTransition>

      {/* Event details/editing */}
      <CSSTransition in={selectedEvent !== null} nodeRef={detailsModalRef} timeout={300} classNames="modal" unmountOnExit>
        <div className="modal" ref={detailsModalRef}>
          <div className="modal-content">
            {isEditing ? (
              <form onSubmit={handleUpdate}>
                <h2>Edit Appointment</h2>
                <input type="text" name="title" value={editFormData.title} onChange={handleEditFormChange} />
                <input type="date" name="date" value={editFormData.date} onChange={handleEditFormChange} />
                <label>Start Time:</label>
                <input type="time" name="startTime" value={editFormData.startTime} onChange={handleEditFormChange} />
                <label>End Time:</label>
                <input type="time" name="endTime" value={editFormData.endTime} onChange={handleEditFormChange} />
                <input type="text" name="doctorName" placeholder="Doctor's Name" value={editFormData.doctorName || ''} onChange={handleEditFormChange} />
                <input type="text" name="location" placeholder="Location" value={editFormData.location || ''} onChange={handleEditFormChange} />
                <input type="text" name="purpose" placeholder="Purpose of Visit" value={editFormData.purpose || ''} onChange={handleEditFormChange} />
                <textarea name="summary" placeholder="Post-Visit Summary" value={editFormData.summary || ''} onChange={handleEditFormChange}></textarea>
                <button type="submit"><i className="fas fa-save"></i> Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
              </form>
            ) : (
              <div>
                {selectedEvent && (
                  <>
                    <h2>{selectedEvent.title}</h2>
                    <p><strong>Status:</strong> {selectedEvent.completed ? 'Completed' : 'Pending'}</p>
                    <p><strong>Created By:</strong> {selectedEvent.createdBy}</p>
                    <p><strong>When:</strong> {new Date(selectedEvent.start).toLocaleString()} to {new Date(selectedEvent.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p><strong>Doctor:</strong> {selectedEvent.doctorName}</p>
                    <p><strong>Location:</strong> {selectedEvent.location}</p>
                    <p><strong>Purpose:</strong> {selectedEvent.purpose}</p>
                    {selectedEvent.summary && (
                        <div>
                            <h4>Post-Visit Summary:</h4>
                            <p>{selectedEvent.summary}</p>
                        </div>
                    )}

                    {!selectedEvent.completed && (
                        <button onClick={handleMarkAsComplete} className="administer-button">
                            <i className="fas fa-check-circle"></i> Mark as Completed
                        </button>
                    )}
                    <button onClick={() => setIsEditing(true)}><i className="fas fa-pencil-alt"></i> Edit</button>
                    <button onClick={handleDelete} className="delete-button"><i className="fas fa-trash-alt"></i> Delete</button>
                    <button type="button" onClick={handleCloseModal}>Close</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CSSTransition>
    </div>
  );
}


//Exporting.
export default AppointmentCalendar;