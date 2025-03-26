import React from 'react';
import './ProfileModal.css';
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaUserMd, FaHospital } from 'react-icons/fa';

const ProfileModal = ({ isOpen, onClose, profile, profileType }) => {
  if (!isOpen || !profile) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        
        <div className="profile-header">
          <div className="profile-image-container">
            <img 
              src={profile.photoURL || 'https://via.placeholder.com/150'} 
              alt={profile.fullName} 
              className="profile-image"
            />
            <div className="profile-type-badge">{profileType}</div>
          </div>
          
          <div className="profile-basic-info">
            <h2 className="profile-name">{profile.fullName}</h2>
            <div className="profile-specialization">
              <FaUserMd />
              <span>{profile.specialization || 'Healthcare Professional'}</span>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <FaHospital className="detail-icon" />
            <div className="detail-content">
              <label>Institution</label>
              <p>{profile.institution || 'Not specified'}</p>
            </div>
          </div>

          <div className="detail-item">
            <FaMapMarkerAlt className="detail-icon" />
            <div className="detail-content">
              <label>Location</label>
              <p>{profile.location || 'Not specified'}</p>
            </div>
          </div>

          {profile.email && (
            <div className="detail-item">
              <FaEnvelope className="detail-icon" />
              <div className="detail-content">
                <label>Email</label>
                <p>{profile.email}</p>
              </div>
            </div>
          )}

          {profile.phone && (
            <div className="detail-item">
              <FaPhone className="detail-icon" />
              <div className="detail-content">
                <label>Phone</label>
                <p>{profile.phone}</p>
              </div>
            </div>
          )}
        </div>

        {profile.bio && (
          <div className="profile-bio">
            <h3>About</h3>
            <p>{profile.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;