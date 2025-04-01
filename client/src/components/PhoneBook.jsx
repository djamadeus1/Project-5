// PhoneBook.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PhoneBook.css';
// import '../styles/Profile.css';

const PhoneBook = () => {
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/contacts', { credentials: 'include' })
      .then(response => response.json())
      .then(data => setContacts(data))
      .catch(err => console.error("Error fetching contacts:", err));
  }, []);

  return (
    <div className="phonebook-container">
      {/* Exit button remains outside the scaling wrapper */}
      <div className="phonebook-purple-logo-circle" onClick={() => navigate('/business-mode-2')}>
        Exit<br />Phone Book
      </div>

      {/* "Contacts" header added here */}
      <h1 className="contacts-header">Contacts</h1>

      {/* Wrapper that applies scaling to all contact cards */}
      <div className="phonebook-content-wrapper">
        <div className="phonebook-contacts-list">
          {contacts.length > 0 ? (
            contacts.map(contact => (
              <div key={contact.id} className="phonebook-contact-details">
                <div className="phonebook-contact-pic-square">
                  <img 
                    src={contact.contact_pic ? `http://127.0.0.1:5555${contact.contact_pic}` : "https://via.placeholder.com/150"}
                    alt={contact.name}
                    className="phonebook-contact-picture"
                  />
                </div>
                <div className="phonebook-contact-background">
                  <div className="phonebook-track-contact-info-square">
                    <h2>{contact.name}</h2>
                    <div className="phonebook-contact-info-grid">
                      <p><strong>Email:</strong> {contact.email}</p>
                      <p><strong>Phone:</strong> {contact.phone}</p>
                      <p><strong>Company:</strong> {contact.company}</p>
                      <p><strong>Discipline:</strong> {contact.discipline}</p>
                      {contact.bio && <p><strong>Bio:</strong> {contact.bio}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No contacts available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhoneBook;