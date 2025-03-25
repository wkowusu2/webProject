import React from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

const Hospitals = () => {
  const hospitals = [
    {
      id: 1,
      name: "Korle Bu Teaching Hospital",
      location: "Accra, Ghana",
      phone: "+233 302-666-666",
      email: "info@kbth.gov.gh",
      imageUrl: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?ixlib=rb-4.0.3",
      services: [
        "Emergency Care",
        "Surgery",
        "Pediatrics",
        "Cardiology",
        "Orthopedics"
      ]
    },
    {
      id: 2,
      name: "37 Military Hospital",
      location: "Accra, Ghana",
      phone: "+233 302-777-777",
      email: "contact@37military.gh",
      imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3",
      services: [
        "Emergency Services",
        "Military Medicine",
        "General Surgery",
        "Internal Medicine",
        "Obstetrics"
      ]
    },
    {
      id: 3,
      name: "Greater Accra Regional Hospital",
      location: "Ridge, Accra",
      phone: "+233 302-888-888",
      email: "info@ridgehospital.org",
      imageUrl: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?ixlib=rb-4.0.3",
      services: [
        "Maternity Care",
        "Neurology",
        "Dental Services",
        "Physiotherapy",
        "Radiology"
      ]
    },
    {
      id: 4,
      name: "Tema General Hospital",
      location: "Tema, Greater Accra",
      phone: "+233 303-999-999",
      email: "contact@temageneral.com",
      imageUrl: "https://images.unsplash.com/photo-1626315869436-d6989dd83277?ixlib=rb-4.0.3",
      services: [
        "General Medicine",
        "Pediatrics",
        "General Surgery",
        "Obstetrics",
        "Gynecology"
      ]
    }
  ];

  return (
    <div className="hospitals-container">
      <h2>Available Hospitals</h2>
      <div className="hospitals-grid">
        {hospitals.map(hospital => (
          <div key={hospital.id} className="hospital-card">
            <div className="hospital-image">
              <img 
                src={hospital.imageUrl} 
                alt={hospital.name} 
              />
            </div>
            <div className="hospital-info">
              <h3>{hospital.name}</h3>
              <div className="hospital-details">
                <p className="location">
                  <FaMapMarkerAlt /> {hospital.location}
                </p>
                <p className="phone">
                  <FaPhone /> {hospital.phone}
                </p>
                <p className="email">
                  <FaEnvelope /> {hospital.email}
                </p>
              </div>
              <div className="hospital-services">
                <h4>Available Services:</h4>
                <div className="services-tags">
                  {hospital.services.map((service, index) => (
                    <span key={index} className="service-tag">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hospitals;