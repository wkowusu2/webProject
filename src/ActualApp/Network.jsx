import React, { useState, useEffect } from 'react';
import './Network.css';
import { FaUserPlus, FaMapMarkerAlt } from 'react-icons/fa';
import ProfileModal from './ProfileModal';
import {  collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove, query, where, getDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { auth,db }  from '../../firebase.config.js';

const Network = ({userId}) => {
  userId = auth.currentUser?.uid
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('connections');
  const [socialTab, setSocialTab] = useState('following');
  
  // State for data
  const [connections, setConnections] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [userDetails, setUserDetails] = useState({}); // Store user details
  const [unconnectedUserList, setUnconnectedUserList] = useState([]);
  
  // State for modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileType, setProfileType] = useState('');

  // Get Firebase instances
  

  // Fetch network data from Firebase
  useEffect(() => {
    const fetchNetworkData = async () => {
      if (!auth.currentUser) return;
  
      setLoading(true);
      try {
        const userId = auth.currentUser.uid;
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
  
          // Fetch connections (user1 or user2 matching userId)
          const u1 = query(collection(db, "connections"), where("user1", "==", userId));
          const u2 = query(collection(db, "connections"), where("user2", "==", userId));
  
          const [conn1, conn2] = await Promise.all([getDocs(u1), getDocs(u2)]);
          const allConnections = [...conn1.docs, ...conn2.docs].map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          setConnections(allConnections);
  
          // Fetch pending connection requests
          const q = query(
            collection(db, "requests"),
            where("receiverId", "==", userId),
            where("status", "==", "pending")
          );
          const requestDocs = await getDocs(q);
          const invitationsData = requestDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setInvitations(invitationsData);
  
          // Fetch following users
          let followingData = [];
          if (userData.following?.length > 0) {
            const followingQuery = query(collection(db, "users"), where("uid", "in", userData.following));
            const followingSnapshot = await getDocs(followingQuery);
            followingData = followingSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          }
          setFollowing(followingData);
  
          // Fetch followers
          let followersData = [];
          if (userData.followers?.length > 0) {
            const followersQuery = query(collection(db, "users"), where("uid", "in", userData.followers));
            const followersSnapshot = await getDocs(followersQuery);
            followersData = followersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          }
          setFollowers(followersData);
        }
  
        setError(null);
      } catch (err) {
        console.error("Error fetching network data:", err);
        setError("Failed to load network data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchNetworkData();
  }, [auth.currentUser, db]); // Removed `connections` to prevent infinite re-renders
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (connections.length === 0) return;
  
      const userInfo = {};
      const userPromises = connections.map(async (conn) => {
        const connectedUserId = conn.user1 === auth.currentUser?.uid ? conn.user2 : conn.user1;
        if (!userInfo[connectedUserId]) {
          const userRef = doc(db, "users", connectedUserId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            userInfo[connectedUserId] = { id: connectedUserId, ...userSnap.data() };
          }
        }
      });
  
      await Promise.all(userPromises);
      setUserDetails(userInfo);
    };
  
    fetchUserDetails();
  }, [connections]);  // Separate effect for user details fetching

  //fetching a list of all users except the current user 
  //this is going to be used for the connect with other users side
  useEffect(() => {
    if (!userDetails) return;

    const fetchConnections = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const allUsers = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
        // Fetch connections where the user is either user1 or user2
        const connectionsSnapshot = await getDocs(
          query(collection(db, "connections"), 
            where("user1", "==", auth.currentUser.uid))
        );
        
        const reverseConnectionsSnapshot = await getDocs(
          query(collection(db, "connections"), 
            where("user2", "==", auth.currentUser.uid))
        );
    
        const connectedUserIds = [
          ...connectionsSnapshot.docs.map((doc) => doc.data().user2),
          ...reverseConnectionsSnapshot.docs.map((doc) => doc.data().user1)
        ];
    
        // Filter users who are not connected
        const unconnectedUsers = allUsers.filter(user => 
          user.id !== auth.currentUser.uid && !connectedUserIds.includes(user.id)
        );
    
        console.log("Unconnected Users:", unconnectedUsers); // Debugging output
        setUnconnectedUserList(unconnectedUsers);
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };

    fetchConnections();
  }, [auth.currentUser]);
  


  
  //handlesInvitation acceptance 
  const handleInvitationAcceptance = async (requestId,receiverId, senderId, accept) => {
    try {
      if (accept) {
        // Create a connection in "connections" collection
        await addDoc(collection(db, "connections"), {
          user1: receiverId,
          user2: senderId,
          connectedAt: new Date().toISOString(),
        });
      }

      // Remove the request from "requests" collection
      await deleteDoc(doc(db, "requests", requestId));

      // Remove from local state
      setInvitations(invitations.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error("Error handling request:", error);
    }
  };

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
      console.lo
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
          onClick={() => handleInvitationAcceptance(invitation.id, invitation.receiverId,invitation.senderId, true)}
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
        alt={user.fullName}
        className="user-avatar"
      />
      <div className="user-info">
        <h3>{user.fullName}</h3> 
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
      {type === 'unconnected users' && (
        <button 
          className="follow-btn"
          onClick={(e) => {
            e.stopPropagation();
            sendRequest(userId , user.id);
          }}
        >
          <FaUserPlus /> Add
        </button>
      )}
    </div>
  );

  //sending a connection request
  const sendRequest = async (senderId,receiverId) => {
    try {
      // Check if a request already exists
      const q = query(
        collection(db, "requests"),
        where("senderId", "==", senderId),
        where("receiverId", "==", receiverId)
      );
      const existingRequests = await getDocs(q);

      if (!existingRequests.empty) {
        alert("Connection request already sent!");
        return;
      }

      // Add a new request
      await addDoc(collection(db, "requests"), {
        senderId,
        receiverId,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      alert("Connection request sent!");
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };


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
                <h3>Following/Connect with other users</h3>
                {/* <div className="stat-number">{following.length + unconnectedUserList.length}</div>   */}
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
                    {connections.map((conn) => {
                        const connectedUserId = conn.user1 === userId ? conn.user2 : conn.user1;
                        const user = userDetails[connectedUserId]; // Get full user details
                        console.log(user);
                        return user ? renderUserCard(user, "connection") : <p key={connectedUserId}>Loading...</p>;
                      })}
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
                    className={`tab-btn ${socialTab === 'connect with other users' ? 'active' : ''}`}
                    onClick={() => setSocialTab('connect with other users')}
                  >
                    Connect with other users ({unconnectedUserList.length})
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

                {socialTab === 'connect with other users' && (
                  <div className="social-grid">
                    {unconnectedUserList.length > 0 ? (
                      unconnectedUserList.map(user => renderUserCard(user, 'unconnected users')) //modified
                    ) : (
                      <div className="empty-message">No users to connect with</div>
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