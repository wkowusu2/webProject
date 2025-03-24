import React, { useState, useEffect } from 'react';
import './Network.css';
import { FaUserPlus, FaMapMarkerAlt } from 'react-icons/fa';
import ProfileModal from './ProfileModal';
import { getFirestore, collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, query, where, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Network = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('connections');
  const [socialTab, setSocialTab] = useState('following');
  
  // State for data
  const [connections, setConnections] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  
  // State for modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileType, setProfileType] = useState('');

  // Get Firebase instances
  const db = getFirestore();
  const auth = getAuth();

  // Fetch network data from Firebase
  useEffect(() => {
    const fetchNetworkData = async () => {
      if (!auth.currentUser) return;
      
      setLoading(true);
      try {
        const userId = auth.currentUser.uid;
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Fetch connections
          const connectionsData = [];
          if (userData.connections && userData.connections.length > 0) {
            const connectionsQuery = query(
              collection(db, 'users'), 
              where('uid', 'in', userData.connections)
            );
            const connectionsSnapshot = await getDocs(connectionsQuery);
            connectionsSnapshot.forEach(doc => {
              connectionsData.push({ id: doc.id, ...doc.data() });
            });
          }
          setConnections(connectionsData);
          
          // Fetch invitations
          const invitationsData = [];
          if (userData.invitations && userData.invitations.length > 0) {
            const invitationsQuery = query(
              collection(db, 'users'), 
              where('uid', 'in', userData.invitations)
            );
            const invitationsSnapshot = await getDocs(invitationsQuery);
            invitationsSnapshot.forEach(doc => {
              invitationsData.push({ id: doc.id, ...doc.data() });
            });
          }
          setInvitations(invitationsData);
          
          // Fetch following
          const followingData = [];
          if (userData.following && userData.following.length > 0) {
            const followingQuery = query(
              collection(db, 'users'), 
              where('uid', 'in', userData.following)
            );
            const followingSnapshot = await getDocs(followingQuery);
            followingSnapshot.forEach(doc => {
              followingData.push({ id: doc.id, ...doc.data() });
            });
          }
          setFollowing(followingData);
          
          // Fetch followers
          const followersData = [];
          if (userData.followers && userData.followers.length > 0) {
            const followersQuery = query(
              collection(db, 'users'), 
              where('uid', 'in', userData.followers)
            );
            const followersSnapshot = await getDocs(followersQuery);
            followersSnapshot.forEach(doc => {
              followersData.push({ id: doc.id, ...doc.data() });
            });
          }
          setFollowers(followersData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching network data:', err);
        setError('Failed to load network data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkData();
  }, [auth.currentUser, db]);

  // Function to handle accepting an invitation
  const handleAcceptInvitation = async (invitationId) => {
    if (!auth.currentUser) return;
    
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, 'users', userId);
      
      // Add to connections and remove from invitations
      await updateDoc(userRef, {
        connections: arrayUnion(invitationId),
        invitations: arrayRemove(invitationId)
      });
      
      // Update the other user's connections
      const otherUserRef = doc(db, 'users', invitationId);
      await updateDoc(otherUserRef, {
        connections: arrayUnion(userId)
      });
      
      // Update local state
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (invitation) {
        setConnections(prev => [...prev, invitation]);
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      }
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to accept invitation. Please try again.');
    }
  };

  // Function to handle ignoring an invitation
  const handleIgnoreInvitation = async (invitationId) => {
    if (!auth.currentUser) return;
    
    try {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, 'users', userId);
      
      // Remove from invitations
      await updateDoc(userRef, {
        invitations: arrayRemove(invitationId)
      });
      
      // Update local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err) {
      console.error('Error ignoring invitation:', err);
      setError('Failed to ignore invitation. Please try again.');
    }
  };

  // Function to handle following a user
  const handleFollow = async (userId) => {
    if (!auth.currentUser) return;
    
    try {
      const currentUserId = auth.currentUser.uid;
      const userRef = doc(db, 'users', currentUserId);
      
      // Add to following
      await updateDoc(userRef, {
        following: arrayUnion(userId)
      });
      
      // Add to the other user's followers
      const otherUserRef = doc(db, 'users', userId);
      await updateDoc(otherUserRef, {
        followers: arrayUnion(currentUserId)
      });
      
      // Update local state
      const userToFollow = followers.find(f => f.id === userId);
      if (userToFollow) {
        setFollowing(prev => [...prev, userToFollow]);
      }
    } catch (err) {
      console.error('Error following user:', err);
      setError('Failed to follow user. Please try again.');
    }
  };

  // Function to handle unfollowing a user
  const handleUnfollow = async (userId) => {
    if (!auth.currentUser) return;
    
    try {
      const currentUserId = auth.currentUser.uid;
      const userRef = doc(db, 'users', currentUserId);
      
      // Remove from following
      await updateDoc(userRef, {
        following: arrayRemove(userId)
      });
      
      // Remove from the other user's followers
      const otherUserRef = doc(db, 'users', userId);
      await updateDoc(otherUserRef, {
        followers: arrayRemove(currentUserId)
      });
      
      // Update local state
      setFollowing(prev => prev.filter(f => f.id !== userId));
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setError('Failed to unfollow user. Please try again.');
    }
  };

  // Function to open profile modal
  const openProfileModal = (profile, type) => {
    setSelectedProfile(profile);
    setProfileType(type);
    setIsProfileModalOpen(true);
  };

  // Function to close profile modal
  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedProfile(null);
  };

  // Render invitation card
  const renderInvitationCard = (invitation) => (
    <div className="invitation-card" key={invitation.id}>
      <img
        src={invitation.photoURL || 'https://via.placeholder.com/80'}
        alt={invitation.displayName}
        className="invitation-avatar"
      />
      <div className="invitation-info">
        <h3>{invitation.displayName}</h3>
        <p>{invitation.title || 'Healthcare Professional'}</p>
        <div className="invitation-location">
          <FaMapMarkerAlt /> {invitation.location || 'Location not specified'}
        </div>
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

  // Render user card
  const renderUserCard = (user, type) => (
    <div 
      className="user-card" 
      key={user.id}
      onClick={() => openProfileModal(user, type)}
    >
      <img
        src={user.photoURL || 'https://via.placeholder.com/80'}
        alt={user.displayName}
        className="user-avatar"
      />
      <div className="user-info">
        <h3>{user.displayName}</h3>
        <p>{user.title || 'Healthcare Professional'}</p>
        <div className="user-location">
          <FaMapMarkerAlt /> {user.location || 'Location not specified'}
        </div>
      </div>
      {type === 'following' && (
        <button 
          className="unfollow-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleUnfollow(user.id);
          }}
        >
          Unfollow
        </button>
      )}
      {type === 'follower' && !following.some(f => f.id === user.id) && (
        <button 
          className="follow-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleFollow(user.id);
          }}
        >
          <FaUserPlus /> Follow
        </button>
      )}
    </div>
  );

  return (
    <div className="network-page">
      <div className="network-header">
        <h1>Your Network</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading network data...</div>
      ) : (
        <div className="network-content-wrapper">
          <div className="network-sidebar">
            <div className="network-stats">
              <div 
                className={`stat-item ${activeTab === 'connections' ? 'active' : ''}`}
                onClick={() => setActiveTab('connections')}
              >
                <h3>All Connections</h3>
                <div className="stat-number">{connections.length}</div>
              </div>
              <div 
                className={`stat-item ${activeTab === 'invitations' ? 'active' : ''}`}
                onClick={() => setActiveTab('invitations')}
              >
                <h3>Invitations</h3>
                <div className="stat-number">{invitations.length}</div>
              </div>
              <div 
                className={`stat-item ${activeTab === 'social' ? 'active' : ''}`}
                onClick={() => setActiveTab('social')}
              >
                <h3>Following/followers</h3>
                <div className="stat-number">{following.length + followers.length}</div>
              </div>
            </div>
          </div>

          <div className="network-main">
            {activeTab === 'invitations' && (
              <div className="invitations-section">
                <h2 className="section-title">Pending Invitations</h2>
                {invitations.length > 0 ? (
                  <div className="invitations-grid">
                    {invitations.map(invitation => renderInvitationCard(invitation))}
                  </div>
                ) : (
                  <div className="empty-state">No pending invitations</div>
                )}
              </div>
            )}

            {activeTab === 'connections' && (
              <div className="connections-section">
                <h2 className="section-title">Your Connections</h2>
                {connections.length > 0 ? (
                  <div className="connections-grid">
                    {connections.map(connection => renderUserCard(connection, 'connection'))}
                  </div>
                ) : (
                  <div className="empty-state">No connections yet</div>
                )}
              </div>
            )}

            {activeTab === 'social' && (
              <div className="social-tabs-content">
                <div className="tabs-header">
                  <button 
                    className={`tab-btn ${socialTab === 'following' ? 'active' : ''}`}
                    onClick={() => setSocialTab('following')}
                  >
                    Following ({following.length})
                  </button>
                  <button 
                    className={`tab-btn ${socialTab === 'followers' ? 'active' : ''}`}
                    onClick={() => setSocialTab('followers')}
                  >
                    Followers ({followers.length})
                  </button>
                </div>

                {socialTab === 'following' && (
                  <div className="social-grid">
                    {following.length > 0 ? (
                      following.map(user => renderUserCard(user, 'following'))
                    ) : (
                      <div className="empty-message">You are not following anyone yet</div>
                    )}
                  </div>
                )}

                {socialTab === 'followers' && (
                  <div className="social-grid">
                    {followers.length > 0 ? (
                      followers.map(user => renderUserCard(user, 'follower'))
                    ) : (
                      <div className="empty-message">You don't have any followers yet</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        profile={selectedProfile}
        profileType={profileType}
      />
    </div>
  );
};

export default Network;