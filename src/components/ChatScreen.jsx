import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { collection, addDoc, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "../../firebase.config";

const ChatScreen = ({ userId }) => {
  const { senderId } = useParams(); // Get senderId from URL
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", userId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filteredMessages = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((msg) => msg.senderId === senderId || msg.receiverId === senderId);

      setMessages(filteredMessages);
    });

    return () => unsubscribe();
  }, [userId, senderId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    await addDoc(collection(db, "chats"), {
      senderId: userId,
      receiverId: senderId,
      text,
      timestamp: new Date(),
      participants: [userId, senderId], // Store conversation participants
    });
    setText("");
  };

  return (
    <div className="chat-container">
      <ul className="message-list">
        {messages.map((item) => (
          <li key={item.id} className={item.senderId === userId ? "sent" : "received"}>
            {item.text}
          </li>
        ))}
      </ul>
      <div className="input-container">
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatScreen;
