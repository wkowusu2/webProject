import React, { useState, useEffect } from 'react';
import { 
  AiOutlineEdit, 
  AiOutlineFileImage, 
  AiOutlineFilePdf,
  AiOutlinePlayCircle,
  AiOutlineDelete,
  AiOutlinePauseCircle,
  AiOutlineFile,
  AiOutlineDownload,
  AiOutlineEye,
  AiOutlineClose
} from 'react-icons/ai';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase.config";
import './PatientSummary.css';

const PATIENT_IMAGES = {
  female: [
    'https://randomuser.me/api/portraits/women/32.jpg',
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/women/68.jpg',
    'https://randomuser.me/api/portraits/women/90.jpg'
  ],
  male: [
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/men/44.jpg',
    'https://randomuser.me/api/portraits/men/68.jpg',
    'https://randomuser.me/api/portraits/men/90.jpg'
  ]
};

const PatientSummary = () => {
  const [reportText, setReportText] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformBars, setWaveformBars] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailDetails, setEmailDetails] = useState({
    recipientEmail: '',
    subject: '',
    message: ''
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    receiverEmail: '',
    subject: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [patientData, setPatientData] = useState({
    name: 'Jane Deer',
    age: '32',
    gender: 'female',
    avatar: PATIENT_IMAGES.female[0],
    purpose: 'Regular checkup and follow-up on previous medication. Patient reports occasional headaches and mild fatigue.'
  });

  // Handle report text change
  const handleReportChange = (e) => {
    setReportText(e.target.value);
  };

  // Handle prescription text change
  const handlePrescriptionChange = (e) => {
    setPrescriptionText(e.target.value);
  };

  // Toggle recording state
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setRecordingTime(0);
    }
  };

  // Handle file upload
  const handleUpload = (type) => {
    console.log(`Uploading ${type}...`);
    // Implement file upload logic here
  };

  // Simulate recording time and waveform
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        
        // Generate random waveform bars
        const newBars = Array.from({ length: 30 }, () => 
          Math.floor(Math.random() * 30) + 5
        );
        setWaveformBars(newBars);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRecording]);

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle document click
  const handleDocumentClick = (docType) => {
    setSelectedDocument(docType);
    console.log(`Viewing document: ${docType}`);
    // In a real app, this would open a preview or download dialog
  };

  // Close document preview
  const closeDocumentPreview = () => {
    setSelectedDocument(null);
  };

  // Add this function inside PatientSummary component
  const handleDocumentUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.png';
    input.multiple = true;
    input.click();
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      // Handle the uploaded files here
      console.log('Uploaded files:', files);
      // Add your file upload logic here
    };
  };

  // Add this function to handle email submission
  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    try {
      // Add report to Firestore
      await addDoc(collection(db, "reports"), {
        senderEmail: auth.currentUser.email,
        receiverEmail: emailDetails.recipientEmail,
        subject: emailDetails.subject,
        content: reportText, // Your report content
        prescriptionDetails: prescriptionText, // Your prescription content
        timestamp: serverTimestamp(),
      });

      setIsEmailModalOpen(false);
      setShowSuccessMessage(true);
      
      // Reset form
      setEmailDetails({
        recipientEmail: '',
        subject: '',
        message: ''
      });

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error sending report:", error);
      // Handle error appropriately
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "reports"), {
        senderEmail: auth.currentUser.email,
        receiverEmail: formData.receiverEmail,
        subject: formData.subject,
        content: formData.content,
        timestamp: serverTimestamp()
      });

      setFormData({ receiverEmail: '', subject: '', content: '' });
      setShowModal(false);
      alert('Report sent successfully!');
    } catch (error) {
      console.error("Error sending report:", error);
      alert('Failed to send report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="patient-summary-container">
      <div className="patient-summary-left">
        <div className="report-section">
          <h2>Write Report</h2>
          <div className="text-input-container">
            <textarea 
              className="text-input" 
              value={reportText} 
              onChange={handleReportChange}
              placeholder="Write your report here..."
            />
            <button className="edit-button">
              <AiOutlineEdit />
            </button>
          </div>
          <div className="upload-buttons">
            <button 
              className="upload-button image"
              onClick={() => handleUpload('image')}
            >
              <AiOutlineFileImage /> Upload Image
            </button>
            <button 
              className="upload-button pdf"
              onClick={() => handleUpload('pdf')}
            >
              <AiOutlineFilePdf /> Upload PDF
            </button>
          </div>
        </div>

        <div className="prescription-section">
          <h2>Write Prescription</h2>
          <div className="text-input-container">
            <textarea 
              className="text-input" 
              value={prescriptionText} 
              onChange={handlePrescriptionChange}
              placeholder="Write prescription details here..."
            />
            <button className="edit-button">
              <AiOutlineEdit />
            </button>
          </div>
        </div>

        <button className="send-button" onClick={() => setIsEmailModalOpen(true)}>
          Send to
        </button>
      </div>

      <div className="patient-summary-right">
        <div className="patient-card">
          <div className="patient-card-header">
            <h3>Patient Card</h3>
            <button 
              className="edit-patient-btn"
              onClick={() => setIsEditingPatient(true)}
            >
              <AiOutlineEdit /> Edit
            </button>
          </div>
          
          <div className="patient-info">
            <div className="patient-header">
              <div className="avatar-container">
                <img 
                  src={patientData.avatar} 
                  alt={patientData.name} 
                  className="patient-avatar" 
                />
                {isEditingPatient && (
                  <button 
                    className="change-avatar-btn"
                    onClick={() => {
                      const images = PATIENT_IMAGES[patientData.gender.toLowerCase()];
                      const newIndex = Math.floor(Math.random() * images.length);
                      setPatientData(prev => ({
                        ...prev,
                        avatar: images[newIndex]
                      }));
                    }}
                  >
                    Change Photo
                  </button>
                )}
              </div>
              <div className="patient-text">
                {isEditingPatient ? (
                  <div className="edit-fields">
                    <input
                      type="text"
                      value={patientData.name}
                      onChange={(e) => setPatientData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      className="edit-input"
                    />
                    <div className="demographics-edit">
                      <input
                        type="number"
                        value={patientData.age}
                        onChange={(e) => setPatientData(prev => ({
                          ...prev,
                          age: e.target.value
                        }))}
                        className="edit-input age"
                      />
                      <select
                        value={patientData.gender}
                        onChange={(e) => setPatientData(prev => ({
                          ...prev,
                          gender: e.target.value
                        }))}
                        className="edit-input gender"
                      >
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="patient-name">{patientData.name}</h4>
                    <p className="patient-demographics">
                      {patientData.age} years, {patientData.gender}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="visit-purpose">
            <h3>Purpose of Visit</h3>
            {isEditingPatient ? (
              <textarea
                value={patientData.purpose}
                onChange={(e) => setPatientData(prev => ({
                  ...prev,
                  purpose: e.target.value
                }))}
                className="edit-textarea"
              />
            ) : (
              <p>{patientData.purpose}</p>
            )}
          </div>

          {isEditingPatient && (
            <div className="edit-actions">
              <button 
                className="save-btn"
                onClick={() => setIsEditingPatient(false)}
              >
                Save Changes
              </button>
              <button 
                className="cancel-btn"
                onClick={() => {
                  setIsEditingPatient(false);
                  // Reset any unsaved changes if needed
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="document-preview-overlay" onClick={closeDocumentPreview}>
          <div className="document-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="document-preview-header">
              <h3>{selectedDocument === 'xray' ? 'X-Ray' : 
                   selectedDocument === 'history' ? 'History of Disease' : 'Analysis'}</h3>
              <button className="close-preview-btn" onClick={closeDocumentPreview}>×</button>
            </div>
            <div className="document-preview-content">
              {selectedDocument === 'xray' && (
                <img 
                  src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="X-Ray Sample" 
                  className="document-preview-image"
                />
              )}
              {selectedDocument === 'history' && (
                <div className="document-preview-text">
                  <h4>Patient History</h4>
                  <p>Patient has a history of hypertension diagnosed in January 2023.</p>
                  <p>Type 2 Diabetes diagnosed in March 2022.</p>
                  <p>No known allergies.</p>
                  <p>Family history of cardiovascular disease.</p>
                </div>
              )}
              {selectedDocument === 'analysis' && (
                <div className="document-preview-text">
                  <h4>Lab Analysis Results</h4>
                  <p>Blood Pressure: 130/85 mmHg</p>
                  <p>Blood Glucose: 110 mg/dL</p>
                  <p>Cholesterol: 195 mg/dL</p>
                  <p>HDL: 45 mg/dL</p>
                  <p>LDL: 120 mg/dL</p>
                </div>
              )}
            </div>
            <div className="document-preview-footer">
              <button className="download-btn">
                <AiOutlineDownload /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add this email modal */}
      {isEmailModalOpen && (
        <div className="email-modal-overlay">
          <div className="email-modal">
            <div className="email-modal-header">
              <h3>Send Information</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setIsEmailModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSendEmail} className="email-form">
              <div className="form-group">
                <label htmlFor="recipientEmail">Recipient Email</label>
                <input
                  type="email"
                  id="recipientEmail"
                  value={emailDetails.recipientEmail}
                  onChange={(e) => setEmailDetails({
                    ...emailDetails,
                    recipientEmail: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  value={emailDetails.subject}
                  onChange={(e) => setEmailDetails({
                    ...emailDetails,
                    subject: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Additional Message</label>
                <textarea
                  id="message"
                  value={emailDetails.message}
                  onChange={(e) => setEmailDetails({
                    ...emailDetails,
                    message: e.target.value
                  })}
                />
              </div>
              <button type="submit" className="send-email-btn">
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-message">
          Information sent successfully!
        </div>
      )}



      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Send Report</h2>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                <AiOutlineClose />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Recipient Email</label>
                <input
                  type="email"
                  required
                  value={formData.receiverEmail}
                  onChange={(e) => setFormData({
                    ...formData,
                    receiverEmail: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({
                    ...formData,
                    subject: e.target.value
                  })}
                />
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: e.target.value
                  })}
                />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSummary;