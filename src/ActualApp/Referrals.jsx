import React, { useState, useEffect } from 'react';
import { db, auth } from "../../firebase.config";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import './Referrals.css';

const Referrals = () => {
  const [activeTab, setActiveTab] = useState("received");
  const [receivedReports, setReceivedReports] = useState([]);
  const [madeReports, setMadeReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const reportsRef = collection(db, "reports");
    
    // Query for received reports
    const receivedQuery = query(
      reportsRef,
      where("receiverEmail", "==", auth.currentUser.email)
    );

    // Query for made reports
    const madeQuery = query(
      reportsRef,
      where("senderEmail", "==", auth.currentUser.email)
    );

    const unsubscribeReceived = onSnapshot(receivedQuery, (snapshot) => {
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReceivedReports(reports);
    });

    const unsubscribeMade = onSnapshot(madeQuery, (snapshot) => {
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMadeReports(reports);
    });

    setLoading(false);

    return () => {
      unsubscribeReceived();
      unsubscribeMade();
    };
  }, []);

  const renderReportCard = (report) => (
    <div className="report-card" key={report.id}>
      <div className="report-header">
        <h3>{report.subject}</h3>
        <span className="report-date">
          {report.timestamp?.toDate().toLocaleDateString()}
        </span>
      </div>
      <div className="report-content">
        <p>{report.content}</p>
      </div>
      <div className="report-footer">
        <span className="report-sender">
          From: {report.senderEmail}
        </span>
        <span className="report-receiver">
          To: {report.receiverEmail}
        </span>
      </div>
    </div>
  );

  return (
    <div className="referrals-container">
      <div className="referrals-tabs">
        <button
          className={`tab-button ${activeTab === "received" ? "active" : ""}`}
          onClick={() => setActiveTab("received")}
        >
          Received
        </button>
        <button
          className={`tab-button ${activeTab === "made" ? "active" : ""}`}
          onClick={() => setActiveTab("made")}
        >
          Made
        </button>
      </div>

      <div className="referrals-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === "received" && (
              <div className="reports-list">
                {receivedReports.length === 0 ? (
                  <p className="no-reports">No reports received</p>
                ) : (
                  receivedReports.map(report => renderReportCard(report))
                )}
              </div>
            )}
            {activeTab === "made" && (
              <div className="reports-list">
                {madeReports.length === 0 ? (
                  <p className="no-reports">No reports made</p>
                ) : (
                  madeReports.map(report => renderReportCard(report))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Referrals;