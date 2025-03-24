import React, { useState, useEffect } from 'react';
import './Network.css';
import { AiOutlineCheck, AiOutlinePlus, AiOutlineUser, AiOutlineArrowLeft } from 'react-icons/ai';
import { FaMapMarkerAlt } from 'react-icons/fa';
import ProfileModal from './ProfileModal';
import axios from 'axios';

const Network = () => {
  const [activeTab, setActiveTab] = useState('connections');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connections, setConnections] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [stats, setStats] = useState({ connections: 0, following: 0, followers: 0 });

  // API endpoints
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://your-api-url';
  const endpoints = {
    stats: '/api/network/stats',
    invitations: '/api/network/invitations',
    connections: '/api/network/connections',
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch network stats
        const statsResponse = await axios.get(`${API_BASE_URL}${endpoints.stats}`);
        setStats(statsResponse.data);

        // Fetch invitations
        const invitationsResponse = await axios.get(`${API_BASE_URL}${endpoints.invitations}`);
        setInvitations(invitationsResponse.data);

        // Fetch connections
        const connectionsResponse = await axios.get(`${API_BASE_URL}${endpoints.connections}`);
        setConnections(connectionsResponse.data);

        setIsLoading(false);
      } catch (err) {
        setError('Failed to load data');
        console.error('Error fetching data:', err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/network/invitations/${invitationId}/accept`);
      
      // Remove the accepted invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      // Update the connections list
      const connectionsResponse = await axios.get(`${API_BASE_URL}${endpoints.connections}`);
      setConnections(connectionsResponse.data);
      
      // Update stats
      const statsResponse = await axios.get(`${API_BASE_URL}${endpoints.stats}`);
      setStats(statsResponse.data);
    } catch (err) {
      setError('Failed to accept invitation');
      console.error('Error accepting invitation:', err);
    }
  };

  const handleIgnoreInvitation = async (invitationId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/network/invitations/${invitationId}/ignore`);
      
      // Remove the ignored invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err) {
      setError('Failed to ignore invitation');
      console.error('Error ignoring invitation:', err);
    }
  };

  const openProfileModal = (profile) => {
    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
  };

  const renderInvitationCard = (invitation) => (
    <div key={invitation.id} className="invitation-card">
      <img src={invitation.avatar} alt={invitation.name} className="invitation-avatar" />
      <div className="invitation-info">
        <h3>{invitation.name}</h3>
        <p>{invitation.title}</p>
        <p className="invitation-location">
          <FaMapMarkerAlt /> {invitation.location}
        </p>
      </div>
      <div className="invitation-actions">
        <button 
          className="accept-btn"
          onClick={() => handleAcceptInvitation(invitation.id)}
        >
          Accept
        </button>
        <button 
          className="ignore-btn"
          onClick={() => handleIgnoreInvitation(invitation.id)}
        >
          Ignore
        </button>
      </div>
    </div>
  );

  return (
    <div className="network-page">
      {isLoading && <div className="loading">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="network-header">
        <AiOutlineArrowLeft size={24} />
        <h1>Network</h1>
      </div>
      
      <div className="network-content-wrapper">
        <div className="network-sidebar">
          <div className="network-stats">
            <div className="stat-item">
              <h3>All connections</h3>
              <span className="stat-number">{stats.connections}</span>
            </div>
            <div className="stat-item">
              <h3>Following/</h3>
              <h3>Followers</h3>
              <span className="stat-number">{stats.following + stats.followers}</span>
            </div>
          </div>
        </div>
        
        <div className="network-main">
          <div className="network-content">
            {activeTab === 'connections' && (
              <>
                {invitations.length > 0 && (
                  <div className="invitations-section">
                    <h2 className="section-title">Invitations ({invitations.length})</h2>
                    <div className="invitations-grid">
                      {invitations.map(invitation => renderInvitationCard(invitation))}
                    </div>
                  </div>
                )}
                
                <div className="connections-grid">
                  {connections.map(user => (
                    <div key={user.id} className="user-card" onClick={() => openProfileModal(user)}>
                      <img src={user.avatar} alt={user.name} className="user-avatar" />
                      <div className="user-info">
                        <h3>{user.name}</h3>
                        <p>{user.title}</p>
                        <p className="user-location">
                          <FaMapMarkerAlt /> {user.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isProfileModalOpen && (
        <ProfileModal 
          profile={selectedProfile}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Network;