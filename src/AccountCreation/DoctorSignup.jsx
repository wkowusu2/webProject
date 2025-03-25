import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css';
import Navbar from '../components/Navbar/Navbar';
import { useLocation } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../../firebase.config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const DoctorSignup = () => {
  const location = useLocation();
  const { selectedOption } = location.state || {};
  const [formData, setFormData] = useState({
    firstName: '',
    lastName:'',
    email: '',
    phone: '',
    specialization: '',
    hospital: '',
    experience: '',
    password: '',
    confirmPassword: '', 
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    // Validate full name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'first name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    // Validate specialization
    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const signUpWithEmail = async (email, password, firstName, lastName, phone, specialization, hospital, experience) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userWithId = doc(db, "users", user.uid); 
      const docRef = await setDoc(userWithId, {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        specialization,
        createdAt: new Date(),
        phoneNo: phone,
        role: selectedOption,
        hospital,
        experience
      });
      
      console.log("User signed up and stored in Firestore!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing up: ", error);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {

      // Register the user
      signUpWithEmail(
        formData.email, 
        formData.password, 
        formData.firstName, 
        formData.lastName, 
        formData.phone, 
        formData.specialization, 
        formData.hospital, 
        formData.experience
      ); 

      // Redirect to dashboard
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ form: "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }; 

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user already exists in Firestore
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          fullName: user.displayName,
          createdAt: new Date(),
          role: selectedOption,   // Adjust role as needed
        });
      }

      console.log("User signed in:", user);
      navigate("/dashboard"); // Redirect after successful sign-in
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Navbar />
      <div className="signup-container">
        <div className="signup-form-container">
          <div className="signup-header">
            <h1>Create Doctor Account</h1>
            <p>Join our healthcare network and connect with patients</p>
          </div>
          
          <form onSubmit={handleSubmit} className="signup-form">
            {errors.form && <div className="form-error-message">{errors.form}</div>}
            
            <div className="form-columns">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="fullName">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    name="firstName" 
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="fullName">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    name="lastName" 
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="specialization">Specialization</label>
                  <input 
                    type="text" 
                    id="specialization" 
                    name="specialization" 
                    value={formData.specialization}
                    onChange={handleChange}
                    className={errors.specialization ? 'error' : ''}
                  />
                  {errors.specialization && <span className="error-message">{errors.specialization}</span>}
                </div>
              </div>
              
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="hospital">Hospital/Clinic</label>
                  <input 
                    type="text" 
                    id="hospital" 
                    name="hospital" 
                    value={formData.hospital}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="experience">Years of Experience</label>
                  <input 
                    type="number" 
                    id="experience" 
                    name="experience" 
                    min="0"
                    value={formData.experience}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-input-container">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="password" 
                      name="password" 
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? 'error' : ''}
                    />
                    <span 
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </span>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <div className="password-input-container">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? 'error' : ''}
                    />
                    <span 
                      className="password-toggle-icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </span>
                  </div>
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>
            
            <div className="form-footer">
              <button 
                type="submit" 
                className="form-signup-button"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <button 
                type="button"
                className="google-signup-button" 
                onClick={signInWithGoogle}
              >
                <FcGoogle className="google-icon" />
                <span>Continue with Google</span>
              </button>
              <p className="login-link">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default DoctorSignup;