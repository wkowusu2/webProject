import React, { useEffect, useState } from 'react'
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase.config";
function Connections({userId}) {

    // Function to send a connection request to a receiver ID
    const sendConnectionRequest = async (senderId, receiverId) => {
        try {
          await addDoc(collection(db, "requests"), {
            senderId,
            receiverId,
            status: "pending",
            createdAt: new Date().toISOString(),
          });
          console.log("Connection request sent!");
        } catch (error) {
          console.error("Error sending request:", error);
        }
      }; 
    //fetching pending requests
      const fetchPendingRequests = async (userId) => {
        try {
          const q = query(
            collection(db, "requests"),
            where("receiverId", "==", userId),
            where("status", "==", "pending")
          );
          
          const querySnapshot = await getDocs(q);
          return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error("Error fetching requests:", error);
          return [];
        }
      };  

      //accepting or rejecting

      const handleConnectionResponse = async (requestId, senderId, receiverId, accept) => {
        try {
          const requestRef = doc(db, "requests", requestId);
      
          if (accept) {
            // Add connection to "connections" collection
            await addDoc(collection(db, "connections"), {
              user1: senderId,
              user2: receiverId,
              connectedAt: new Date().toISOString(),
            });
      
            // Update request status
            await updateDoc(requestRef, { status: "accepted" });
          } else {
            // Delete the request if rejected
            await deleteDoc(requestRef);
          }
          
          console.log(accept ? "Connection accepted!" : "Connection rejected.");
        } catch (error) {
          console.error("Error updating request:", error);
        }
      }; 

      const ConnectButton = ({ senderId, receiverId }) => {
        const handleConnect = async () => {
          await sendConnectionRequest(senderId, receiverId);
        };
      
        return <button onClick={handleConnect}>Connect</button>;
      }; 

      const PendingRequests = ({ userId }) => {
        const [requests, setRequests] = useState([]);
      
        useEffect(() => {
          fetchPendingRequests(userId).then(setRequests);
        }, [userId]);
      
        return (
          <div>
            <h3>Pending Requests</h3>
            {requests.length === 0 ? <p>No pending requests.</p> : null}
            {requests.map((req) => (
              <div key={req.id}>
                <p>Request from {req.senderId}</p>
                <button onClick={() => handleConnectionResponse(req.id, req.senderId, req.receiverId, true)}>Accept</button>
                <button onClick={() => handleConnectionResponse(req.id, req.senderId, req.receiverId, false)}>Reject</button>
              </div>
            ))}
          </div>
        );
      };
      

  return (
    <div>
      <h1>Connection System</h1>
      <ConnectButton senderId="user1" receiverId="user2" />
      <PendingRequests userId={userId} />
      {/* <ConnectedUsersList userId={userId} /> */}
    </div>
  )
}

export default Connections