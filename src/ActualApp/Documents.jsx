import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Documents.css";
import Referrals from "./Referrals"; // Import the Referrals component
import PatientSummary from "./PatientSummary"; // Import the PatientSummary component
import Hospitals from "./Hospitals"; // Add this import

const Documents = ({ initialSection }) => {
  const [activeSection, setActiveSection] = useState("appointments");
  const [activeTab, setActiveTab] = useState("upcoming");
  const navigate = useNavigate();

  // Use the initialSection prop if provided
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  // Sample appointments data
  const appointments = [
    {
      id: 1,
      type: "Consultation",
      date: "23.03.2025",
      time: "11:00-11:30",
      patient: "Jane Deer",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      id: 2,
      type: "Checkup",
      date: "23.03.2025",
      time: "1:00-1:30",
      patient: "Jane Deer",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      id: 3,
      type: "Checkup",
      date: "23.03.2025",
      time: "3:00-3:30",
      patient: "Jane Deer",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      id: 4,
      type: "Consultation",
      date: "24.03.2025",
      time: "11:00-11:30",
      patient: "Jane Deer",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg"
    }
  ];

  // Past appointments data
  const pastAppointments = [
    {
      id: 101,
      type: "Consultation",
      date: "15.02.2025",
      time: "09:00-09:30",
      patient: "John Smith",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 102,
      type: "Checkup",
      date: "10.02.2025",
      time: "14:00-14:30",
      patient: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg"
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "appointments":
        return (
          <div className="section-content appointments-content">
            <div className="appointments-tabs">
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
              <div className="appointments-list">
                {activeTab === "upcoming" && (
                  <>
                    {appointments.map(appointment => (
                      <div key={appointment.id} className="appointment-item">
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
                      <div key={appointment.id} className="appointment-item">
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
    </div>
  );
};

export default Documents;
