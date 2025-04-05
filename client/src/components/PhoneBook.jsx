// PhoneBook.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PhoneBook.css';
import '../styles/ContactModal.css';
import ContactModal from './ContactModal';

const PhoneBook = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const navigate = useNavigate();
  const contactsWindowRef = useRef(null);
  const contactPicInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

  useEffect(() => {
    fetch('/contacts', { credentials: 'include' })
      .then(response => response.json())
      .then(data => setContacts(data))
      .catch(err => console.error("Error fetching contacts:", err));
  }, []);

  // Scroll to the first contact whose name matches the given letter.
  const scrollToLetter = (letter) => {
    if (!contactsWindowRef.current) return;
    
    // Get all contact items and convert to array for easier processing
    const items = Array.from(contactsWindowRef.current.querySelectorAll('.phonebook-contact-item'));
    
    // Find the first matching contact
    const matchingContact = items.find(item => {
      const nameElement = item.querySelector('.phonebook-contact-name');
      if (!nameElement) return false;
      
      const name = nameElement.textContent.trim();
      if (letter === '0-9') {
        return /^\d/.test(name);
      }
      return name.toUpperCase().startsWith(letter);
    });

    // If found, scroll to it
    if (matchingContact) {
      matchingContact.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Alphabet array: A-Z and "0-9"
  const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '0-9'];

  // CRUD Operations
  const handleAdd = () => {
    setModalMode('add');
    setSelectedContact(null);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (!selectedContact) return;
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedContact || !window.confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/contacts/${selectedContact.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setContacts(contacts.filter(c => c.id !== selectedContact.id));
        setSelectedContact(null);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleSave = async (formData) => {
    try {
      // Verify we have a user_id
      if (!formData.user_id) {
        throw new Error('User ID is required');
      }

      const method = modalMode === 'add' ? 'POST' : 'PATCH';
      const url = modalMode === 'add' ? '/contacts' : `/contacts/${selectedContact.id}`;

      console.log('Sending contact data:', formData); // Debug log

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save contact');
      }

      const updatedContact = await response.json();
      
      if (modalMode === 'add') {
        setContacts(prevContacts => [...prevContacts, updatedContact]);
      } else {
        setContacts(prevContacts => 
          prevContacts.map(c => c.id === updatedContact.id ? updatedContact : c)
        );
      }
      
      setSelectedContact(updatedContact);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving contact:', error);
      alert(`Failed to save contact: ${error.message}`);
    }
  };

  return (
    <div className="phonebook-container">
      {/* Purple square as a background element */}
      <div className="phonebook-square"></div>

      {/* Exit button */}
      <div className="phonebook-purple-logo-circle" onClick={() => navigate('/business-mode-2')}>
        Exit<br />Phone Book
      </div>

      {/* "Contacts" header */}
      <h1 className="contacts-header">Contacts</h1>

      {/* Vertical Alphabet Tabs */}
      <div className="alphabet-tabs">
        {alphabet.map(letter => (
          <div
            key={letter}
            className="alphabet-tab"
            onClick={() => scrollToLetter(letter)}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* New Contacts Window (Alphabetical List) */}
      <div className="phonebook-contacts-window" ref={contactsWindowRef}>
        {contacts.length > 0 ? (
          contacts
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(contact => (
              <div
                key={contact.id}
                className={`phonebook-contact-item ${selectedContact?.id === contact.id ? 'selected' : ''}`}
                onClick={() => setSelectedContact(contact)}
              >
                {contact.contact_pic ? (
                  <img 
                    src={`http://127.0.0.1:5555${contact.contact_pic}`}
                    alt={contact.name}
                    className="phonebook-contact-preview"
                  />
                ) : (
                  <div className="default-contact-pic-preview">
                    <span>MUSIC - ONE</span>
                  </div>
                )}
                <div className="contact-details">
                  <span className="phonebook-contact-name">{contact.name}</span>
                  <div className="contact-columns">
                    <div className="contact-column-left">
                      <p><strong>Discipline:</strong> {contact.discipline || "---"}</p>
                      <p><strong>Phone:</strong> {contact.phone || "---"}</p>
                      <p><strong>Email:</strong> {contact.email || "---"}</p>
                      <p><strong>Company:</strong> {contact.company || "---"}</p>
                      <p><strong>Address:</strong> {contact.address || "---"}</p>
                    </div>
                    <div className="contact-column-right">
                      <p><strong>Social #1:</strong> {contact.social1 || "---"}</p>
                      <p><strong>Social #2:</strong> {contact.social2 || "---"}</p>
                      <p><strong>Social #3:</strong> {contact.social3 || "---"}</p>
                      <p><strong>Social #4:</strong> {contact.social4 || "---"}</p>
                    </div>
                  </div>
                  {contact.bio && (
                    <div className="contact-bio">
                      <p><strong>Bio:</strong> {contact.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
        ) : (
          <p>No contacts available</p>
        )}
      </div>

      {/* Full Contact Details Section */}
      <div className="phonebook-content-wrapper">
        <div className="phonebook-contacts-list">
          <div className="phonebook-contact-details">
            <div className="phonebook-contact-pic-square">
              {selectedContact && selectedContact.contact_pic ? (
                <img 
                  src={`http://127.0.0.1:5555${selectedContact.contact_pic}?t=${Date.now()}`}
                  alt={selectedContact?.name || "Contact"}
                  className="phonebook-contact-picture"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.outerHTML = `<div class="default-contact-pic"><span>MUSIC - ONE</span></div>`;
                  }}
                />
              ) : (
                <div className="default-contact-pic">
                  <span>MUSIC - ONE</span>
                </div>
              )}
              <button className="edit-button" onClick={() => contactPicInputRef.current.click()}>
                Edit
              </button>
              <input 
                type="file" 
                ref={contactPicInputRef} 
                onChange={() => {}}
                style={{ display: 'none' }} 
                accept="image/*" 
              />
            </div>
            <div className="phonebook-contact-background">
              <div className="phonebook-track-contact-info-square">
                <h2>{selectedContact?.name || "Select a Contact"}</h2>
                <div className="phonebook-contact-info-grid">
                  <p><strong>Email:</strong> {selectedContact?.email || "---"}</p>
                  <p><strong>Phone:</strong> {selectedContact?.phone || "---"}</p>
                  <p><strong>Company:</strong> {selectedContact?.company || "---"}</p>
                  <p><strong>Discipline:</strong> {selectedContact?.discipline || "---"}</p>
                  { (selectedContact?.social1 || selectedContact?.social2 || selectedContact?.social3 || selectedContact?.social4) && (
                    <>
                      <br />
                      {selectedContact.social1 && <p><strong>Social #1:</strong> {selectedContact.social1}</p>}
                      {selectedContact.social2 && <p><strong>Social #2:</strong> {selectedContact.social2}</p>}
                      {selectedContact.social3 && <p><strong>Social #3:</strong> {selectedContact.social3}</p>}
                      {selectedContact.social4 && <p><strong>Social #4:</strong> {selectedContact.social4}</p>}
                      <br />
                    </>
                  )}
                  <p><strong>Bio:</strong> {selectedContact?.bio || "No Bio"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update CRUD Buttons */}
      <div className="crud-buttons">
        <button className="crud-button crud-add" onClick={handleAdd}>Add</button>
        <button className="crud-button crud-edit" onClick={handleEdit}>Edit</button>
        <button className="crud-button crud-delete" onClick={handleDelete}>Delete</button>
      </div>

      {/* Add Modal Component */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contact={selectedContact}
        onSave={handleSave}
        mode={modalMode}
      />
    </div>
  );
};

export default PhoneBook;