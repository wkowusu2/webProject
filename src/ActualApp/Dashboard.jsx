import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../firebase.config';
import "./Dashboard.css";
import Documents from "./Documents";
import Network from "./Network";
import Messages from "./Messages";
import {
  AiOutlineHome,
  AiOutlineCalendar,
  AiOutlineFile,
  AiOutlineTeam,
  AiOutlineMail,
  AiOutlineBell,
  AiOutlineSearch,
  AiOutlineCamera,
  AiOutlineFileText,
  AiOutlineVideoCamera,
  AiOutlineHeart,
  AiOutlineComment,
  AiOutlineShareAlt,
  AiOutlineCheck,
  AiOutlineLike,
  AiOutlineArrowRight,
  AiOutlineClockCircle,
  AiOutlineDown,
  AiOutlinePlus,
  AiOutlineUser,
  AiOutlineUsergroupAdd,
  AiOutlineLogout,
  AiOutlineMore,
  AiOutlineEdit,
  AiOutlineDelete
} from "react-icons/ai";
import { signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

 console.log("dashboard")

const Dashboard = ({userId}) => {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedWeek, setSelectedWeek] = useState("Weeks");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [postImage, setPostImage] = useState(null);
  const [connections, setConnections] = useState([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostOptions, setShowPostOptions] = useState(null);
  const [postVideo, setPostVideo] = useState(null);
  const navigate = useNavigate();
  
  
  // Get current date information
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Generate calendar days for the current week
  const generateCalendarDays = () => {
    const today = new Date(currentYear, currentMonth, currentDay);
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate the Monday of the current week (start with Sunday as first day)
    const sundayOffset = dayOfWeek === 0 ? 0 : -dayOfWeek; // If Sunday, stay on Sunday, otherwise go back to previous Sunday
    const sunday = new Date(today);
    sunday.setDate(today.getDate() + sundayOffset);
    
    // Generate array of dates for the week
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
      weekDays.push({
        date: day.getDate(),
        day: i, // 0 = Sunday, 1 = Monday, etc.
        isToday: day.getDate() === currentDay && 
                 day.getMonth() === currentMonth && 
                 day.getFullYear() === currentYear
      });
    }
    
    return weekDays;
  };
  
  const calendarDays = generateCalendarDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Sample invitation data
  const invitations = [
    {
      id: 1,
      name: "Edward Jackson",
      title: "MD, Neurology",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      accepted: true
    }
  ];
  
  // Sample messages data
  const messages = [
    {
      id: 1,
      name: "Jane Deer",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      message: "Lorem ipsum dolor sit amet, consectetur sdsfc ...",
      time: "7:31"
    },
    {
      id: 2,
      name: "Jane Deer",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      message: "Lorem ipsum dolor sit amet, consectetur sdsfc ...",
      time: "7:31"
    }
  ];
  
  // Sample appointments data
  const appointments = [
    {
      id: 1,
      type: "Consultation",
      date: "Today",
      time: "9:00 AM",
      patient: "John Smith",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      type: "Follow-up",
      date: "Today",
      time: "11:30 AM",
      patient: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg"
    },
    {
      id: 3,
      type: "Surgery",
      date: "Tomorrow",
      time: "10:00 AM",
      patient: "Michael Brown",
      avatar: "https://randomuser.me/api/portraits/men/33.jpg"
    }
  ];
  
  // Function to render the active component based on the selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "documents":
        return <Documents initialSection="appointments" />;
      case "network":
        return <Network userId />;
      case "messages":
        return <Messages />;
      default:
        return renderHomeContent();
    }
  };
  
  // Function to render home content
  const renderHomeContent = () => {
    return (
      <div className="dashboard-content">
        <div className="left-column">
          <h2 className="section-title">General Information</h2>
          
          <div className="general-info-card">
            {renderPostCreation()}
          </div>
          
          <div className="info-cards-container">
            {renderConnectionsCard()} {/* Replace the static connections card */}
            {renderInvitationsCard()}
          </div>
          
          {renderPosts()}
        </div>

        
        
        
        <div className="right-column">
          {/* User Profile */}
          <div className="user-profile">
            <img 
              src={auth.currentUser?.photoURL || "https://randomuser.me/api/portraits/men/85.jpg"} 
              alt={`Dr. ${auth.currentUser?.displayName?.split(' ').pop() || 'Krishna'}`} 
              className="user-profile-avatar" 
            />
            <h3 className="user-profile-greeting">
              Hey, Dr. {auth.currentUser?.displayName?.split(' ').pop() || 'Krishna'}
            </h3>
          </div>
          
          {/* Appointments Section */}
          <div className="appointments-section">
            <div className="appointments-header">
              <h3 className="sidebar-section-title">Appointments</h3>
              <div className="week-selector">
                <button className="week-dropdown">
                  {selectedWeek} <AiOutlineDown />
                </button>
              </div>
            </div>
            
            {/* Calendar */}
            <div className="calendar-container">
              <div className="calendar-header">
                {dayNames.map((name, index) => (
                  <span 
                    key={index}
                    className={calendarDays.find(day => day.day === index)?.isToday ? "active-day-header" : ""}
                  >
                    {name}
                  </span>
                ))}
              </div>
              <div className="calendar-days">
                {calendarDays.map((day, index) => (
                  <span 
                    key={index} 
                    className={day.isToday ? "active-day" : ""}
                  >
                    {day.date}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Appointments List */}
            <div className="appointments-list">
              {appointments.map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  {/* Appointment type displayed on top */}
                  <div className={`appointment-type-button ${appointment.type.toLowerCase()}`}>
                    {appointment.type}
                  </div>
                  {/* All other info stacked below */}
                  <div className="appointment-info">
                    <div className="appointment-date-time">
                      <div className="appointment-date">{appointment.date}</div>
                      <div className="appointment-time">{appointment.time}</div>
                    </div>
                    <div className="appointment-patient-info">
                      <img 
                        src={appointment.avatar} 
                        alt={appointment.patient} 
                        className="appointment-avatar" 
                      />
                      <span className="appointment-patient-name">{appointment.patient}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="view-all-appointments" onClick={navigateToAppointments}>
              <span>View all appointment</span>
            </button>
          </div>
          
          {/* Messages Section */}
          <div className="messages-section">
            <h3 className="sidebar-section-title">Messages</h3>
            <div className="messages-container">
              {messages.map((message, index) => (
                <React.Fragment key={message.id}>
                  <div className="message-item">
                    <img 
                      src={message.avatar} 
                      alt={message.name} 
                      className="message-avatar" 
                    />
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">{message.name}</span>
                        <span className="message-time">{message.time}</span>
                      </div>
                      <p className="message-preview">{message.message}</p>
                    </div>
                    <button className="message-action-button">
                      <AiOutlinePlus />
                    </button>
                  </div>
                  {index < messages.length - 1 && <div className="message-divider"></div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to navigate to appointments tab
  const navigateToAppointments = () => {
    setActiveTab("documents");
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConnections = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
  
      const connectionsRef = collection(db, 'users', user.uid, 'connections');
      const querySnapshot = await getDocs(connectionsRef);
      
      const fetchedConnections = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setConnections(fetchedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };
  
  const handleCreatePost = async () => {
    if (!newPost.trim() && !postImage) return;
  
    try {
      setIsLoading(true);
      const user = auth.currentUser;
      if (!user) return;
  
      let imageUrl = null;
      
      // Handle image upload first if there's an image
      if (postImage) {
        try {
          const storage = getStorage();
          const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${postImage.name}`);
          const snapshot = await uploadBytes(imageRef, postImage);
          imageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Failed to upload image. Please try again.');
          return;
        }
      }
  
      // Create post data with image URL if available
      const postData = {
        title: postTitle,
        content: newPost,
        authorId: user.uid,
        authorName: user.displayName || 'Dr Krishna',
        authorAvatar: user.photoURL || "https://randomuser.me/api/portraits/men/85.jpg",
        createdAt: serverTimestamp(),
        imageUrl: imageUrl, // Add the image URL to post data
        likes: 0,
        comments: 0,
        shares: 0
      };
  
      // Add post to Firestore
      const docRef = await addDoc(collection(db, 'posts'), postData);
      
      // Add new post to local state with all data including image
      const newPostWithId = {
        id: docRef.id,
        ...postData,
        createdAt: new Date(),
        imageUrl: imageUrl
      };
      
      setPosts(prevPosts => [newPostWithId, ...prevPosts]);
      
      // Reset form and close modal
      setPostTitle('');
      setNewPost('');
      setPostImage(null);
      setIsPostModalOpen(false);
  
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditPost = (post) => {
    setSelectedPost(post);
    // Add your edit logic here
    setShowPostOptions(null);
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      setShowPostOptions(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchConnections(); // Add this line
  }, []);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPostOptions && !event.target.closest('.post-options')) {
        setShowPostOptions(null);
      }
    };
  
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showPostOptions]);
  
  // Update the renderPostCreation function
const renderPostCreation = () => {
  const handlePhotoClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setPostImage(file);
        setIsPostModalOpen(true);
      }
    };
  };

  const handleVideoClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.click();
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setPostVideo(file);
        setIsPostModalOpen(true);
      }
    };
  };

  return (
    <div className="post-creation">
      <div className="post-input" onClick={() => setIsPostModalOpen(true)}>
        <span className="post-icon"><AiOutlineFileText /></span>
        <input 
          type="text" 
          placeholder="Start a post..." 
          readOnly
        />
      </div>
      <div className="post-input-actions">
        <button className="input-action-btn" onClick={handlePhotoClick}>
          <AiOutlineCamera className="action-icon" />
          <span>Photo</span>
        </button>
        <button className="input-action-btn" onClick={handleVideoClick}>
          <AiOutlineVideoCamera className="action-icon" />
          <span>Video</span>
        </button>
        <button className="input-action-btn" onClick={() => setIsPostModalOpen(true)}>
          <AiOutlineFileText className="action-icon" />
          <span>Article</span>
        </button>
      </div>
    </div>
  );
};
  
  const renderPosts = () => (
    <>
      {isLoading && !posts.length ? (
        <div className="loading-spinner">Loading posts...</div>
      ) : (
        <div className="posts-container">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-header-left">
                  <img 
                    src={post.authorAvatar} 
                    alt={post.authorName} 
                    className="post-avatar" 
                  />
                  <div className="post-author-info">
                    <h4 className="post-author-name">{post.authorName}</h4>
                    <p className="post-meta">
                      {post.createdAt instanceof Date 
                        ? post.createdAt.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : new Date(post.createdAt?.toDate()).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                      }
                    </p>
                  </div>
                </div>
                
                {/* Add post options menu */}
                <div className="post-options">
                  <button 
                    className="post-options-btn"
                    onClick={() => setShowPostOptions(showPostOptions === post.id ? null : post.id)}
                  >
                    <AiOutlineMore />
                  </button>
                  
                  {showPostOptions === post.id && (
                    <div className="post-options-menu">
                      <div 
                        className="post-option-item"
                        onClick={() => handleEditPost(post)}
                      >
                        <AiOutlineEdit />
                        <span>Edit Post</span>
                      </div>
                      <div 
                        className="post-option-item delete"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <AiOutlineDelete />
                        <span>Delete Post</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="post-content">
                {post.title && (
                  <h3 className="post-title">{post.title}</h3>
                )}
                <div className="post-body">
                  {post.imageUrl && (
                    <div className="post-image-container">
                      <img 
                        src={post.imageUrl} 
                        alt="Post content" 
                        className="post-image" 
                      />
                    </div>
                  )}
                  <div className="post-text">
                    <p>{post.content}</p>
                  </div>
                </div>
              </div>
              
              <div className="post-actions-bar">
                <div className="post-action">
                  <AiOutlineLike className="post-action-icon" />
                  <span>{post.likes} Likes</span>
                </div>
                <div className="post-action">
                  <AiOutlineComment className="post-action-icon" />
                  <span>{post.comments} Comments</span>
                </div>
                <div className="post-action">
                  <AiOutlineShareAlt className="post-action-icon" />
                  <span>{post.shares} Shares</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderConnectionsCard = () => (
    <div className="connections-card">
      <h2 className="connection-count">{connections.length}</h2>
      <p className="connection-label">Connections</p>
    </div>
  );

  // Update the renderInvitationsCard function
const renderInvitationsCard = () => (
  <div className="invitations-card">
    <h3 className="card-title">Invitations</h3>
    <div className="invitation-list">
      {invitations.map(invitation => (
        <div key={invitation.id} className="invitation-item">
          <img src={invitation.avatar} alt={invitation.name} className="invitation-avatar" />
          <div className="invitation-details">
            <h4 className="invitation-name">{invitation.name}</h4>
            <p className="invitation-title">{invitation.title}</p>
          </div>
          {invitation.accepted && (
            <div className="invitation-status accepted">
              <AiOutlineCheck />
            </div>
          )}
        </div>
      ))}
    </div>
    {invitations.length > 0 && (
      <button 
        className="view-all-link"
        onClick={() => {
          setActiveTab('network');
          // Optionally scroll to invitations section after navigation
          setTimeout(() => {
            const invitationsSection = document.getElementById('network-invitations');
            if (invitationsSection) {
              invitationsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }}
      >
        View all ({invitations.length})
      </button>
    )}
  </div>
);

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo">Medi-Link</div>
        </div>
        
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
        </div>
        
        <div className="nav-right">
          <div className="nav-icon-container">
            <AiOutlineBell className="nav-icon-bell" />
          </div>
          <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
            <img 
              src={auth.currentUser?.photoURL || "https://randomuser.me/api/portraits/men/85.jpg"} 
              alt="Doctor Profile" 
              className="user-avatar" 
            />
            <div className="user-dropdown">
              <span className="user-name">
                Dr. {auth.currentUser?.displayName?.split(' ').pop() || 'Krishna'}
              </span>
              <AiOutlineDown className="dropdown-icon" />
            </div>
            
            {showUserMenu && (
              <div className="user-dropdown-menu">
                <div className="menu-item">
                  <AiOutlineUser className="menu-icon" />
                  <span>My Profile</span>
                </div>
                <div className="menu-item" onClick={handleLogout}>
                  <AiOutlineLogout className="menu-icon" />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      <div className="main-wrapper">
        <div className="sidebar">
          <div
            className={`nav-item ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            <span className="nav-icon">
              <AiOutlineHome />
            </span>
            <span className="nav-text">Home</span>
          </div>
  
          <div
            className={`nav-item ${activeTab === "documents" ? "active" : ""}`}
            onClick={() => setActiveTab("documents")}
          >
            <span className="nav-icon">
              <AiOutlineFileText />
            </span>
            <span className="nav-text">Documents</span>
          </div>
          <div
            className={`nav-item ${activeTab === "network" ? "active" : ""}`}
            onClick={() => setActiveTab("network")}
          >
            <span className="nav-icon">
              <AiOutlineUsergroupAdd />
            </span>
            <span className="nav-text">Network</span>
          </div>
          <div
            className={`nav-item ${activeTab === "messages" ? "active" : ""}`}
            onClick={() => setActiveTab("messages")}
          >
            <span className="nav-icon">
              <AiOutlineMail />
            </span>
            <span className="nav-text">Messages</span>
          </div>
        </div>
        
        <div className="main-content">
          {renderActiveComponent()}
        </div>
        <PostModal 
          isOpen={isPostModalOpen}
          onClose={() => setIsPostModalOpen(false)}
          postTitle={postTitle}
          setPostTitle={setPostTitle}
          newPost={newPost}
          setNewPost={setNewPost}
          postImage={postImage}
          setPostImage={setPostImage}
          handleCreatePost={handleCreatePost}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

const PostModal = ({ 
  isOpen, 
  onClose, 
  postTitle,
  setPostTitle,
  newPost,
  setNewPost,
  postImage,
  setPostImage,
  handleCreatePost,
  isLoading 
}) => {
  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (e.g., 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setPostImage(file);
    }
  };

  return (
    <div className="post-modal-overlay" onClick={(e) => {
      if (e.target.className === 'post-modal-overlay') onClose();
    }}>
      <div className="post-modal">
        <div className="post-modal-header">
          <h3>Create a Post</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="post-modal-content">
          {/* Add user info section */}
          <div className="modal-user-info">
            <img 
              src={auth.currentUser?.photoURL || "https://randomuser.me/api/portraits/men/85.jpg"} 
              alt="User avatar" 
              className="modal-user-avatar" 
            />
            <span className="modal-user-name">
              {auth.currentUser?.displayName || "Dr Krishna"}
            </span>
          </div>

          <input
            type="text"
            className="post-title-input"
            placeholder="Add a title..."
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
          />
          
          <textarea
            className="post-content-input"
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            required
          />
          
          {postImage && (
            <div className="image-preview">
              <img 
                src={URL.createObjectURL(postImage)} 
                alt="Preview" 
              />
              <button 
                className="remove-image"
                onClick={() => setPostImage(null)}
              >×</button>
            </div>
          )}
        </div>
        
        <div className="post-modal-footer">
          <div className="modal-action-buttons">
            <button 
              className="upload-photo-btn"
              onClick={() => document.getElementById('postImage').click()}
            >
              <AiOutlineCamera />
              <span>Add Photo</span>
            </button>
            <input
              type="file"
              id="postImage"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          
          <button 
            className="post-submit-btn"
            onClick={handleCreatePost}
            disabled={isLoading || (!newPost.trim() && !postImage)}
          >
            {isLoading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
