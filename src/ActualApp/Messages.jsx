import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, or, getDoc,doc } from "firebase/firestore";
import { db, auth } from "../../firebase.config";
import { onAuthStateChanged } from "firebase/auth";

const Messages = () => {
  const [connections, setConnections] = useState([]); // Connected users
  const [selectedUser, setSelectedUser] = useState(null); // Chat recipient
  const [chats, setChats] = useState([]); // Chat history
  const [currentUser, setCurrentUser] = useState(null);
  const [newMessage, setNewMessage] = useState(""); // New message input

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
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Sidebar */}
      <div style={{ width: "30%", borderRight: "1px solid #ccc", padding: "10px" }}>
        <h2>Messages</h2>

        {/* List of Connected Users */}
        <h4>Connected Users</h4>
        {connections.length === 0 ? (
          <p>No connections yet</p>
        ) : (
          connections.map((conn) => (
            <div
              key={conn.userId}
              style={{
                padding: "10px",
                borderBottom: "1px solid #ddd",
                cursor: "pointer",
                backgroundColor: selectedUser === conn.userId ? "#f0f0f0" : "transparent",
              }}
              onClick={() => setSelectedUser(conn.userId)}
            >
              <p><strong>{conn.fullName}</strong></p>
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column" }}>
        {selectedUser ? (
          <>
            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: "auto", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
              {chats.length > 0 ? (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    style={{
                      textAlign: chat.sender === currentUser.uid ? "right" : "left",
                      marginBottom: "10px",
                    }}
                  >
                    <p
                      style={{
                        display: "inline-block",
                        padding: "8px",
                        borderRadius: "10px",
                        backgroundColor: chat.sender === currentUser.uid ? "#dcf8c6" : "#f1f1f1",
                      }}
                    >
                      {chat.message}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#888" }}>Start a chat</p>
              )}
            </div>

            {/* Input Field for Sending Messages */}
            <div style={{ display: "flex", marginTop: "10px" }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ flex: 1, padding: "8px" }}
              />
              <button onClick={sendMessage} style={{ marginLeft: "10px", padding: "8px 15px", cursor: "pointer" }}>
               Send
              </button>
            </div>
          </>
        ) : (
          <p>Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
};

export default Messages;
