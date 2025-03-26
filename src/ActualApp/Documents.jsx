import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineCalendar, AiOutlineClockCircle, AiOutlineClose } from "react-icons/ai";
import "./Documents.css";
import Referrals from "./Referrals"; // Import the Referrals component
import PatientSummary from "./PatientSummary"; // Import the PatientSummary component
import Hospitals from "./Hospitals"; // Add this import

// Add these profile image constants
const PATIENT_IMAGES = {
  male: [
    'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  ],
  female: [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=150'
  ]
};

const Documents = ({ initialSection }) => {
  const [activeSection, setActiveSection] = useState("appointments");
  const [activeTab, setActiveTab] = useState("upcoming");
  const navigate = useNavigate();

  // Add these new states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      type: "Consultation",
      date: "23.03.2025",
      time: "11:00-11:30",
      patient: "Faustina",
      gender: "female",
      avatar: PATIENT_IMAGES.female[0]
    },
    {
      id: 2,
      type: "Checkup",
      date: "23.03.2025",
      time: "1:00-1:30",
      patient: "David",
      gender: "male",
      avatar: PATIENT_IMAGES.male[0]
    },
    {
      id: 3,
      type: "Checkup",
      date: "23.03.2025",
      time: "3:00-3:30",
      patient: "Flamy",
      gender: "female",
      avatar: PATIENT_IMAGES.male[1]
    },
    {
      id: 4,
      type: "Consultation",
      date: "24.03.2025",
      time: "11:00-11:30",
      patient: "Roger",
      gender: "male",
      avatar: PATIENT_IMAGES.male[2]
    }
  ]);

  // Add this new state at the top with other states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Add these handler functions
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleReschedule = () => {
    setIsRescheduling(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedAppointment || !newDate || !newTime) return;

    try {
      // Update the appointment
      const updatedAppointment = {
        ...selectedAppointment,
        date: newDate,
        time: newTime
      };

      // Update in your appointments state
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt.id === selectedAppointment.id ? updatedAppointment : apt
        )
      );

      // Reset states
      setIsRescheduling(false);
      setIsModalOpen(false);
      setNewDate('');
      setNewTime('');
      setSelectedAppointment(null);

    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;

    try {
      // Remove from appointments state
      setAppointments(prevAppointments => 
        prevAppointments.filter(apt => apt.id !== selectedAppointment.id)
      );

      // Close modal and reset states
      setIsModalOpen(false);
      setSelectedAppointment(null);

    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  // Add this new function to handle appointment creation
  const handleCreateAppointment = (newAppointment) => {
    const appointmentId = appointments.length + 103; // Generate unique ID
    const appointment = {
      id: appointmentId,
      ...newAppointment,
      avatar: getGenderBasedImage(newAppointment.patient, newAppointment.gender)
    };
    
    setAppointments(prev => [...prev, appointment]);
    setIsCreateModalOpen(false);
  };

  // Add this helper function
  const getGenderBasedImage = (name, gender) => {
    const imageArray = gender === 'female' ? PATIENT_IMAGES.female : PATIENT_IMAGES.male;
    const index = name.charAt(0).toLowerCase().charCodeAt(0) % imageArray.length;
    return imageArray[index];
  };

  // Add this sorting helper function after the getGenderBasedImage function
  const sortAppointments = (appointments) => {
    return [...appointments].sort((a, b) => {
      // First, sort by emergency status
      if (a.type === "Emergency" && b.type !== "Emergency") return -1;
      if (b.type === "Emergency" && a.type !== "Emergency") return 1;

      // Then sort by date and time
      const dateTimeA = new Date(`${a.date} ${a.time.split('-')[0]}`);
      const dateTimeB = new Date(`${b.date} ${b.time.split('-')[0]}`);
      return dateTimeA - dateTimeB;
    });
  };

  // Use the initialSection prop if provided
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // Sample appointments data
  const pastAppointments = [
    {
      id: 101,
      type: "Consultation",
      date: "15.02.2025",
      time: "09:00-09:30",
      patient: "John Smith",
      gender: "male",
      avatar: PATIENT_IMAGES.male[2]
    },
    {
      id: 102,
      type: "Checkup",
      date: "10.02.2025",
      time: "14:00-14:30",
      patient: "Sarah Johnson",
      gender: "female",
      avatar: PATIENT_IMAGES.female[2]
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "appointments":
        return (
          <div className="section-content appointments-content">
            <div className="appointments-header">
              <div className="tab-header">
                <h3
                  className={activeTab === "upcoming" ? "active" : ""}
                  onClick={() => setActiveTab("upcoming")}
                >
                  Upcoming
                </h3>
                <h3
                  className={activeTab === "past" ? "active" : ""}
                  onClick={() => setActiveTab("past")}
                >
                  Past
                </h3>
              </div>
              <button 
                className="create-appointment-btn"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Appointment
              </button>
            </div>
            <div className="appointments-list">
              {activeTab === "upcoming" && (
                <>
                  {sortAppointments(appointments).map(appointment => (
                    <div 
                      key={appointment.id} 
                      className={`appointment-item ${appointment.type === 'Emergency' ? 'emergency' : ''}`}
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <div className={`appointment-type ${appointment.type.toLowerCase()}`}>
                        {appointment.type}
                      </div>
                      <div className="appointment-details">
                        <div className="appointment-info-row">
                          <div>
                            <div className="appointment-date">{appointment.date}</div>
                            <div className="appointment-time">{appointment.time}</div>
                          </div>
                          <div className="appointment-patient">
                            <img
                              src={appointment.avatar}
                              alt={appointment.patient}
                              className="patient-avatar"
                            />
                            <span className="patient-name">{appointment.patient}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {activeTab === "past" && (
                <>
                  {pastAppointments.map(appointment => (
                    <div key={appointment.id} className="appointment-item" onClick={() => handleAppointmentClick(appointment)}>
                      <div className={`appointment-type ${appointment.type.toLowerCase()}`}>
                        {appointment.type}
                      </div>
                      <div className="appointment-details">
                        <div className="appointment-info-row">
                          <div>
                            <div className="appointment-date">{appointment.date}</div>
                            <div className="appointment-time">{appointment.time}</div>
                          </div>
                          <div className="appointment-patient">
                            <img
                              src={appointment.avatar}
                              alt={appointment.patient}
                              className="patient-avatar"
                            />
                            <span className="patient-name">{appointment.patient}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        );
      case "referral":
        return <Referrals />;
      case "summary":
        return <PatientSummary />;
      case "hospitals":
        return <Hospitals />;
      default:
        return <div className="section-content">Select a section</div>;
    }
  };

  return (
    <div className="documents-container">
      <div className="documents-main">
        <nav className="documents-nav">
          <div
            className={`nav-item ${
              activeSection === "appointments" ? "active" : ""
            }`}
            onClick={() => setActiveSection("appointments")}
          >
            Appointments
          </div>
          <div
            className={`nav-item ${
              activeSection === "referral" ? "active" : ""
            }`}
            onClick={() => setActiveSection("referral")}
          >
            Referral track
          </div>
          <div
            className={`nav-item ${
              activeSection === "summary" ? "active" : ""
            }`}
            onClick={() => setActiveSection("summary")}
          >
            Patient summary
          </div>
          <div
            className={`nav-item ${activeSection === "hospitals" ? "active" : ""}`}
            onClick={() => setActiveSection("hospitals")}
          >
            Hospitals
          </div>
        </nav>
      </div>
      <div className={`${activeSection === "appointments" ? "appointments-container" : ""} 
                       ${activeSection === "referral" ? "referrals-section-container" : ""} 
                       ${activeSection === "summary" ? "patient-summary-section-container" : ""}
                       ${activeSection === "hospitals" ? "hospitals-section-container" : ""}`}>
        {renderContent()}
      </div>
      <AppointmentModal
        appointment={selectedAppointment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReschedule={handleReschedule}
        onCancel={handleCancel}
        isRescheduling={isRescheduling}
        newDate={newDate}
        newTime={newTime}
        setNewDate={setNewDate}
        setNewTime={setNewTime}
        handleConfirmReschedule={handleConfirmReschedule}
      />
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateAppointment={handleCreateAppointment}
      />
    </div>
  );
};

// Add the AppointmentModal component
const AppointmentModal = ({ 
  appointment, 
  isOpen, 
  onClose, 
  onReschedule, 
  onCancel,
  isRescheduling,
  newDate,
  newTime,
  setNewDate,
  setNewTime,
  handleConfirmReschedule
}) => {
  if (!isOpen || !appointment) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="appointment-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <AiOutlineClose />
        </button>
        
        <div className="modal-content">
          <div className="appointment-header">
            <img 
              src={appointment.avatar} 
              alt={appointment.patient} 
              className="patient-avatar-large" 
            />
            <h2>{appointment.patient}</h2>
          </div>

          <div className="appointment-details">
            <div className="detail-item">
              <AiOutlineCalendar />
              <span>{appointment.date}</span>
            </div>
            <div className="detail-item">
              <AiOutlineClockCircle />
              <span>{appointment.time}</span>
            </div>
            <div className="appointment-type-badge">
              {appointment.type}
            </div>
          </div>

          {isRescheduling ? (
            <div className="reschedule-form">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="date-input"
              />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="time-input"
              />
              <div className="reschedule-actions">
                <button 
                  className="confirm-btn"
                  onClick={handleConfirmReschedule}
                  disabled={!newDate || !newTime}
                >
                  Confirm Reschedule
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => onClose()}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="modal-actions">
              <button className="reschedule-btn" onClick={onReschedule}>
                Reschedule
              </button>
              <button className="cancel-btn" onClick={onCancel}>
                Cancel Appointment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add this new component after the AppointmentModal component
const CreateAppointmentModal = ({ isOpen, onClose, onCreateAppointment }) => {
  const [formData, setFormData] = useState({
    patient: '',
    gender: 'male',
    type: 'Consultation',
    date: '',
    time: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateAppointment(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="appointment-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <AiOutlineClose />
        </button>
        
        <div className="modal-content">
          <h2>Create New Appointment</h2>
          <form onSubmit={handleSubmit} className="create-appointment-form">
            <div className="form-group">
              <label>Patient Name</label>
              <input
                type="text"
                value={formData.patient}
                onChange={e => setFormData({...formData, patient: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Gender</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({...formData, gender: e.target.value})}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Appointment Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                required
              >
                <option value="Consultation">Consultation</option>
                <option value="Checkup">Checkup</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
                required
              />
            </div>
            
            <button type="submit" className="create-btn">
              Create Appointment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Documents;
