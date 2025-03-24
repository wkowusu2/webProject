import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase.config';
import LoadingSpinner from './components/LoadingSpinner';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import LogoSection from './components/LogoSection/LogoSection';
import AboutUs from './components/AboutUs/aboutUs';
import Milestone from './components/Milestone/Milestone';
import HowItWorks from './components/HowItWorks/HowItWorks';
import Exclusive from './components/ExclusivePackages/ExclusivePackages';
import Growth from './components/Growth/Growth';
import FAQ from './components/FAQ/FAQ';
import Referral from './components/ReferralPartner/ReferralPartner';
import Footer from './components/Footer/Footer';
import PatientSignup from './AccountCreation/PatientSignup';
import DoctorSignup from './AccountCreation/DoctorSignup';
import Login from './AccountCreation/Login';
import AccountSelection from './AccountCreation/AccountSelection';
import Dashboard from './ActualApp/Dashboard';
import Referrals from './ActualApp/Referrals';
import Messages from './ActualApp/Messages';
import ChatScreen from './components/ChatScreen';
import Connections from './Connections/Connections';


function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      console.log(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {user ? (
          <>
            <Route path="/dashboard" element={<Dashboard userId={user.uid} />} />
            <Route path="/referrals" element={<Referrals />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
            <Route path="/messages" element={<Messages userId={user.uid} />} />
            <Route path="/chat/:senderId" element={<ChatScreen userId={user.uid} />} />
            <Route path="/connections" element={<Connections userId={user.uid} />} />
          </>
        ) : (
          <>
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <Hero />
                  <LogoSection />
                  <AboutUs />
                  <Milestone />
                  <HowItWorks />
                  <Exclusive />
                  <Growth />
                  <FAQ />
                  <Referral />
                  <Footer />
                </>
              }
            />
            <Route path="/signup/patient" element={<PatientSignup />} />
            <Route path="/signup/doctors" element={<DoctorSignup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/account-selection" element={<AccountSelection />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
