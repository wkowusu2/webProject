import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { auth, db, googleProvider } from "../../firebase.config";
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  }; 

  //it is for the log out I will move it later

const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password); 
    const user = userCredential.user
    
    if (user) {
      
      const userRef = doc(db, "patients", user.uid); // Assuming users are stored in Firestore
      const userSnap = await getDoc(userRef);
      

      if (userSnap.exists()) {
        console.log("User data:", userSnap.data());
      } else {
        console.log("No such user data in Firestore!");
      }
    }
    return true;
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
  }
}

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  // Simple credential check (for demo purposes)
  // In a real app, you would validate against an API
  try {
    const user = await signIn(formData.email, formData.password); 
    console.log(user);
    if(user){
      navigate('/dashboard');
    }
  } catch (error) {
    setError('An error occurred during login');
    console.error('Login error:', error);
  } finally {
    setLoading(false);
  }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("User signed in:", result.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-modal">
        <div className="login-left">
          <h1>Welcome Back!</h1>
          <p>Sign in to continue your healthcare journey with us.</p>
        </div>
        
        <div className="login-right">
          <div className="signup-prompt">
            <span>Don't have an account?</span>
            <Link to="/account-selection" className="login-signup-button">Sign up</Link>
          </div>
          
          <div className="login-header">
            <h2>Welcome Back to Medi-Link</h2>
            <p>Login to your account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">*Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">*Password</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="login-divider">
              <div className="line"></div>
              <span>Or</span>
              <div className="line"></div>
            </div>
            
            <div className="social-login">
              <button type="button" className="social-button facebook">
                <FontAwesomeIcon icon={faFacebookF} />
              </button>
              <button type="button" className="social-button google" onClick={signInWithGoogle}>
                <FontAwesomeIcon icon={faGoogle} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 