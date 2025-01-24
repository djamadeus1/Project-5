import React from 'react';

function ContactDetails({ contact, onEdit, onDelete }) {
  if (!contact) {
    return <div className="contact-details-empty">Select a contact to view details</div>;
  }

  return (
    <div className="contact-details">
      <div className="contact-pic-square">
        <img 
          src={contact.contact_pic ? 
            `http://127.0.0.1:5555${contact.contact_pic}` : 
            "https://via.placeholder.com/150"
          }
          alt={contact.name}
          className="contact-picture"
        />
      </div>
      
      <div className="contact-background">
        <div className="track-contact-info-square">
          <h2>{contact.name}</h2>
          <div className="contact-info-grid">
            <p><strong>Email:</strong> {contact.email}</p>
            <p><strong>Phone:</strong> {contact.phone}</p>
            <p><strong>Company:</strong> {contact.company}</p>
            <p><strong>Discipline:</strong> {contact.discipline}</p>
          </div>
        </div>
      </div>

      <div className="contact-detail-actions">
        <button onClick={() => onEdit(contact)}>Edit</button>
        <button onClick={() => onDelete(contact.id)}>Delete</button>
      </div>
    </div>
  );
}

export default ContactDetails;