import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db,auth } from "../../firebase.config";

const ChatWindow = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const user = auth.currentUser;

  // Load messages in real-time
  useEffect(() => {
    if (!conversationId) return;

    const q = query(
      collection(db, `messages/${conversationId}/chats`),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMessages(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [conversationId]);

  // Send Message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    await addDoc(collection(db, `messages/${conversationId}/chats`), {
      sender: user.uid,
      message: newMessage,
      timestamp: serverTimestamp(),
    });

    setNewMessage("");
  };

  return (
    <div style={{ padding: "10px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
        {messages.map((msg) => (
          <p key={msg.id}>
            <strong>{msg.sender === user.uid ? "You" : "Other"}:</strong> {msg.message}
          </p>
        ))}
      </div>

      <div style={{ display: "flex", marginTop: "10px" }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{ flex: 1, padding: "5px" }}
        />
        <button onClick={sendMessage} style={{ marginLeft: "5px" }}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
