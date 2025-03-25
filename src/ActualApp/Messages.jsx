import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, or, getDoc,doc } from "firebase/firestore";
import { db, auth } from "../../firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { AiOutlineSearch, AiOutlineSend } from "react-icons/ai";
import './Messages.css';

const Messages = () => {
  const [connections, setConnections] = useState([]); // Connected users
  const [selectedUser, setSelectedUser] = useState(null); // Chat recipient
  const [chats, setChats] = useState([]); // Chat history
  const [currentUser, setCurrentUser] = useState(null);
  const [newMessage, setNewMessage] = useState(""); // New message input
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConnections, setFilteredConnections] = useState([]);

  // Get the authenticated user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Fetch connections for the current user
  useEffect(() => {
    if (!currentUser) return;
  
    const q = query(
      collection(db, "connections"),
      or(where("user1", "==", currentUser.uid), where("user2", "==", currentUser.uid))
    );
  
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const usersData = await Promise.all(
        snapshot.docs.map(async (item) => {
          const data = item.data();
          const otherUserId = data.user1 === currentUser.uid ? data.user2 : data.user1;
  
          // Fetch user details from the users collection
          const userDoc = await getDoc(doc(db, "users", otherUserId));
  
          if (userDoc.exists()) {
            return {
              id: doc.id,
              userId: otherUserId,
              fullName: userDoc.data().fullName,
              profilePicture: userDoc.data().profilePicture,
            };
          }
          return null;
        })
      );
  
      // Filter out any null values
      setConnections(usersData.filter(user => user !== null));
    });
  
    return () => unsubscribe();
  }, [currentUser]);
  

  // Fetch chat history when a user is selected
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid), // Fetch messages where user is a participant
      orderBy("timestamp", "asc") // Order messages by time
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatMessages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((msg) => 
          (msg.sender === currentUser.uid && msg.receiver === selectedUser) ||
          (msg.sender === selectedUser && msg.receiver === currentUser.uid)
        ); // Filter messages between current user and selected user

      setChats(chatMessages);
    });

    return () => unsubscribe();
  }, [selectedUser, currentUser]);

  // Handle search
  useEffect(() => {
    if (!connections) return;
    
    const filtered = connections.filter(conn => 
      conn.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConnections(filtered);
  }, [searchTerm, connections]);

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await addDoc(collection(db, "chats"), {
      sender: currentUser.uid,
      receiver: selectedUser,
      message: newMessage,
      timestamp: serverTimestamp(),
      participants: [currentUser.uid, selectedUser], // Ensure both users are participants
    });

    setNewMessage(""); // Clear input field
  };

  return (
    <div className="messages-page-container">
      {/* Header */}
      <div className="messages-header">
        <h2>Messages</h2>
      </div>

      <div className="messages-content">
        {/* Left Sidebar */}
        <div className="messages-sidebar">
          {/* Search Bar */}
          <div className="messages-search">
            <AiOutlineSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Connected Users List */}
          <div className="messages-list">
            {filteredConnections.length === 0 ? (
              <p className="no-messages">
                {searchTerm ? 'No matching conversations' : 'No conversations yet'}
              </p>
            ) : (
              filteredConnections.map((conn) => (
                <div
                  key={conn.userId}
                  className={`message-item ${selectedUser === conn.userId ? 'active' : ''}`}
                  onClick={() => setSelectedUser(conn.userId)}
                >
                  <img 
                    src={conn.profilePicture || "https://randomuser.me/api/portraits/men/85.jpg"} 
                    alt={conn.fullName} 
                    className="message-avatar"
                  />
                  <div className="message-info">
                    <h4 className="message-sender">{conn.fullName}</h4>
                    <p className="message-text">Click to start chatting</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-window">
          {selectedUser ? (
            <>
              {/* Chat Messages */}
              <div className="chat-messages">
                {chats.length > 0 ? (
                  chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`chat-message ${chat.sender === currentUser.uid ? 'sent' : 'received'}`}
                    >
                      <div className="chat-message-content">
                        {chat.message}
                      </div>
                      <span className="message-time">
                        {chat.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="no-messages">Start a chat</p>
                )}
              </div>

              {/* Message Input */}
              <div className="message-input-wrapper">
                <input
                  type="text"
                  className="message-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button 
                  className="send-message-btn"
                  onClick={sendMessage}
                >
                  <AiOutlineSend />
                </button>
              </div>
            </>
          ) : (
            <div className="select-chat">
              <p>Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
