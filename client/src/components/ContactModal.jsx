// ContactModal.jsx
import React, { useState, useEffect } from 'react';
import AutoResizeInput from './AutoResizeInput';

const ContactModal = ({ isOpen, onClose, contact, onSave, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    discipline: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    social1: '',
    social2: '',
    social3: '',
    social4: '',
    bio: ''
  });

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    }
  }, [contact]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Get the user_id from the current session instead of localStorage
    fetch('/check_session', {
      credentials: 'include'
    })
    .then(response => response.json())
    .then(userData => {
      const payload = { ...formData, user_id: userData.id };
      onSave(payload);
      onClose();
    })
    .catch(error => {
      console.error('Error getting user session:', error);
      alert('Failed to get user information. Please try again.');
    });
  };

  if (!isOpen) return null;

  return (
    <div className="contact-modal-overlay">
      <div className="contact-modal-content">
        <h2>{mode === 'add' ? 'Add New Contact' : 'Edit Contact'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="contact-form-group name-field">
            <label>Name:</label>
            <AutoResizeInput
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
              required
            />
          </div>

          <div className="contact-form-group discipline-field">
            <label>Discipline:</label>
            <AutoResizeInput
              name="discipline"
              value={formData.discipline}
              onChange={handleChange}
              placeholder="Enter discipline"
            />
          </div>

          <div className="contact-form-main-section">
            <div className="contact-form-left">
              <div className="contact-form-group">
                <label>Phone:</label>
                <AutoResizeInput
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone"
                />
              </div>

              <div className="contact-form-group">
                <label>Email:</label>
                <AutoResizeInput
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              </div>

              <div className="contact-form-group">
                <label>Company:</label>
                <AutoResizeInput
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter company"
                />
              </div>

              <div className="contact-form-group">
                <label>Address:</label>
                <AutoResizeInput
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </div>
            </div>

            <div className="contact-form-right">
              <div className="contact-form-group">
                <label>Social #1:</label>
                <AutoResizeInput
                  name="social1"
                  value={formData.social1}
                  onChange={handleChange}
                  placeholder="Social media link"
                />
              </div>

              <div className="contact-form-group">
                <label>Social #2:</label>
                <AutoResizeInput
                  name="social2"
                  value={formData.social2}
                  onChange={handleChange}
                  placeholder="Social media link"
                />
              </div>

              <div className="contact-form-group">
                <label>Social #3:</label>
                <AutoResizeInput
                  name="social3"
                  value={formData.social3}
                  onChange={handleChange}
                  placeholder="Social media link"
                />
              </div>

              <div className="contact-form-group">
                <label>Social #4:</label>
                <AutoResizeInput
                  name="social4"
                  value={formData.social4}
                  onChange={handleChange}
                  placeholder="Social media link"
                />
              </div>
            </div>
          </div>

          <div className="contact-form-group bio-field">
            <label>Bio:</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Enter bio"
              rows="4"
            />
          </div>

          <div className="contact-modal-buttons">
            <button type="submit" className="crud-button crud-save">
              {mode === 'add' ? 'Add Contact' : 'Save Changes'}
            </button>
            <button type="button" className="crud-button crud-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;