import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase.config";
import { useNavigate } from "react-router-dom"; // For navigation

const Messages = ({ userId }) => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "chats"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesBySender = {};
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const senderId = data.senderId === userId ? data.receiverId : data.senderId;
        
        if (!messagesBySender[senderId]) {
          messagesBySender[senderId] = { senderId, lastMessage: data.text };
        }
      });

      setConversations(Object.values(messagesBySender));
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="messages-list">
      <h2>Messages</h2>
      <ul>
        {conversations.map((chat) => (
          <li key={chat.senderId} onClick={() => navigate(`/chat/${chat.senderId}`)}>
            <strong>Sender ID:</strong> {chat.senderId} <br />
            <span>{chat.lastMessage}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Messages;
